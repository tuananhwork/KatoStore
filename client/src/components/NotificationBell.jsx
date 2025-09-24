import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import notificationAPI from '../api/notificationAPI';
import { Bell } from 'lucide-react';

const NotificationBell = ({ isLoggedIn, userRole }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const sseRef = useRef(null);
  const tokenRef = useRef(null);
  const navigate = useNavigate();

  // Use shared click outside hook
  const notifRef = useClickOutside(() => setNotifOpen(false));

  const syncTokenFromStorage = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      tokenRef.current = token;
    } catch {
      tokenRef.current = null;
    }
  };

  const loadNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await notificationAPI.getMy({ page: 1, limit: 20 });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setNotifs(items);
      setUnreadCount(items.filter((n) => !n.read).length);
    } catch {
      // ignore
    }
  };

  const startSse = () => {
    if (!tokenRef.current || sseRef.current) return;
    try {
      const es = notificationAPI.openStream(tokenRef.current);
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload?.type === 'notification') {
            const newItems = Array.isArray(payload.items) ? payload.items : [payload.items].filter(Boolean);
            if (newItems.length) {
              setNotifs((prev) => [...newItems, ...prev].slice(0, 50));
              setUnreadCount((c) => c + newItems.filter((n) => !n.read).length);
            }
          }
        } catch {
          // ignore
        }
      };
      es.onerror = () => {
        try {
          es.close();
        } catch {
          /* noop */
        }
        sseRef.current = null;
      };
      sseRef.current = es;
    } catch {
      sseRef.current = null;
    }
  };

  const stopSse = () => {
    if (sseRef.current) {
      try {
        sseRef.current.close();
      } catch {
        /* noop */
      }
      sseRef.current = null;
    }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) await markRead(notif._id);
    setNotifOpen(false);
    if (userRole === 'admin' || userRole === 'manager') {
      navigate('/admin/orders');
    } else {
      navigate('/profile?tab=orders');
    }
  };

  useEffect(() => {
    syncTokenFromStorage();
    if (isLoggedIn) {
      loadNotifications();
      startSse();
    } else {
      stopSse();
      setNotifs([]);
      setUnreadCount(0);
    }
    return () => {
      stopSse();
    };
  }, [isLoggedIn]);

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setNotifOpen((o) => !o)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">Thông báo</div>
          {notifs.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">Không có thông báo</div>
          ) : (
            <div className="py-2">
              {notifs.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotifClick(notif)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                    notif.read ? 'border-transparent' : 'border-blue-500'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{notif.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{notif.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString('vi-VN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
