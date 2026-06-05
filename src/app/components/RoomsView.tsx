import { Building2, Users, Clock, CheckCircle2, XCircle, MoreHorizontal, Plus, MapPin } from 'lucide-react';
import { format, isToday } from 'date-fns';
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

const TIME_SLOTS = [
  '09:00 - 10:00','10:00 - 11:00','11:00 - 12:00',
  '12:00 - 13:00','13:00 - 14:00','14:00 - 15:00',
  '15:00 - 16:00','16:00 - 17:00','17:00 - 18:00',
];

const AMENITIES: Record<string, string[]> = {
  '1': ['Projector', 'Whiteboard', 'Video Conf', 'Coffee Station'],
  '2': ['TV Screen', 'Whiteboard', 'Video Conf'],
  '3': ['TV Screen', 'Whiteboard'],
  '4': ['Whiteboard', 'Standing Desk'],
};

interface RoomsViewProps {
  rooms: RoomInfo[];
  bookings: Booking[];
}

export function RoomsView({ rooms, bookings }: RoomsViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>(rooms[0]?.id ?? '');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todayBookingsForRoom = (roomId: string) =>
    bookings.filter(b => b.roomId === roomId && format(b.date, 'yyyy-MM-dd') === todayStr);

  const totalBookingsForRoom = (roomId: string) =>
    bookings.filter(b => b.roomId === roomId).length;

  const isSlotBooked = (roomId: string, slot: string) =>
    todayBookingsForRoom(roomId).some(b => b.timeSlot === slot);

  const getSlotBooking = (roomId: string, slot: string) =>
    todayBookingsForRoom(roomId).find(b => b.timeSlot === slot);

  const activeRoom = rooms.find(r => r.id === selectedRoom) ?? rooms[0];
  const todayBookings = todayBookingsForRoom(activeRoom?.id ?? '');
  const bookedSlots   = TIME_SLOTS.filter(s => isSlotBooked(activeRoom?.id ?? '', s)).length;
  const freeSlots     = TIME_SLOTS.length - bookedSlots;
  const utilisation   = Math.round((bookedSlots / TIME_SLOTS.length) * 100);

  return (
    <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: MD3.background }}>

      {/* ── Room List Sidebar ─────────────────────────────────────────── */}
      <div
        className="flex flex-col w-72 flex-shrink-0 overflow-y-auto"
        style={{
          backgroundColor: MD3.surface,
          borderRight: `1px solid ${MD3.outlineVariant}`,
        }}
      >
        <div className="px-4 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold" style={{ color: MD3.onBackground }}>Rooms</span>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: MD3.primaryContainer, color: MD3.onPrimaryContainer }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 pb-3 space-y-1">
          {rooms.map(room => {
            const active    = selectedRoom === room.id;
            const todayB    = todayBookingsForRoom(room.id).length;
            const totalB    = totalBookingsForRoom(room.id);
            const util      = Math.round((todayBookingsForRoom(room.id).length / TIME_SLOTS.length) * 100);
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: active ? room.bgColor : 'transparent',
                }}
              >
                {/* Color dot */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: active ? room.color : MD3.surfaceVariant }}
                >
                  <Building2 className="w-4 h-4" style={{ color: active ? '#fff' : MD3.onSurfaceVariant }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: active ? room.color : MD3.onBackground }}>
                    {room.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: MD3.onSurfaceVariant }}>
                    {room.capacity} seats · {todayB} today
                  </div>
                  {/* Utilisation bar */}
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: MD3.outlineVariant }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${util}%`, backgroundColor: room.color }}
                    />
                  </div>
                </div>

                <div className="text-xs font-semibold flex-shrink-0" style={{ color: active ? room.color : MD3.onSurfaceVariant }}>
                  {util}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-auto px-4 py-4 border-t" style={{ borderColor: MD3.outlineVariant }}>
          <p className="text-xs font-medium mb-2" style={{ color: MD3.onSurfaceVariant }}>Today's utilisation</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MD3.error, display: 'inline-block' }} />
              <span className="text-xs" style={{ color: MD3.onSurfaceVariant }}>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: MD3.tertiary, display: 'inline-block' }} />
              <span className="text-xs" style={{ color: MD3.onSurfaceVariant }}>Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Room Detail Panel ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {activeRoom && (
          <>
            {/* Room hero */}
            <div
              className="rounded-3xl p-6 mb-6 flex items-start justify-between"
              style={{ backgroundColor: activeRoom.color }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-white opacity-80" />
                  <span className="text-white text-xs font-medium uppercase tracking-wider opacity-80">Room Details</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{activeRoom.name}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-white">
                    <Users className="w-4 h-4 opacity-80" />
                    <span className="text-sm opacity-90">{activeRoom.capacity} seats</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white">
                    <MapPin className="w-4 h-4 opacity-80" />
                    <span className="text-sm opacity-90">Floor 3</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-4xl font-bold">{utilisation}%</div>
                <div className="text-white text-xs opacity-70 mt-0.5">Today's utilisation</div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Booked Today',   value: bookedSlots,                icon: <XCircle className="w-4 h-4" />,      color: MD3.error,    bg: MD3.errorContainer },
                { label: 'Free Today',     value: freeSlots,                  icon: <CheckCircle2 className="w-4 h-4" />, color: MD3.tertiary, bg: MD3.tertiaryContainer },
                { label: 'Total Bookings', value: totalBookingsForRoom(activeRoom.id), icon: <Clock className="w-4 h-4" />,        color: MD3.primary,  bg: MD3.primaryContainer },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: stat.bg }}
                >
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                  <div>
                    <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: stat.color, opacity: 0.8 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: MD3.onBackground }}>Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {(AMENITIES[activeRoom.id] ?? []).map(a => (
                  <span
                    key={a}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: activeRoom.bgColor, color: activeRoom.color }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Today's schedule */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: MD3.onBackground }}>
                  Today's Schedule
                  <span className="ml-1.5 text-xs font-normal" style={{ color: MD3.onSurfaceVariant }}>
                    {format(today, 'EEEE, MMMM d')}
                  </span>
                </h3>
              </div>

              <div className="space-y-2">
                {TIME_SLOTS.map(slot => {
                  const booked  = isSlotBooked(activeRoom.id, slot);
                  const booking = getSlotBooking(activeRoom.id, slot);
                  return (
                    <div
                      key={slot}
                      className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                      style={{
                        backgroundColor: booked ? MD3.errorContainer : MD3.surface,
                        border: `1px solid ${booked ? 'rgba(179,38,30,0.15)' : MD3.outlineVariant}`,
                      }}
                    >
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: booked ? MD3.error : MD3.onSurfaceVariant }} />
                      <span className="text-xs font-semibold w-32 flex-shrink-0" style={{ color: booked ? MD3.onErrorContainer : MD3.onBackground }}>
                        {slot}
                      </span>
                      {booked && booking ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MD3.error }} />
                          <span className="text-xs flex-1 truncate" style={{ color: MD3.onErrorContainer }}>{booking.bookedBy}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: MD3.error, color: '#fff' }}>Booked</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MD3.tertiary }} />
                          <span className="text-xs flex-1" style={{ color: MD3.tertiary }}>Available</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: MD3.tertiaryContainer, color: MD3.onTertiaryContainer }}>Free</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
