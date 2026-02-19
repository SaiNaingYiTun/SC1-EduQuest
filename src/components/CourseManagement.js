import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import {
  COURSE_STATUS,
  COURSE_STATUS_COLORS,
  COURSE_STATUS_DISPLAY,
  COURSE_STATUS_MESSAGES
} from "../components/courseStatus";

export default function CourseManagement({ user, authFetch, onCoursesChange, onAfterCourseChange }) {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [newSection, setNewSection] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);

  // For real counts + detail members
  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Edit modal state
  const [editingCourse, setEditingCourse] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editSection, setEditSection] = useState("");

  // 1) Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      const res = await authFetch(`/api/teachers/${user.id}/courses`);
      if (res.status === 401) {
        setCourses([]);
        return;
      }
      const data = await res.json();
      const next = Array.isArray(data) ? data : [];
      setCourses(next);
      onCoursesChange?.(next);
    };
    fetchCourses();
  }, [user.id, authFetch, onCoursesChange]);

  // 2) Fetch all students once (for counts + course members)
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await authFetch("/api/users?role=student");
        const data = await res.json();
        setAllStudents(Array.isArray(data) ? data : []);
      } catch {
        setAllStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [authFetch]);

  // Build courseId -> count
  const courseCounts = useMemo(() => {
    const map = {};
    for (const stu of allStudents) {
      const ids = Array.isArray(stu.studentClasses) ? stu.studentClasses : [];
      for (const cid of ids) {
        const key = String(cid);
        map[key] = (map[key] || 0) + 1;
      }
    }
    return map;
  }, [allStudents]);

  // Members list for selected course
  const selectedCourseStudents = useMemo(() => {
    if (!selectedCourse) return [];
    const courseId = String(selectedCourse._id);
    return allStudents.filter(
      (stu) =>
        Array.isArray(stu.studentClasses) &&
        stu.studentClasses.map(String).includes(courseId)
    );
  }, [allStudents, selectedCourse]);

  const handleAddCourse = async () => {
    if (!newCourse.trim() || !newSection.trim()) return;

    const res = await authFetch(`/api/teachers/${user.id}/courses`, {
      method: "POST",
      body: JSON.stringify({ name: newCourse.trim(), section: newSection.trim() }),
    });
    const data = await res.json();

    const updated = [...courses, data];
    setCourses(updated);
    setNewCourse("");
    setNewSection("");
    onCoursesChange?.(updated);
  };

  const handleDeleteCourse = async (courseId) => {
    await authFetch(`/api/teachers/${user.id}/courses/${courseId}`, { method: "DELETE" });

    const updated = courses.filter((c) => c._id !== courseId);
    setCourses(updated);
    onCoursesChange?.(updated);
    await onAfterCourseChange?.();
    if (selectedCourse?._id === courseId) setSelectedCourse(null);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setEditValue(course.name || "");
    setEditSection(course.section || "");
  };

  const closeEdit = () => {
    setEditingCourse(null);
    setEditValue("");
    setEditSection("");
  };

  const handleEditSave = async () => {
    if (!editingCourse) return;
    const courseId = editingCourse._id;

    await authFetch(`/api/teachers/${user.id}/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify({ name: editValue.trim(), section: editSection.trim() }),
    });

    const updated = courses.map((c) =>
      c._id === courseId ? { ...c, name: editValue.trim(), section: editSection.trim() } : c
    );

    setCourses(updated);
    onCoursesChange?.(updated);

    if (selectedCourse?._id === courseId) {
      setSelectedCourse((prev) => ({ ...prev, name: editValue.trim(), section: editSection.trim() }));
    }

    closeEdit();
  };

  // Helper: color from course name
  function pickColor(name = "") {
    const colors = ["amber", "pink", "blue", "green", "purple", "red", "teal"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  }

  const colorClass = {
    amber: "bg-amber-500",
    pink: "bg-pink-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    teal: "bg-teal-500",
  };

  const studentsPill = (color) => {
    const base =
      color === "pink"
        ? "bg-pink-500/15 text-pink-200 border-pink-500/30"
        : color === "blue"
          ? "bg-blue-500/15 text-blue-200 border-blue-500/30"
          : color === "green"
            ? "bg-green-500/15 text-green-200 border-green-500/30"
            : color === "purple"
              ? "bg-purple-500/15 text-purple-200 border-purple-500/30"
              : color === "red"
                ? "bg-red-500/15 text-red-200 border-red-500/30"
                : color === "teal"
                  ? "bg-teal-500/15 text-teal-200 border-teal-500/30"
                  : "bg-amber-500/15 text-amber-200 border-amber-500/30";
    return base;
  };

  const statusColors = COURSE_STATUS_COLORS;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-6 pb-16">
      {/* Page title row */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Courses
          </div>
          <div className="text-sm text-white/60 mt-1">
            Create courses, edit details, and manage enrollment.
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Total courses: <span className="ml-1 text-white font-semibold">{courses.length}</span>
          </span>
        </div>
      </div>

      {/* Add Course (dark glass) */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/45 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] p-6 mb-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white">Add New Course</h3>
          <span className="text-xs text-white/50">Name + Section required</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            placeholder="Enter course name"
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/40"
          />
          <input
            type="text"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="Section"
            className="w-full sm:w-40 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/40"
          />
          <button
            onClick={handleAddCourse}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600
                       text-white font-semibold px-7 py-3 rounded-full shadow-lg shadow-amber-500/20
                       hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.99] transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      {/* Courses grid */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center">
          <p className="text-white/70 text-lg">You haven't created any courses yet.</p>
          <p className="text-white/40 text-sm mt-2">Use the form above to create your first course.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {courses.map((course) => {
            const color = pickColor(course?.name || "");
            const count = courseCounts[String(course._id)] || 0;
            const status = course.status || COURSE_STATUS.PENDING;

            return (
              <div
                key={course._id}
                onClick={() => setSelectedCourse(course)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10
                           bg-slate-950/45 backdrop-blur-xl shadow-[0_18px_60px_-24px_rgba(0,0,0,0.75)]
                           hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
              >
                {/* top bar */}
                <div className="h-12 bg-gradient-to-r from-slate-900 to-slate-950 relative">
                  {/* initials bubble */}
                  <div
                    className={`absolute -bottom-5 right-4 w-11 h-11 rounded-full ${colorClass[color]}
                                text-white flex items-center justify-center font-bold shadow-lg
                                border-4 border-slate-900`}
                  >
                    {(course?.name?.[0] || "C").toUpperCase()}
                    {(course?.name?.[1] || "").toUpperCase()}
                  </div>
                </div>

                <div className="p-5 pt-7 relative">
                  {/* vertical color line */}
                  <div className={`absolute left-0 top-6 bottom-6 w-1.5 ${colorClass[color]} rounded-r`} />

                  <div className="pl-4">
                    <div className="text-xl sm:text-2xl font-extrabold tracking-wide text-white">
                      {course.name}
                    </div>
                    <div className="text-sm text-white/60 mt-2">
                      SECTION {course.section || "-"}
                    </div>

                    {/* Status badge */}
                    <div
                      className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold
                      ${statusColors[status].bg} ${statusColors[status].text}`}
                    >
                      {COURSE_STATUS_DISPLAY[status]}
                    </div>

                    {status === COURSE_STATUS.REJECTED && course.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-200">
                        <strong>Rejection reason:</strong> {course.rejectionReason}
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between gap-3">
                      {/* students pill (only show if approved) */}
                      {status === COURSE_STATUS.APPROVED ? (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border
                                      ${studentsPill(color)}`}
                        >
                          <Users className="w-4 h-4" />
                          {loadingStudents ? "…" : count}
                        </div>
                      ) : (
                        <div className="text-xs text-white/40">
                          {COURSE_STATUS_MESSAGES[status]}
                        </div>
                      )}

                      {/* actions */}
                      <div className="flex gap-2">
                        {status !== COURSE_STATUS.REJECTED && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(course);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                                       bg-blue-500/15 text-blue-200 border border-blue-500/25
                                       hover:bg-blue-500/25 transition"
                            type="button"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course._id);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                                     bg-red-500/15 text-red-200 border border-red-500/25
                                     hover:bg-red-500/25 transition"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* subtle hint */}
                    <div className="mt-4 text-xs text-white/30">
                      Click card to view members
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course detail modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-lg w-full p-7 shadow-2xl relative
                          border border-white/10 bg-slate-950/70 backdrop-blur-xl text-white">
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-red-300"
              onClick={() => setSelectedCourse(null)}
              type="button"
            >
              ✕
            </button>

            <h3 className="text-2xl font-extrabold mb-1">
              {selectedCourse.name}{" "}
              {selectedCourse.section ? (
                <span className="text-white/60 font-semibold">({selectedCourse.section})</span>
              ) : null}
            </h3>

            <div className="mb-4 text-white/70">
              <span className="font-semibold text-white">Students:</span>{" "}
              {loadingStudents ? "Loading..." : selectedCourseStudents.length}
            </div>

            <div className="mb-2 font-semibold text-white">Members</div>
            <ul className="space-y-2 max-h-60 overflow-auto pr-1">
              {loadingStudents ? (
                <li className="text-white/40">Loading...</li>
              ) : selectedCourseStudents.length === 0 ? (
                <li className="text-white/40">No students enrolled.</li>
              ) : (
                selectedCourseStudents.map((stu) => (
                  <li
                    key={stu._id}
                    className="flex items-center justify-between gap-3 rounded-xl
                               border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-white">
                      {stu.name || stu.username}
                    </span>
                    <span className="text-xs text-white/60">{stu.email}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-md w-full p-6 shadow-2xl relative
                          border border-white/10 bg-slate-950/70 backdrop-blur-xl text-white">
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-red-300"
              onClick={closeEdit}
              type="button"
            >
              ✕
            </button>

            <h3 className="text-xl font-extrabold mb-4">Edit Course</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/70">Course name</label>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white
                             focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Section</label>
                <input
                  value={editSection}
                  onChange={(e) => setEditSection(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white
                             focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-full border border-white/15 text-white/80 hover:bg-white/5"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600
                             text-white font-semibold hover:opacity-95"
                  type="button"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
