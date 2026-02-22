import { useState, useMemo } from "react";
import { Search, BookOpen, ShieldAlert, UsersRound } from "lucide-react";
import { useToast } from "../App";
import { COURSE_STATUS } from "./courseStatus";
import ReportTeacherModal from "./ReportTeacherModal";

export default function ClassesPage({
  user,
  studentClasses = [],
  teachers = [],
  onJoinClass,
  courses = [],
}) {
  const [teacherUsername, setTeacherUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingTeacher, setReportingTeacher] = useState(null);
  const [reportingCourse, setReportingCourse] = useState(null);

  const toast = useToast();

  const myCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        studentClasses.includes(String(course._id)) &&
        course.status === COURSE_STATUS.APPROVED
    );
  }, [courses, studentClasses]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!teacherUsername.trim() || !otp.trim()) {
      toast("Please fill in all fields", "error");
      return;
    }

    const success = onJoinClass(teacherUsername, otp);
    if (success) {
      toast("Successfully joined class!", "success");
      setTeacherUsername("");
      setOtp("");
      setShowJoinForm(false);
    }
  };

  const Panel = ({ children, className = "" }) => (
    <div
      className={
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md " +
        "shadow-[0_18px_60px_-30px_rgba(0,0,0,0.55)] " +
        className
      }
    >
      {children}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 pb-16">
      {/* Header row (match Inventory style) */}
      <div className="mt-10 mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-amber-300">My Classes</h1>
          <p className="text-sm text-white/60 mt-1">
            Join approved classes and view your enrolled courses.
          </p>
        </div>

        <div className="text-sm text-white/60 flex items-center gap-2">
          <UsersRound className="w-4 h-4" />
          <span>
            Enrolled: <span className="text-white font-semibold">{myCourses.length}</span>
          </span>
        </div>
      </div>

      {/* Main container (like Inventory) */}
      <Panel className="p-6">
        {/* top actions row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-white/70 text-sm">
            {myCourses.length === 0
              ? "You are not enrolled in any class yet."
              : "Your enrolled classes are shown below."}
          </div>

          <button
            onClick={() => setShowJoinForm((v) => !v)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                       bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold
                       hover:brightness-110 active:brightness-95 transition"
            type="button"
          >
            <Search className="w-4 h-4" />
            {showJoinForm ? "Close Join Form" : "Join New Class"}
          </button>
        </div>

        {/* join form */}
        {showJoinForm && (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <form onSubmit={handleJoin} className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={teacherUsername}
                onChange={(e) => setTeacherUsername(e.target.value)}
                className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white
                           placeholder:text-white/40 focus:outline-none focus:ring-2
                           focus:ring-amber-400/60"
                placeholder="Teacher Username"
              />

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white uppercase
                           placeholder:text-white/40 focus:outline-none focus:ring-2
                           focus:ring-amber-400/60"
                placeholder="OTP Code"
              />

              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30
                           text-emerald-100 font-semibold hover:bg-emerald-500/30 transition"
              >
                Join
              </button>
            </form>
          </div>
        )}

        {/* content area */}
        <div className="mt-6">
          {myCourses.length === 0 ? (
            <div className="py-14 text-center">
              <BookOpen className="w-14 h-14 mx-auto mb-4 text-white/25" />
              <h3 className="text-xl font-bold text-white mb-2">No Classes Yet</h3>
              <p className="text-white/55">
                Click <span className="text-amber-300 font-semibold">Join New Class</span> to enroll.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myCourses.map((course) => {
                const teacher = teachers.find((t) => t.id === course.teacherId);

                return (
                  <div
                    key={course._id}
                    className="rounded-2xl border border-white/10 bg-black/20
                               hover:bg-black/25 hover:border-white/20 transition"
                  >
                    {/* small top accent line (subtle like other pages) */}
                    <div className="h-1 rounded-t-2xl bg-gradient-to-r from-amber-400/70 to-purple-400/40" />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-extrabold text-white">
                            {course.name}
                          </div>
                          <div className="text-xs text-white/55 mt-1">
                            Section {course.section || "-"} • Approved
                          </div>
                        </div>

                        <div className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
                          Class
                        </div>
                      </div>

                      {teacher && (
                        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                          <div className="text-sm font-semibold text-white">{teacher.name}</div>
                          <div className="text-xs text-white/55">@{teacher.username}</div>
                        </div>
                      )}

                      {teacher && (
                        <button
                          onClick={() => {
                            setReportingTeacher(teacher);
                            setReportingCourse(course);
                            setShowReportModal(true);
                          }}
                          className="mt-4 w-full inline-flex items-center justify-center gap-2
                                     px-4 py-2.5 rounded-full
                                     bg-red-500/15 border border-red-500/25 text-red-200 font-semibold
                                     hover:bg-red-500/25 transition"
                          type="button"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Report Teacher
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Panel>

      {/* Report Teacher Modal */}
      {showReportModal && reportingTeacher && (
        <ReportTeacherModal
          teacher={reportingTeacher}
          course={reportingCourse}
          student={user}
          onClose={() => {
            setShowReportModal(false);
            setReportingTeacher(null);
            setReportingCourse(null);
          }}
          onReportSubmitted={() => {
            toast(
              "Report submitted successfully. Administrators will review it shortly.",
              "success"
            );
            setShowReportModal(false);
            setReportingTeacher(null);
            setReportingCourse(null);
          }}
        />
      )}
    </div>
  );
}
