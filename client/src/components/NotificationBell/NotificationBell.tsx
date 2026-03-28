import { useState, useEffect, useRef } from 'react';
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead, type Notification } from '../../services/api/medboardApi';
import './NotificationBell.scss';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll unread count
  useEffect(() => {
    const loadCount = () => {
      fetchUnreadCount().then(setUnread).catch(() => {});
    };
    loadCount();
    const interval = setInterval(loadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    setLoading(true);
    try {
      const items = await fetchNotifications(15);
      setNotifications(items);
    } catch { setNotifications([]); }
    setLoading(false);
  };

  const handleRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {}
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  return (
    <div className="notif-bell" ref={ref}>
      <button className="notif-bell__btn" onClick={handleOpen} title="Thông báo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && <span className="notif-bell__badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-bell__dropdown">
          <div className="notif-bell__header">
            <span className="notif-bell__title">Thông báo</span>
            {notifications.some(n => !n.is_read) && (
              <button className="notif-bell__mark-all" onClick={handleReadAll}>Đánh dấu đã đọc</button>
            )}
          </div>
          <div className="notif-bell__list">
            {loading ? (
              <div className="notif-bell__empty">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="notif-bell__empty">Không có thông báo</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} 
                  className={`notif-bell__item ${!n.is_read ? 'notif-bell__item--unread' : ''}`}
                  onClick={() => !n.is_read && handleRead(n.id)}>
                  <div className="notif-bell__item-title">{n.title}</div>
                  <div className="notif-bell__item-msg">{n.message}</div>
                  <div className="notif-bell__item-time">{timeAgo(n.created_at)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
