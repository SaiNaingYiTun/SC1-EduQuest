import { useState, useEffect } from 'react';

export default function CourseManagement({ user, authFetch, onCoursesChange }) {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState('');
  const [newSection, setNewSection] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editSection, setEditSection] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await authFetch(`/api/teachers/${user.id}/courses`);
      const data = await res.json();
      setCourses(data);
    };
    fetchCourses();
  }, [user.id, authFetch]);

  const handleAddCourse = async () => {
    if (!newCourse.trim() || !newSection.trim()) return;
    const res = await authFetch(`/api/teachers/${user.id}/courses`, {
      method: 'POST',
      body: JSON.stringify({ name: newCourse, section: newSection }),
    });
    const data = await res.json();
    setCourses([...courses, data]);
    setNewCourse('');
    setNewSection('');
    onCoursesChange && onCoursesChange([...courses, data]);
  };

  const handleDeleteCourse = async (courseId) => {
    await authFetch(`/api/teachers/${user.id}/courses/${courseId}`, { method: 'DELETE' });
    const updated = courses.filter((c) => c._id !== courseId);
    setCourses(updated);
    onCoursesChange && onCoursesChange(updated);
    if (selectedCourse && selectedCourse._id === courseId) setSelectedCourse(null);
  };

  const handleEditCourse = async (courseId) => {
    await authFetch(`/api/teachers/${user.id}/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: editValue, section: editSection }),
    });
    const updated = courses.map((c, idx) =>
      idx === editingIndex ? { ...c, name: editValue, section: editSection } : c
    );
    setCourses(updated);
    setEditingIndex(null);
    setEditValue('');
    setEditSection('');
    onCoursesChange && onCoursesChange(updated);
  };

  // Fetch students for the selected course
  useEffect(() => {
    if (!selectedCourse) return;
    setLoadingStudents(true);
    authFetch('/api/users?role=student')
      .then(res => res.json())
      .then(data => {
        // Assume each student has a studentClasses array of teacher IDs or course IDs
        const filtered = data.filter(
          stu =>
            Array.isArray(stu.studentClasses) &&
            (stu.studentClasses.includes(selectedCourse.teacherId) ||
             stu.studentClasses.includes(selectedCourse._id))
        );
        setStudents(filtered);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [selectedCourse, authFetch]);

  // Helper to extract code, section, and color from course name
  function parseCourse(course) {
    // Example: "CSX3007 COMPUTER ARCHITECTURE"
    const codeMatch = course.name.match(/^([A-Z]+\d+)/);
    return {
      code: codeMatch ? codeMatch[1] : course.name,
      color: pickColor(course.name),
      name: course.name.replace(/^([A-Z]+\d+)\s*/, '').trim(),
      section: course.section || course.sectionNumber || ''
    };
  }

  // Pick a color based on course code or name
  function pickColor(name) {
    const colors = ['amber', 'pink', 'blue', 'green', 'purple', 'red', 'teal'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6">
      {/* Add Course Card */}
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6 mb-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Add New Course
        </h3>
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
            className="bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow hover:scale-105 transition"
          >
            + Add Course
          </button>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        {courses.length === 0 ? (
          <div className="bg-white/80 rounded-xl p-10 text-center border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              You haven’t created any courses yet.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {courses.map((course, idx) => {
              const { code, section, color, name } = parseCourse(course);
              return (
                <div
                  key={course._id}
                  className={`bg-white rounded-2xl shadow-md border border-gray-200 p-5 hover:shadow-xl transition cursor-pointer`}
                  onClick={() => setSelectedCourse(course)}
                >
                  {editingIndex === idx ? (
                    <>
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-400 mb-2"
                        placeholder="Course name"
                      />
                      <input
                        value={editSection}
                        onChange={(e) => setEditSection(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-400 mb-2"
                        placeholder="Section"
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleEditCourse(course._id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center bg-${color}-500 text-white font-bold text-lg`}>
                          {code.match(/[A-Z]+/)?.[0] || code}
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 truncate">
                        {course.name} ({section})
                      </h4>
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setEditingIndex(idx);
                            setEditValue(course.name);
                            setEditSection(course.section || '');
                          }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl"
                        >
                          Edit
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteCourse(course._id);
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail view for selected course */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              onClick={() => setSelectedCourse(null)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-2">
              {selectedCourse.name} ({selectedCourse.section})
            </h3>
            <div className="mb-4 text-gray-600">
              <span className="font-semibold">Section:</span> {selectedCourse.section}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Course ID:</span> {selectedCourse._id}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Members:</span>
              <ul className="mt-2 space-y-1">
                {loadingStudents ? (
                  <li className="text-gray-400">Loading...</li>
                ) : students.length === 0 ? (
                  <li className="text-gray-400">No students enrolled.</li>
                ) : (
                  students.map(stu => (
                    <li key={stu._id} className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-200 px-2 py-1 text-xs font-bold text-amber-800">
                        {stu.name || stu.username}
                      </span>
                      <span className="text-gray-500 text-xs">{stu.email}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}