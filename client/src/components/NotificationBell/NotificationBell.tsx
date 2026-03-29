import { useState, useEffect, useRef } from 'react';
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead, subscribeToPush, getVapidPublicKey, type Notification } from '../../services/api/medboardApi';
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

  const [pushStatus, setPushStatus] = useState<string>('default');
  
  useEffect(() => {
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribePush = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      if (permission !== 'granted') return;
      
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const vapidPublicKey = await getVapidPublicKey();
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }
      await subscribeToPush(subscription.toJSON());
      alert('Đã bật thông báo thành công!');
    } catch (e) {
      console.error('Push Config Error', e);
      alert('Không thể đăng ký thông báo Push');
    }
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
            <div className="notif-bell__actions">
              {pushStatus === 'default' && (
                <button className="notif-bell__push-btn" onClick={handleSubscribePush} title="Bật thông báo khi tắt trang">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="6" r="3" fill="#3b82f6" stroke="none" /></svg>
                  Bật Push
                </button>
              )}
              {notifications.some(n => !n.is_read) && (
                <button className="notif-bell__mark-all" onClick={handleReadAll}>Đã đọc</button>
              )}
            </div>
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
