import { X, Bell, CheckCheck, Calendar, Clock, Building2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { useState } from 'react';
import type { Booking } from './BookingPanel';
import type { RoomInfo } from './MultiBookingModal';

const MD3 = {
  primary:             '#6750A4',
  onPrimary:           '#FFFFFF',
  primaryContainer:    '#EADDFF',
  onPrimaryContainer:  '#21005D',
  secondary:           '#625B71',
  secondaryContainer:  '#E8DEF8',
  onSecondaryContainer:'#1D192B',
  surface:             '#FFFBFE',
  surfaceVariant:      '#E7E0EC',
  onSurfaceVariant:    '#49454F',
  outline:             '#79747E',
  outlineVariant:      '#CAC4D0',
  background:          '#F4EFF4',
  onBackground:        '#1C1B1F',
  error:               '#B3261E',
  errorContainer:      '#F9DEDC',
  onErrorContainer:    '#410E0B',
  tertiary:            '#006E1C',
  tertiaryContainer:   '#B8F0C1',
  onTertiaryContainer: '#002106',
};

type NotifType = 'booking' | 'reminder' | 'info' | 'alert';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: Date;
  read: boolean;
  roomColor?: string;
}

function makeNotifications(bookings: Booking[], rooms: RoomInfo[]): Notification[] {
  const roomMap = Object.fromEntries(rooms.map(r => [r.id, r]));
  const notifs: Notification[] = [];

  // Today's bookings as reminders
  bookings
    .filter(b => isToday(b.date))
    .forEach(b => {
      const room = roomMap[b.roomId];
      notifs.push({
        id: `today-${b.id}`,
        type: 'reminder',
        title: 'Today\'s booking',
        body: `${room?.name ?? b.roomName} · ${b.timeSlot} — ${b.bookedBy}`,
        time: new Date(b.date.getFullYear(), b.date.getMonth(), b.date.getDate(), 8, 0),
        read: false,
        roomColor: room?.color,
      });
    });

  // Tomorrow's bookings as reminders
  bookings
    .filter(b => isTomorrow(b.date))
    .forEach(b => {
      const room = roomMap[b.roomId];
      notifs.push({
        id: `tomorrow-${b.id}`,
        type: 'booking',
        title: 'Upcoming tomorrow',
        body: `${room?.name ?? b.roomName} · ${b.timeSlot} — ${b.bookedBy}`,
        time: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        roomColor: room?.color,
      });
    });

  // Yesterday's bookings as completed
  bookings
    .filter(b => isYesterday(b.date))
    .slice(0, 2)
    .forEach(b => {
      const room = roomMap[b.roomId];
      notifs.push({
        id: `yesterday-${b.id}`,
        type: 'info',
        title: 'Booking completed',
        body: `${room?.name ?? b.roomName} · ${b.timeSlot} — ${b.bookedBy}`,
        time: new Date(b.date.getFullYear(), b.date.getMonth(), b.date.getDate(), 17, 0),
        read: true,
        roomColor: room?.color,
      });
    });

  // Static system notifications
  notifs.push({
    id: 'sys-1',
    type: 'alert',
    title: 'Maintenance scheduled',
    body: 'Conference Room B will be unavailable on March 22 from 12:00–14:00 for AV upgrades.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  });
  notifs.push({
    id: 'sys-2',
    type: 'info',
    title: 'New room available',
    body: 'Boardroom D (capacity 20) has been added and is now available for booking.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  });

  return notifs.sort((a, b) => b.time.getTime() - a.time.getTime());
}

function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  if (isToday(d)) return 'today';
  if (isYesterday(d)) return 'yesterday';
  return format(d, 'MMM d');
}

const TYPE_CONFIG: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  booking:  { icon: <Calendar className="w-4 h-4" />,     color: '#0061A4', bg: '#D1E4FF' },
  reminder: { icon: <Clock className="w-4 h-4" />,        color: MD3.primary, bg: MD3.primaryContainer },
  info:     { icon: <Info className="w-4 h-4" />,         color: MD3.tertiary, bg: MD3.tertiaryContainer },
  alert:    { icon: <AlertCircle className="w-4 h-4" />,  color: MD3.error,   bg: MD3.errorContainer },
};

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  rooms: RoomInfo[];
}

export function NotificationsPanel({ isOpen, onClose, bookings, rooms }: NotificationsPanelProps) {
  const [notifs, setNotifs] = useState<Notification[]>(() => makeNotifications(bookings, rooms));
  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: 380,
          backgroundColor: MD3.surface,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${MD3.outlineVariant}` }}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: MD3.primary }} />
            <span className="text-base font-semibold" style={{ color: MD3.onBackground }}>Notifications</span>
            {unread > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: MD3.error, color: '#fff' }}
              >
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ color: MD3.primary }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.primaryContainer)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ color: MD3.onSurfaceVariant }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.surfaceVariant)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <CheckCircle2 className="w-10 h-10 opacity-20" style={{ color: MD3.onSurfaceVariant }} />
              <p className="text-sm" style={{ color: MD3.onSurfaceVariant }}>You're all caught up!</p>
            </div>
          ) : (
            <div className="py-2">
              {notifs.map(notif => {
                const cfg = TYPE_CONFIG[notif.type];
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors relative"
                    style={{
                      backgroundColor: notif.read ? 'transparent' : `${MD3.primaryContainer}55`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.surfaceVariant)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : `${MD3.primaryContainer}55`)}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: MD3.primary }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: notif.roomColor ? `${notif.roomColor}22` : cfg.bg, color: notif.roomColor ?? cfg.color }}
                    >
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold" style={{ color: notif.read ? MD3.onSurfaceVariant : MD3.onBackground }}>
                          {notif.title}
                        </span>
                        <span className="text-xs flex-shrink-0" style={{ color: MD3.outline }}>
                          {relativeTime(notif.time)}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: MD3.onSurfaceVariant }}>
                        {notif.body}
                      </p>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                      style={{ color: MD3.outline }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = MD3.surfaceVariant; e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex-shrink-0 text-center"
          style={{ borderTop: `1px solid ${MD3.outlineVariant}` }}
        >
          <button
            className="text-xs font-medium"
            style={{ color: MD3.primary }}
          >
            Notification preferences →
          </button>
        </div>
      </div>
    </>
  );
}
