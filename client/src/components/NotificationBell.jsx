import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationAPI from '../api/notificationAPI';

const NotificationBell = ({ isLoggedIn, userRole }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const sseRef = useRef(null);
  const tokenRef = useRef(null);
  const navigate = useNavigate();

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
    const handleClickOutside = (event) => {
      const notifEl = notifRef.current;
      if (notifEl && !notifEl.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      if (!isLoggedIn) stopSse();
    };
  }, [isLoggedIn]);

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setNotifOpen((o) => !o)}
        className="relative p-2 text-gray-600 hover:text-[rgb(var(--color-primary-600))] transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between">
            <span>Thông báo</span>
            <button className="text-xs text-[rgb(var(--color-primary))] hover:underline" onClick={loadNotifications}>
              Làm mới
            </button>
          </div>
          <div className="max-h-80 overflow-auto divide-y divide-gray-100">
            {notifs.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">Chưa có thông báo</div>
            ) : (
              notifs.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleNotifClick(n)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                    n.read ? 'text-gray-600' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="font-medium truncate pr-2">{n.title || 'Thông báo'}</div>
                    {!n.read && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500" />}
                  </div>
                  <div className="text-gray-600 mt-1">{n.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
