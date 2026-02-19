import { useEffect, useMemo, useState } from "react";
import AdminReportsTab from './AdminReportsTab';
import { COURSE_STATUS, COURSE_STATUS_COLORS, COURSE_STATUS_DISPLAY, COURSE_STATUS_MESSAGES } from '../components/courseStatus';


export default function AdminDashboard({ user, authFetch, onLogout, go }) {
  const [tab, setTab] = useState("all"); // all | student | teacher | admin
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('name');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const url =
        tab === "all" ? "/api/admin/users" : `/api/admin/users?role=${tab}`;
      const res = await authFetch(url);

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        onLogout();
        go("/", "role");
        return;
      }
      if (res.status === 403) {
        alert("Access denied (admin only).");
        go("/", "role");
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load users");
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // filter users client-side by searchQuery + searchField
  const filteredUsers = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      if (searchField === "name") {
        return (
          (u.name || "").toLowerCase().includes(q) ||
          (u.username || "").toLowerCase().includes(q)
        );
      }
      if (searchField === "username") {
        return (u.username || "").toLowerCase().includes(q);
      }
      if (searchField === "email") {
        return (u.email || "").toLowerCase().includes(q);
      }
      if (searchField === "subject") {
        return (
          (u.subjectName || u.subject || "").toLowerCase().includes(q) ||
          (u.subjects || []).join(" ").toLowerCase().includes(q)
        );
      }
      return false;
    });
  }, [users, searchQuery, searchField]);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    // reset to first page when tab changes or users list refresh
    // (keeping page in deps would run on every page change; only run when users length or tab changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredUsers.length, totalPages, tab]);

  useEffect(() => {
    // whenever search or field changes, reset to page 1
    setPage(1);
  }, [searchQuery, searchField, tab]);

  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const students = users.filter((u) => u.role === "student").length;
    const teachers = users.filter((u) => u.role === "teacher").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { students, teachers, admins, total: users.length };
  }, [users]);

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setModalOpen(true);
  };

  const deleteUser = async (u) => {
    const confirmDel = window.confirm(`Delete user "${u.username}" (${u.role})? This cannot be undone.`);
    if (!confirmDel) return;

    try {
      const id = u._id || u.id;
      const res = await authFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Admin delete failed:', res.status, data);
        alert(data.message || 'Failed to delete user');
        return;
      }

      // success — refresh list
      await loadUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      alert(err.message || 'Failed to delete user');
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <h1 className="text-2xl font-bold text-red-400">Access denied</h1>
        <p className="text-slate-300 mt-2">Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top bar */}
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-slate-300">
              Logged in as <span className="text-slate-100">{user.username}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadUsers}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                onLogout();
                go("/", "role");
              }}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Students" value={stats.students} />
          <StatCard label="Teachers" value={stats.teachers} />
          <StatCard label="Admins" value={stats.admins} />
        </div>

        {/* Tabs + actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <TabButton active={tab === "all"} onClick={() => setTab("all")}>All</TabButton>
            <TabButton active={tab === "student"} onClick={() => setTab("student")}>Students</TabButton>
            <TabButton active={tab === "teacher"} onClick={() => setTab("teacher")}>Teachers</TabButton>
            <TabButton active={tab === "admin"} onClick={() => setTab("admin")}>Admins</TabButton>
            <TabButton active={tab === "courses"} onClick={() => setTab("courses")}>Courses</TabButton>
            <TabButton active={tab === "reports"} onClick={() => setTab("reports")}>Reports</TabButton>



            <div className="ml-4 flex items-center gap-2">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="px-2 py-1 bg-slate-800 rounded"
              >
                <option value="name">Name / Username</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="subject">Subject</option>
              </select>

              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="px-3 py-1 rounded bg-slate-800 outline-none"
              />

              <button
                onClick={() => { setSearchQuery(""); setSearchField("name"); }}
                className="px-2 py-1 bg-slate-700 rounded"
                title="Clear"
              >
                Clear
              </button>
            </div>
          </div>

          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition"
          >
            + Create User
          </button>
        </div>

        {/* Conditional rendering: show table for users, or courses tab */}
        {tab !== "courses" && tab !== "reports" ? (
          // EXISTING USER TABLE
          <div className="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="font-semibold">Users</div>
              <div className="text-sm text-slate-300">
                {loading ? "Loading..." : `${users.length} record(s)`}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/60 text-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3">Username</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Subject</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-4 text-slate-300" colSpan={6}>
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-slate-300" colSpan={6}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    pagedUsers.map((u) => (
                      <tr
                        key={u._id}
                        className="border-t border-slate-800 hover:bg-slate-900/40"
                      >
                        <td className="px-4 py-3">{u.username}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded bg-slate-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.subjectName || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(u)}
                              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUser(u)}
                              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-300">
                Showing {filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-slate-800 disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded ${p === page ? 'bg-amber-500 text-black' : 'bg-slate-800'}`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-slate-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : tab === "courses" ? (
          // COURSES TAB
          <CourseManagementTab authFetch={authFetch} toast={(msg, type) => console.log(msg)} />
        ) : (
          // REPORTS TAB
          <AdminReportsTab authFetch={authFetch} toast={(msg, type) => console.log(msg)} />
        )}


        {modalOpen && (
          <UserModal
            editingUser={editingUser}
            onClose={() => setModalOpen(false)}
            onSaved={async () => {
              setModalOpen(false);
              await loadUsers();
            }}
            authFetch={authFetch}
          />
        )}
      </div>
    </div>
  );
}

function UserModal({ editingUser, onClose, onSaved, authFetch }) {
  const isEdit = !!editingUser;

  const [username, setUsername] = useState(editingUser?.username || "");
  const [email, setEmail] = useState(editingUser?.email || "");
  const [name, setName] = useState(editingUser?.name || "");
  const [role, setRole] = useState(editingUser?.role || "student");
  const [subjectName, setSubjectName] = useState(editingUser?.subjectName || "");
  const [password, setPassword] = useState(""); // optional (reset)

  const save = async () => {
    if (!username.trim() || !email.trim() || !role.trim()) {
      alert("username, email, role are required");
      return;
    }
    if (!isEdit && !password.trim()) {
      alert("password is required to create a new user");
      return;
    }

    const payload = {
      username,
      email,
      name,
      role,
      ...(role === "teacher" ? { subjectName } : {}),
      ...(password.trim() ? { password } : {})
    };

    try {
      const url = isEdit
        ? `/api/admin/users/${editingUser._id}`
        : "/api/admin/users";

      const res = await authFetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save failed");
      }

      await onSaved();
    } catch (e) {
      console.error(e);
      alert(e.message || "Save failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{isEdit ? "Edit User" : "Create User"}</h2>
            <p className="text-sm text-slate-300">
              {isEdit ? "Update fields. Password is optional (reset)." : "Create a new account."}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Username">
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Name">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Role">
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">admin</option>
            </select>
          </Field>

          {role === "teacher" && (
            <Field label="Subject (teachers only)">
              <input
                className="input"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="My Subject"
              />
            </Field>
          )}

          <Field label={isEdit ? "Reset Password (optional)" : "Password"}>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "Leave empty to keep unchanged" : "Set initial password"}
            />
          </Field>
        </div>

        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700">
            Cancel
          </button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400">
            {isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.75rem;
          background: rgb(2 6 23 / 0.8);
          border: 1px solid rgb(51 65 85);
          outline: none;
          color: white;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-300 mb-1">{label}</div>
      {children}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition ${active
        ? "bg-amber-500 text-black font-semibold"
        : "bg-slate-800 hover:bg-slate-700"
        }`}
    >
      {children}
    </button>
  );
}



function CourseManagementTab({ authFetch, toast }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingCourse, setRejectingCourse] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState(COURSE_STATUS.PENDING); // pending | approved | rejected | all

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/courses');
      if (!res.ok) throw new Error('Failed to load courses');
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCourses([]);
      toast?.(err.message || 'Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = filterStatus === 'all'
    ? courses
    : courses.filter(c => c.status === filterStatus);

  const handleApprove = async (courseId) => {
    try {
      const res = await authFetch(`/api/admin/courses/${courseId}/approve`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to approve course');
      await loadCourses();
      toast?.('Course approved successfully', 'success');
    } catch (err) {
      console.error(err);
      toast?.(err.message || 'Failed to approve course', 'error');
    }
  };

  const handleOpenRejectModal = (course) => {
    setRejectingCourse(course);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectingCourse || !rejectReason.trim()) {
      toast?.('Rejection reason is required', 'error');
      return;
    }
    try {
      const res = await authFetch(
        `/api/admin/courses/${rejectingCourse._id}/reject`,
        {
          method: 'PUT',
          body: JSON.stringify({ reason: rejectReason.trim() })
        }
      );
      if (!res.ok) throw new Error('Failed to reject course');
      await loadCourses();
      setRejectingCourse(null);
      setRejectReason('');
      toast?.('Course rejected', 'success');
    } catch (err) {
      console.error(err);
      toast?.(err.message || 'Failed to reject course', 'error');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course? This will remove all associated quests and enrollments.')) return;
    try {
      const res = await authFetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete course');
      await loadCourses();
      toast?.('Course deleted', 'success');
    } catch (err) {
      console.error(err);
      toast?.(err.message || 'Failed to delete course', 'error');
    }
  };

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus(COURSE_STATUS.PENDING)}
          className={`px-4 py-2 rounded-lg transition ${filterStatus === COURSE_STATUS.PENDING
            ? 'bg-yellow-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700'
            }`}
        >
          Pending ({courses.filter(c => c.status === COURSE_STATUS.PENDING).length})
        </button>
        <button
          onClick={() => setFilterStatus(COURSE_STATUS.APPROVED)}
          className={`px-4 py-2 rounded-lg transition ${filterStatus === COURSE_STATUS.APPROVED
            ? 'bg-green-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700'
            }`}
        >
          Approved ({courses.filter(c => c.status === COURSE_STATUS.APPROVED).length})
        </button>
        <button
          onClick={() => setFilterStatus(COURSE_STATUS.REJECTED)}
          className={`px-4 py-2 rounded-lg transition ${filterStatus === COURSE_STATUS.REJECTED
            ? 'bg-red-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700'
            }`}
        >
          Rejected ({courses.filter(c => c.status === COURSE_STATUS.REJECTED).length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg transition ${filterStatus === 'all'
            ? 'bg-amber-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700'
            }`}
        >
          All ({courses.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="font-semibold">Courses</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60 text-slate-200">
              <tr>
                <th className="text-left px-4 py-3">Course Name</th>
                <th className="text-left px-4 py-3">Section</th>
                <th className="text-left px-4 py-3">Teacher</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-300" colSpan={6}>
                    Loading courses...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-300" colSpan={6}>
                    No courses found.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id} className="border-t border-slate-800 hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold">{course.name}</td>
                    <td className="px-4 py-3">{course.section || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      <div>{course.teacherName}</div>
                      <div className="text-xs text-slate-400">{course.teacherEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${course.status === 'pending'
                          ? 'bg-yellow-500 text-yellow-900'
                          : course.status === 'approved'
                            ? 'bg-green-500 text-green-900'
                            : 'bg-red-500 text-red-900'
                          }`}
                      >
                        {(course.status || 'pending').charAt(0).toUpperCase() + (course.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {course.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(course._id)}
                              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(course)}
                              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Reject Course</h2>
            <p className="text-slate-300 mb-4">
              Rejecting: <strong>{rejectingCourse.name}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (required)..."
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-slate-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectingCourse(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
