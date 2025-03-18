import React from 'react';
import { Utensils, Dumbbell, Bed, Plus, Check, X } from 'lucide-react';

const ActivityLog = ({ userData, showLogForm, setShowLogForm, logEntry, setLogEntry, handleLogEntry }) => {
  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time) => {
    if (!time) return 'Not set';
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.padStart(2, '0')} ${period}`;
  };

  // Render log entries
  const renderLogEntries = () => {
    if (!userData || !userData.logEntries || userData.logEntries.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="text-slate-500 mb-4">No entries logged yet</div>
          <button
            onClick={() => setShowLogForm(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add your first entry
          </button>
        </div>
      );
    }

    // Group entries by date
    const entriesByDate = userData.logEntries.reduce((acc, entry) => {
      const date = entry.date || new Date(entry.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {});

    return (
      <div className="space-y-6 mt-4">
        {Object.entries(entriesByDate).map(([date, entries]) => (
          <div key={date} className="bg-white rounded-xl overflow-hidden shadow">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white font-medium">
              {date}
            </div>
            <div className="divide-y divide-slate-100">
              {entries.map((entry, i) => {
                let icon, color;

                if (entry.type === 'Meal') {
                  icon = <Utensils className="w-4 h-4" />;
                  color = "text-teal-500";
                } else if (entry.type === 'Workout') {
                  icon = <Dumbbell className="w-4 h-4" />;
                  color = "text-blue-500";
                } else if (entry.type === 'Sleep') {
                  icon = <Bed className="w-4 h-4" />;
                  color = "text-indigo-500";
                }

                return (
                  <div key={i} className="p-3 flex items-center">
                    <div className={`mr-3 ${color}`}>{icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.type}</div>
                      {entry.note && <div className="text-sm text-slate-500">{entry.note}</div>}
                    </div>
                    <div className="text-sm font-mono text-slate-600">
                      {convertTo12HourFormat(entry.time)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Log Entry Form */}
      {showLogForm && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Log Activity</h2>
            <form onSubmit={handleLogEntry} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Activity Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogEntry({ ...logEntry, type: 'Meal' })}
                    className={`p-3 flex flex-col items-center justify-center rounded-lg transition-all ${
                      logEntry.type === 'Meal'
                        ? 'bg-teal-50 border-2 border-teal-500 text-teal-600'
                        : 'border-2 border-slate-200 text-slate-600 hover:border-teal-200'
                    }`}
                  >
                    <Utensils className="w-5 h-5 mb-1" />
                    <span className="text-sm">Meal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogEntry({ ...logEntry, type: 'Workout' })}
                    className={`p-3 flex flex-col items-center justify-center rounded-lg transition-all ${
                      logEntry.type === 'Workout'
                        ? 'bg-blue-50 border-2 border-blue-500 text-blue-600'
                        : 'border-2 border-slate-200 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <Dumbbell className="w-5 h-5 mb-1" />
                    <span className="text-sm">Workout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogEntry({ ...logEntry, type: 'Sleep' })}
                    className={`p-3 flex flex-col items-center justify-center rounded-lg transition-all ${
                      logEntry.type === 'Sleep'
                        ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-600'
                        : 'border-2 border-slate-200 text-slate-600 hover:border-indigo-200'
                    }`}
                  >
                    <Bed className="w-5 h-5 mb-1" />
                    <span className="text-sm">Sleep</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Time</label>
                <input
                  type="time"
                  value={logEntry.time}
                  onChange={(e) => setLogEntry({ ...logEntry, time: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                <textarea
                  value={logEntry.note}
                  onChange={(e) => setLogEntry({ ...logEntry, note: e.target.value })}
                  placeholder="Add any details..."
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  rows="2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!logEntry.type || !logEntry.time}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium ${
                    (!logEntry.type || !logEntry.time) ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Entry Button */}
      <button
        onClick={() => setShowLogForm(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Log Entries */}
      {renderLogEntries()}
    </>
  );
};

export default ActivityLog;