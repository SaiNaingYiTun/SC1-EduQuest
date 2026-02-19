import { useState, useEffect } from 'react';

export default function AdminReportsTab({ authFetch, toast }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/reports');
      if (!res.ok) throw new Error('Failed to load reports');
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast?.(err.message || 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReports = filterStatus === 'all'
    ? reports
    : reports.filter(r => r.status === filterStatus);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const res = await authFetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, adminNotes })
      });
      if (!res.ok) throw new Error('Failed to update report');
      await loadReports();
      setSelectedReport(null);
      setAdminNotes('');
      toast?.('Report updated successfully', 'success');
    } catch (err) {
      console.error(err);
      toast?.(err.message || 'Failed to update report', 'error');
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'conduct': 'Inappropriate Conduct',
      'unfair': 'Unfair Treatment',
      'inappropriate': 'Inappropriate Content',
      'other': 'Other'
    };
    return labels[category] || category;
  };

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg transition ${filterStatus === 'pending'
            ? 'bg-yellow-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700'
            }`}
        >
          Pending ({reports.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterStatus('reviewed')}
          className={`px-4 py-2 rounded-lg transition ${filterStatus === 'reviewed'
            ? 'bg-blue-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700'
            }`}
        >
          Reviewed ({reports.filter(r => r.status === 'reviewed').length})
        </button>
        <button
          onClick={() => setFilterStatus('resolved')}
          className={`px-4 py-2 rounded-lg transition ${filterStatus === 'resolved'
            ? 'bg-green-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700'
            }`}
        >
          Resolved ({reports.filter(r => r.status === 'resolved').length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg transition ${filterStatus === 'all'
            ? 'bg-amber-500 text-white'
            : 'bg-slate-800 hover:bg-slate-700'
            }`}
        >
          All ({reports.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="font-semibold">Teacher Reports</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60 text-slate-200">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Student</th>
                <th className="text-left px-4 py-3">Teacher</th>
                <th className="text-left px-4 py-3">Course</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-300" colSpan={8}>
                    Loading reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-300" colSpan={8}>
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id} className="border-t border-slate-800 hover:bg-slate-900/40">
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div>{report.reporterName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-red-300">{report.teacherName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {report.courseName || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">
                        {getCategoryLabel(report.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{report.subject}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${report.status === 'pending'
                          ? 'bg-yellow-500 text-yellow-900'
                          : report.status === 'reviewed'
                            ? 'bg-blue-500 text-blue-900'
                            : 'bg-green-500 text-green-900'
                          }`}
                      >
                        {(report.status || 'pending').charAt(0).toUpperCase() + (report.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes(report.adminNotes || '');
                        }}
                        className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl p-6 my-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Report Details</h2>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setAdminNotes('');
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded">
                  <div className="text-xs text-slate-400 mb-1">Reported By</div>
                  <div className="font-semibold">{selectedReport.reporterName}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded">
                  <div className="text-xs text-slate-400 mb-1">Teacher Reported</div>
                  <div className="font-semibold text-red-300">{selectedReport.teacherName}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded">
                  <div className="text-xs text-slate-400 mb-1">Course</div>
                  <div>{selectedReport.courseName || 'N/A'}</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded">
                  <div className="text-xs text-slate-400 mb-1">Category</div>
                  <div>{getCategoryLabel(selectedReport.category)}</div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded">
                <div className="text-xs text-slate-400 mb-1">Subject</div>
                <div className="font-semibold">{selectedReport.subject}</div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded">
                <div className="text-xs text-slate-400 mb-2">Description</div>
                <div className="text-sm whitespace-pre-wrap">{selectedReport.description}</div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded">
                <div className="text-xs text-slate-400 mb-1">Date Submitted</div>
                <div>{new Date(selectedReport.createdAt).toLocaleString()}</div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-slate-500"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
                {selectedReport.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'reviewed')}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition"
                    >
                      Mark as Resolved
                    </button>
                  </>
                )}
                {selectedReport.status === 'reviewed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition"
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setAdminNotes('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}