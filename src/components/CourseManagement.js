import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { COURSE_STATUS, COURSE_STATUS_COLORS, COURSE_STATUS_DISPLAY, COURSE_STATUS_MESSAGES } from '../components/courseStatus';

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
  }, [user.id, authFetch]);

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
      (stu) => Array.isArray(stu.studentClasses) && stu.studentClasses.map(String).includes(courseId)
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

    // If detail modal open for same course, update it too
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
        ? "bg-pink-100 text-pink-700"
        : color === "blue"
          ? "bg-blue-100 text-blue-700"
          : color === "green"
            ? "bg-green-100 text-green-700"
            : color === "purple"
              ? "bg-purple-100 text-purple-700"
              : color === "red"
                ? "bg-red-100 text-red-700"
                : color === "teal"
                  ? "bg-teal-100 text-teal-700"
                  : "bg-amber-100 text-amber-700";
    return base;
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6">
      {/* Add Course */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6 mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Course</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            placeholder="Enter course name"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <input
            type="text"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="Section"
            className="w-32 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            onClick={handleAddCourse}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold px-7 py-3 rounded-full shadow hover:shadow-amber-500/30 hover:scale-[1.02] transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      {/* Courses grid */}
      {courses.length === 0 ? (
        <div className="bg-white/80 rounded-xl p-10 text-center border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">You haven't created any courses yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {courses.map((course) => {
            const color = pickColor(course?.name || "");
            const count = courseCounts[String(course._id)] || 0;

            const statusColors = COURSE_STATUS_COLORS;

            return (
              <div
                key={course._id}
                onClick={() => setSelectedCourse(course)}
                className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg border border-black/5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* top bar */}
                <div className="h-12 bg-neutral-900 relative">
                  {/* initials bubble */}
                  <div
                    className={`absolute -bottom-5 right-4 w-11 h-11 rounded-full ${colorClass[color]
                      } text-white flex items-center justify-center font-bold shadow-lg border-4 border-white`}
                  >
                    {(course?.name?.[0] || "C").toUpperCase()}
                    {(course?.name?.[1] || "").toUpperCase()}
                  </div>
                </div>

                <div className="p-5 pt-7 relative">
                  {/* vertical color line */}
                  <div className={`absolute left-0 top-6 bottom-6 w-1.5 ${colorClass[color]} rounded-r`} />

                  <div className="pl-4">
                    <div className="text-2xl font-extrabold tracking-wide text-neutral-900">
                      {course.name}
                    </div>
                    <div className="text-sm text-neutral-500 mt-2">
                      SECTION {course.section || "-"}
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[course.status || COURSE_STATUS.PENDING].bg} ${statusColors[course.status || COURSE_STATUS.PENDING].text}`}>
                      {COURSE_STATUS_DISPLAY[course.status || COURSE_STATUS.PENDING]}
                    </div>

                    {course.status === COURSE_STATUS.REJECTED && course.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        <strong>Rejection reason:</strong> {course.rejectionReason}
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between">
                      {/* students pill (only show if approved) */}
                      {course.status === COURSE_STATUS.APPROVED ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${studentsPill(color)}`}>
                          <Users className="w-4 h-4" />
                          {loadingStudents ? "…" : count}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">
                          {COURSE_STATUS_MESSAGES[course.status || COURSE_STATUS.PENDING]}
                        </div>
                      )}

                      {/* actions */}
                      <div className="flex gap-2">
                        {course.status !== COURSE_STATUS.REJECTED && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(course);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
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
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course detail modal (OTP REMOVED) */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              onClick={() => setSelectedCourse(null)}
              type="button"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-2">
              {selectedCourse.name} {selectedCourse.section ? `(${selectedCourse.section})` : ""}
            </h3>

            <div className="mb-4 text-gray-600">
              <span className="font-semibold">Students:</span>{" "}
              {loadingStudents ? "Loading..." : selectedCourseStudents.length}
            </div>

            <div className="mb-2 font-semibold text-gray-800">Members</div>
            <ul className="space-y-2 max-h-60 overflow-auto pr-1">
              {loadingStudents ? (
                <li className="text-gray-400">Loading...</li>
              ) : selectedCourseStudents.length === 0 ? (
                <li className="text-gray-400">No students enrolled.</li>
              ) : (
                selectedCourseStudents.map((stu) => (
                  <li key={stu._id} className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-gray-800">
                      {stu.name || stu.username}
                    </span>
                    <span className="text-xs text-gray-500">{stu.email}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Edit modal (THIS is what makes Edit work) */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              onClick={closeEdit}
              type="button"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-4">Edit Course</h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Course name</label>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Section</label>
                <input
                  value={editSection}
                  onChange={(e) => setEditSection(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:opacity-95"
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
