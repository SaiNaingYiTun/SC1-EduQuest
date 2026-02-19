import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useToast } from '../App';

const REPORT_CATEGORIES = [
  { value: 'conduct', label: 'Inappropriate Conduct' },
  { value: 'unfair', label: 'Unfair Treatment' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'other', label: 'Other' }
];

export default function ReportTeacherModal({ teacher, course, student, onClose, onReportSubmitted }) {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !subject.trim() || !description.trim()) {
      toast('Please fill in all fields', 'error');
      return;
    }

    if (description.length < 20) {
      toast('Description must be at least 20 characters', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          reporterId: student.id,
          reporterName: student.name,
          teacherId: teacher.id,
          teacherName: teacher.name,
          courseId: course?._id,
          courseName: course?.name,
          category,
          subject,
          description
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit report');
      }

      toast('Report submitted successfully', 'success');
      onReportSubmitted?.();
      onClose();
    } catch (err) {
      console.error('Error submitting report:', err);
      toast('Failed to submit report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-800/90 to-blue-800/90 rounded-2xl border-2 border-purple-400/30 max-w-2xl w-full p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2 mb-2">
              <AlertCircle className="w-6 h-6" />
              Report Teacher
            </h2>
            <p className="text-purple-200 text-sm">
              Report issues or concerns about {teacher.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Info */}
          {course && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/20">
              <div className="text-sm text-purple-300 mb-1">Course</div>
              <div className="text-white font-semibold">{course.name}</div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-purple-100 font-semibold mb-3">
              Report Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="">Select a category...</option>
              {REPORT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-purple-100 font-semibold mb-3">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief subject of your report"
              maxLength={100}
              className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none"
            />
            <div className="text-xs text-purple-300 mt-1">
              {subject.length}/100
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-purple-100 font-semibold mb-3">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about your concern. Include dates and specific incidents if possible."
              rows={5}
              minLength={20}
              maxLength={1000}
              className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-400 focus:border-purple-400 focus:outline-none resize-none"
            />
            <div className="text-xs text-purple-300 mt-1">
              {description.length}/1000 (minimum 20 characters)
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4">
            <p className="text-sm text-amber-200">
              ⚠️ All reports are reviewed by administrators. False accusations may result in disciplinary action.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}