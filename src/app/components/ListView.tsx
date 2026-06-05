import { format, isToday, isFuture, isPast } from 'date-fns';
import { Calendar, Clock, Users, Building2, MapPin, Search, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Booking } from './BookingPanel';
import type { RoomInfo } from './MultiBookingModal';

const MD3 = {
  primary:            '#6750A4',
  onPrimary:          '#FFFFFF',
  primaryContainer:   '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary:          '#625B71',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer:'#1D192B',
  surface:            '#FFFBFE',
  surfaceVariant:     '#E7E0EC',
  onSurfaceVariant:   '#49454F',
  outline:            '#79747E',
  outlineVariant:     '#CAC4D0',
  background:         '#F4EFF4',
  onBackground:       '#1C1B1F',
  error:              '#B3261E',
  tertiary:           '#006E1C',
  tertiaryContainer:  '#B8F0C1',
  onTertiaryContainer:'#002106',
};

interface ListViewProps {
  bookings: Booking[];
  rooms: RoomInfo[];
}

type FilterStatus = 'all' | 'upcoming' | 'past' | 'today';

export function ListView({ bookings, rooms }: ListViewProps) {
  const [search, setSearch]         = useState('');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const roomMap = useMemo(() => Object.fromEntries(rooms.map(r => [r.id, r])), [rooms]);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchRoom   = filterRoom === 'all' || b.roomId === filterRoom;
      const matchSearch = !search || [b.bookedBy, b.roomName, b.timeSlot]
        .some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchStatus =
        filterStatus === 'all'      ? true :
        filterStatus === 'today'    ? isToday(b.date) :
        filterStatus === 'upcoming' ? isFuture(b.date) || isToday(b.date) :
        isPast(b.date) && !isToday(b.date);
      return matchRoom && matchSearch && matchStatus;
    });
  }, [bookings, filterRoom, filterStatus, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    const sorted = [...filtered].sort((a, b) => a.date.getTime() - b.date.getTime());
    for (const b of sorted) {
      const key = format(b.date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return map;
  }, [filtered]);

  const toggleDate = (key: string) =>
    setExpandedDate(prev => (prev === key ? null : key));

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Filter Bar ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-6 py-3 flex-shrink-0 flex-wrap"
        style={{ borderBottom: `1px solid ${MD3.outlineVariant}`, backgroundColor: MD3.surface }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full border flex-1 min-w-48"
          style={{ borderColor: MD3.outline, backgroundColor: MD3.surfaceVariant }}
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MD3.onSurfaceVariant }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="text-xs bg-transparent outline-none flex-1"
            style={{ color: MD3.onBackground }}
          />
        </div>

        {/* Room filter */}
        <div
          className="relative flex items-center gap-1.5 pl-3 pr-2 py-2 rounded-full border cursor-pointer"
          style={{ borderColor: MD3.outline }}
        >
          <Building2 className="w-3.5 h-3.5" style={{ color: MD3.onSurfaceVariant }} />
          <select
            value={filterRoom}
            onChange={e => setFilterRoom(e.target.value)}
            className="text-xs bg-transparent outline-none cursor-pointer appearance-none pr-4"
            style={{ color: MD3.onBackground }}
          >
            <option value="all">All Rooms</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none" style={{ color: MD3.onSurfaceVariant }} />
        </div>

        {/* Status filter chips */}
        <div className="flex gap-1.5">
          {(['all', 'today', 'upcoming', 'past'] as FilterStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors"
              style={{
                backgroundColor: filterStatus === s ? MD3.secondaryContainer : 'transparent',
                color: filterStatus === s ? MD3.onSecondaryContainer : MD3.onSurfaceVariant,
                border: `1px solid ${filterStatus === s ? 'transparent' : MD3.outlineVariant}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs" style={{ color: MD3.onSurfaceVariant }}>
          {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── List Body ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {grouped.size === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Calendar className="w-12 h-12 opacity-20" style={{ color: MD3.onSurfaceVariant }} />
            <p className="text-sm" style={{ color: MD3.onSurfaceVariant }}>No bookings found</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([dateKey, dayBookings]) => {
            const date      = dayBookings[0].date;
            const today     = isToday(date);
            const past      = isPast(date) && !today;
            const isOpen    = expandedDate === dateKey || today;

            return (
              <div key={dateKey} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${MD3.outlineVariant}` }}>

                {/* Date Header */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    backgroundColor: today ? MD3.primaryContainer : MD3.surface,
                  }}
                  onClick={() => toggleDate(dateKey)}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: today ? MD3.primary : past ? MD3.surfaceVariant : MD3.secondaryContainer,
                    }}
                  >
                    <span
                      className="text-xs font-medium leading-none"
                      style={{ color: today ? 'rgba(255,255,255,0.7)' : MD3.onSurfaceVariant }}
                    >
                      {format(date, 'EEE')}
                    </span>
                    <span
                      className="text-base font-bold leading-none mt-0.5"
                      style={{ color: today ? MD3.onPrimary : past ? MD3.onSurfaceVariant : MD3.onSecondaryContainer }}
                    >
                      {format(date, 'd')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: today ? MD3.onPrimaryContainer : MD3.onBackground }}
                      >
                        {today ? 'Today · ' : ''}{format(date, 'EEEE, MMMM d, yyyy')}
                      </span>
                      {today && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: MD3.primary, color: MD3.onPrimary }}
                        >
                          Today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs" style={{ color: MD3.onSurfaceVariant }}>
                        {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                      </span>
                      {/* Colored room dots */}
                      <div className="flex gap-1">
                        {[...new Set(dayBookings.map(b => b.roomId))].map(rid => {
                          const room = roomMap[rid];
                          return room ? (
                            <span
                              key={rid}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: room.color }}
                              title={room.name}
                            />
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                    style={{
                      color: MD3.onSurfaceVariant,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Booking Rows */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${MD3.outlineVariant}` }}>
                    {dayBookings
                      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                      .map((booking, idx) => {
                        const room = roomMap[booking.roomId];
                        return (
                          <div
                            key={booking.id}
                            className="flex items-center gap-4 px-4 py-3"
                            style={{
                              borderTop: idx > 0 ? `1px solid ${MD3.outlineVariant}` : 'none',
                              backgroundColor: MD3.surface,
                            }}
                          >
                            {/* Color bar */}
                            <div
                              className="w-1 self-stretch rounded-full flex-shrink-0"
                              style={{ backgroundColor: room?.color ?? MD3.outline, minHeight: 36 }}
                            />

                            {/* Room chip */}
                            <div
                              className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0"
                              style={{
                                backgroundColor: room?.bgColor ?? MD3.surfaceVariant,
                                color: room?.color ?? MD3.onSurfaceVariant,
                              }}
                            >
                              {room?.name ?? booking.roomName}
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Clock className="w-3.5 h-3.5" style={{ color: MD3.onSurfaceVariant }} />
                              <span className="text-xs font-medium" style={{ color: MD3.onBackground }}>
                                {booking.timeSlot}
                              </span>
                            </div>

                            {/* Booked by */}
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MD3.onSurfaceVariant }} />
                              <span className="text-xs truncate" style={{ color: MD3.onBackground }}>
                                {booking.bookedBy}
                              </span>
                            </div>

                            {/* Capacity */}
                            {room && (
                              <div
                                className="flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-full"
                                style={{ backgroundColor: MD3.surfaceVariant }}
                              >
                                <MapPin className="w-3 h-3" style={{ color: MD3.onSurfaceVariant }} />
                                <span className="text-xs" style={{ color: MD3.onSurfaceVariant }}>
                                  {room.capacity} seats
                                </span>
                              </div>
                            )}

                            {/* Status badge */}
                            <div
                              className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                              style={
                                today
                                  ? { backgroundColor: MD3.primaryContainer, color: MD3.onPrimaryContainer }
                                  : past
                                    ? { backgroundColor: MD3.surfaceVariant, color: MD3.onSurfaceVariant }
                                    : { backgroundColor: MD3.tertiaryContainer, color: MD3.onTertiaryContainer }
                              }
                            >
                              {today ? 'Today' : past ? 'Past' : 'Upcoming'}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
