import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationBell({ user, authFetch }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await authFetch(`/api/notifications/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await authFetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await authFetch(`/api/notifications/${user.id}/read-all`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition"
      >
        <Bell className="w-5 h-5 text-purple-200" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold">Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center text-slate-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No notifications</div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition ${
                    !notification.read ? 'bg-slate-800/30' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{notification.title}</div>
                      <div className="text-sm text-slate-300 mt-1">{notification.message}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}