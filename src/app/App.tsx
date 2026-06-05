import { useState, useRef, useEffect, useCallback } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, isToday,
} from 'date-fns';
import {
  CalendarDays, LayoutList, Building2, Settings, ChevronLeft,
  ChevronRight, Search, Plus, Bell, User, Filter, MoreHorizontal,
  MapPin, Clock, Users, BarChart3, Home,
} from 'lucide-react';
import type { Booking } from './components/BookingPanel';
import { MultiBookingModal, type BookingFormData, type RoomInfo } from './components/MultiBookingModal';
import { DayDetailsModal } from './components/DayDetailsModal';

// ─── MD3 Design Tokens ────────────────────────────────────────────────────────
const MD3 = {
  primary:          '#6750A4',
  onPrimary:        '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer:'#21005D',
  secondary:        '#625B71',
  secondaryContainer:'#E8DEF8',
  onSecondaryContainer:'#1D192B',
  surface:          '#FFFBFE',
  surfaceVariant:   '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline:          '#79747E',
  outlineVariant:   '#CAC4D0',
  background:       '#F4EFF4',
  onBackground:     '#1C1B1F',
  error:            '#B3261E',
  scrim:            'rgba(0,0,0,0.6)',
};

// ─── Room Definitions ────────────────────────────────────────────────────────
const ROOMS: RoomInfo[] = [
  { id: '1', name: 'Conference Room A', capacity: 10, color: '#6750A4', bgColor: '#EADDFF' },
  { id: '2', name: 'Conference Room B', capacity: 8,  color: '#0061A4', bgColor: '#D1E4FF' },
  { id: '3', name: 'Meeting Room 1',    capacity: 6,  color: '#BA4B00', bgColor: '#FFDBC8' },
  { id: '4', name: 'Meeting Room 2',    capacity: 4,  color: '#006E1C', bgColor: '#B8F0C1' },
];

const ALL_ROOMS_ROW: RoomInfo = {
  id: 'all',
  name: 'All Rooms',
  capacity: ROOMS.reduce((s, r) => s + r.capacity, 0),
  color: '#625B71',
  bgColor: '#E8DEF8',
};

const ALL_ROWS = [ALL_ROOMS_ROW, ...ROOMS];

// ─── Initial sample bookings ──────────────────────────────────────────────────
const INITIAL_BOOKINGS: Booking[] = [
  { id: '1', roomId: '1', date: new Date(2026, 2, 3),  timeSlot: '09:00 - 10:00', roomName: 'Conference Room A', capacity: 10, bookedBy: 'Team Meeting' },
  { id: '2', roomId: '3', date: new Date(2026, 2, 3),  timeSlot: '10:00 - 11:00', roomName: 'Meeting Room 1',    capacity: 6,  bookedBy: 'Client Call' },
  { id: '3', roomId: '2', date: new Date(2026, 2, 5),  timeSlot: '14:00 - 15:00', roomName: 'Conference Room B', capacity: 8,  bookedBy: 'Project Review' },
  { id: '4', roomId: '1', date: new Date(2026, 2, 5),  timeSlot: '15:00 - 16:00', roomName: 'Conference Room A', capacity: 10, bookedBy: 'Training Session' },
  { id: '5', roomId: '4', date: new Date(2026, 2, 7),  timeSlot: '11:00 - 12:00', roomName: 'Meeting Room 2',    capacity: 4,  bookedBy: 'HR Interview' },
  { id: '6', roomId: '2', date: new Date(2026, 2, 10), timeSlot: '09:00 - 10:00', roomName: 'Conference Room B', capacity: 8,  bookedBy: 'All-Hands' },
  { id: '7', roomId: '1', date: new Date(2026, 2, 12), timeSlot: '13:00 - 14:00', roomName: 'Conference Room A', capacity: 10, bookedBy: 'Board Meeting' },
  { id: '8', roomId: '3', date: new Date(2026, 2, 15), timeSlot: '10:00 - 11:00', roomName: 'Meeting Room 1',    capacity: 6,  bookedBy: 'Design Review' },
  { id: '9', roomId: '4', date: new Date(2026, 2, 18), timeSlot: '14:00 - 15:00', roomName: 'Meeting Room 2',    capacity: 4,  bookedBy: 'Sprint Planning' },
  { id:'10', roomId: '2', date: new Date(2026, 2, 20), timeSlot: '11:00 - 12:00', roomName: 'Conference Room B', capacity: 8,  bookedBy: 'Product Review' },
];

interface DragCell { rowIdx: number; colIdx: number }

type NavItem = 'calendar' | 'list' | 'rooms' | 'analytics' | 'settings';

const NAV_ITEMS: { id: NavItem; icon: React.ReactNode; label: string }[] = [
  { id: 'calendar',   icon: <CalendarDays className="w-5 h-5" />,  label: 'Calendar'  },
  { id: 'list',       icon: <LayoutList className="w-5 h-5" />,    label: 'List View' },
  { id: 'rooms',      icon: <Building2 className="w-5 h-5" />,     label: 'Rooms'     },
  { id: 'analytics',  icon: <BarChart3 className="w-5 h-5" />,     label: 'Analytics' },
];

export default function App() {
  const [currentMonth, setCurrentMonth]   = useState(new Date(2026, 2, 1));
  const [bookings, setBookings]           = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeNav, setActiveNav]         = useState<NavItem>('calendar');
  const [navExpanded, setNavExpanded]     = useState(false);

  // Single-cell modal
  const [singleDate, setSingleDate]       = useState<Date | null>(null);
  const [singleRoomId, setSingleRoomId]   = useState<string | null>(null);
  const [showSingleModal, setShowSingleModal] = useState(false);

  // Multi-cell drag
  const [dragStart, setDragStart]         = useState<DragCell | null>(null);
  const [dragEnd, setDragEnd]             = useState<DragCell | null>(null);
  const [showMultiModal, setShowMultiModal] = useState(false);
  const isDraggingRef                     = useRef(false);
  const dragStartRef                      = useRef<DragCell | null>(null);
  const dragEndRef                        = useRef<DragCell | null>(null);

  const monthStart  = startOfMonth(currentMonth);
  const monthEnd    = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const daysInMonthRef = useRef(daysInMonth);
  daysInMonthRef.current = daysInMonth;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getBookings = useCallback((roomId: string, date: Date): Booking[] => {
    const d = format(date, 'yyyy-MM-dd');
    if (roomId === 'all') return bookings.filter(b => format(b.date, 'yyyy-MM-dd') === d);
    return bookings.filter(b => format(b.date, 'yyyy-MM-dd') === d && b.roomId === roomId);
  }, [bookings]);

  const isCellSelected = (rowIdx: number, colIdx: number): boolean => {
    if (!dragStart || !dragEnd) return false;
    const r0 = Math.min(dragStart.rowIdx, dragEnd.rowIdx);
    const r1 = Math.max(dragStart.rowIdx, dragEnd.rowIdx);
    const c0 = Math.min(dragStart.colIdx, dragEnd.colIdx);
    const c1 = Math.max(dragStart.colIdx, dragEnd.colIdx);
    return rowIdx >= r0 && rowIdx <= r1 && colIdx >= c0 && colIdx <= c1;
  };

  const getSelectionInfo = (): { rooms: RoomInfo[]; dates: Date[] } => {
    if (!dragStart || !dragEnd) return { rooms: [], dates: [] };
    const r0 = Math.min(dragStart.rowIdx, dragEnd.rowIdx);
    const r1 = Math.max(dragStart.rowIdx, dragEnd.rowIdx);
    const c0 = Math.min(dragStart.colIdx, dragEnd.colIdx);
    const c1 = Math.max(dragStart.colIdx, dragEnd.colIdx);
    const selectedRowIds = ALL_ROWS.slice(r0, r1 + 1).map(r => r.id);
    const rooms: RoomInfo[] = selectedRowIds.includes('all')
      ? ROOMS
      : ROOMS.filter(r => selectedRowIds.includes(r.id));
    const dates = daysInMonth.slice(c0, c1 + 1);
    return { rooms: [...new Map(rooms.map(r => [r.id, r])).values()], dates };
  };

  // ── Mouse drag ─────────────────────────────────────────────────────────────
  const handleCellMouseDown = (e: React.MouseEvent, rowIdx: number, colIdx: number) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current  = { rowIdx, colIdx };
    dragEndRef.current    = { rowIdx, colIdx };
    setDragStart({ rowIdx, colIdx });
    setDragEnd({ rowIdx, colIdx });
  };

  const handleCellMouseEnter = (rowIdx: number, colIdx: number) => {
    if (!isDraggingRef.current) return;
    dragEndRef.current = { rowIdx, colIdx };
    setDragEnd({ rowIdx, colIdx });
  };

  useEffect(() => {
    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const start = dragStartRef.current;
      const end   = dragEndRef.current;
      if (start && end) {
        const sameCell = start.rowIdx === end.rowIdx && start.colIdx === end.colIdx;
        if (sameCell) {
          const room = ALL_ROWS[start.rowIdx];
          const date = daysInMonthRef.current[start.colIdx];
          if (room && date) {
            setSingleDate(date);
            setSingleRoomId(room.id === 'all' ? null : room.id);
            setShowSingleModal(true);
          }
          setDragStart(null);
          setDragEnd(null);
        } else {
          setShowMultiModal(true);
        }
      }
    };
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.userSelect = isDraggingRef.current ? 'none' : '';
  });

  // ── Booking handlers ───────────────────────────────────────────────────────
  const handleMultiBookingConfirm = (data: BookingFormData) => {
    const { rooms, dates } = getSelectionInfo();
    const newBookings: Booking[] = [];
    rooms.forEach(room => {
      dates.forEach(date => {
        newBookings.push({
          id:       `${Date.now()}-${room.id}-${format(date, 'yyyy-MM-dd')}`,
          roomId:   room.id,
          date,
          timeSlot: `${data.startTime} - ${data.endTime}`,
          roomName: room.name,
          capacity: room.capacity,
          bookedBy: data.title ? `${data.bookedBy} · ${data.title}` : data.bookedBy,
        });
      });
    });
    setBookings(prev => [...prev, ...newBookings]);
    setShowMultiModal(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const handleMultiModalClose = () => {
    setShowMultiModal(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const handleAddSingleBooking = (roomId: string, timeSlot: string, bookedBy: string) => {
    if (!singleDate) return;
    const room = ROOMS.find(r => r.id === roomId);
    if (!room) return;
    setBookings(prev => [...prev, {
      id: Date.now().toString(),
      roomId,
      date: singleDate,
      timeSlot,
      roomName: room.name,
      capacity: room.capacity,
      bookedBy,
    }]);
  };

  const prevMonth = () => setCurrentMonth(m => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth(m => addMonths(m, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const { rooms: selRooms, dates: selDates } = getSelectionInfo();

  const COL_W   = 96;
  const ROW_H   = 76;
  const LABEL_W = 200;

  // Stats for header
  const totalToday = bookings.filter(b => isToday(b.date)).length;
  const totalMonth = bookings.filter(b =>
    format(b.date, 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
  ).length;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MD3.background, fontFamily: "'Google Sans', 'Roboto', sans-serif" }}>

      {/* ── Navigation Rail ─────────────────────────────────────────────── */}
      <nav
        className="flex flex-col items-center py-4 transition-all duration-200 relative z-20"
        style={{
          width: navExpanded ? 220 : 80,
          backgroundColor: MD3.surface,
          borderRight: `1px solid ${MD3.outlineVariant}`,
          boxShadow: '1px 0 4px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}
        onMouseEnter={() => setNavExpanded(true)}
        onMouseLeave={() => setNavExpanded(false)}
      >
        {/* Logo / App Icon */}
        <div className="flex items-center gap-3 mb-8 px-4 w-full overflow-hidden">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: MD3.primary }}
          >
            <CalendarDays className="w-5 h-5" style={{ color: MD3.onPrimary }} />
          </div>
          <span
            className="text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-200"
            style={{
              color: MD3.onBackground,
              opacity: navExpanded ? 1 : 0,
              maxWidth: navExpanded ? 120 : 0,
            }}
          >
            Room Booking
          </span>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-1 w-full px-2 flex-1">
          {NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-150 w-full overflow-hidden"
                style={{
                  backgroundColor: active ? MD3.secondaryContainer : 'transparent',
                  color: active ? MD3.onSecondaryContainer : MD3.onSurfaceVariant,
                }}
                title={item.label}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span
                  className="text-sm font-medium whitespace-nowrap transition-all duration-200 overflow-hidden"
                  style={{
                    opacity: navExpanded ? 1 : 0,
                    maxWidth: navExpanded ? 140 : 0,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-1 w-full px-2 mt-auto">
          <button
            className="flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-150 w-full overflow-hidden"
            style={{ color: MD3.onSurfaceVariant }}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span
              className="text-sm font-medium whitespace-nowrap transition-all duration-200 overflow-hidden"
              style={{ opacity: navExpanded ? 1 : 0, maxWidth: navExpanded ? 140 : 0 }}
            >
              Settings
            </span>
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl w-full overflow-hidden">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
              style={{ backgroundColor: MD3.primaryContainer, color: MD3.onPrimaryContainer }}
            >
              JD
            </div>
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ opacity: navExpanded ? 1 : 0, maxWidth: navExpanded ? 140 : 0 }}
            >
              <div className="text-xs font-semibold whitespace-nowrap" style={{ color: MD3.onBackground }}>
                Jane Doe
              </div>
              <div className="text-xs whitespace-nowrap" style={{ color: MD3.onSurfaceVariant }}>
                Admin
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Top App Bar ─────────────────────────────────────────────── */}
        <header
          className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
          style={{
            backgroundColor: MD3.surface,
            borderBottom: `1px solid ${MD3.outlineVariant}`,
            height: 64,
          }}
        >
          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate" style={{ color: MD3.onBackground }}>
              Room Booking Calendar
            </h1>
            <p className="text-xs" style={{ color: MD3.onSurfaceVariant }}>
              {format(currentMonth, 'MMMM yyyy')} · {totalMonth} bookings this month
              {totalToday > 0 && ` · ${totalToday} today`}
            </p>
          </div>

          {/* Stats Pills */}
          <div className="hidden lg:flex items-center gap-2">
            {ROOMS.map(room => {
              const count = bookings.filter(b =>
                b.roomId === room.id &&
                format(b.date, 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
              ).length;
              return (
                <div
                  key={room.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: room.bgColor, color: room.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                  {room.name.split(' ').slice(-1)[0]} · {count}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-6" style={{ backgroundColor: MD3.outlineVariant }} />

          {/* Month Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ color: MD3.onSurfaceVariant }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.surfaceVariant)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: MD3.primaryContainer,
                color: MD3.onPrimaryContainer,
              }}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ color: MD3.onSurfaceVariant }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.surfaceVariant)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ color: MD3.onSurfaceVariant }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.surfaceVariant)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ color: MD3.onSurfaceVariant }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.surfaceVariant)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Bell className="w-4 h-4" />
              {totalToday > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: MD3.error }}
                />
              )}
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ color: MD3.onSurfaceVariant }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.surfaceVariant)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-6 py-2 flex-shrink-0"
          style={{
            backgroundColor: MD3.surface,
            borderBottom: `1px solid ${MD3.outlineVariant}`,
          }}
        >
          {/* Segmented button: View */}
          <div
            className="flex rounded-full overflow-hidden border"
            style={{ borderColor: MD3.outline }}
          >
            {[
              { label: 'Month', active: true },
              { label: 'Week',  active: false },
              { label: 'Day',   active: false },
            ].map((v, i) => (
              <button
                key={i}
                className="px-4 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: v.active ? MD3.secondaryContainer : 'transparent',
                  color: v.active ? MD3.onSecondaryContainer : MD3.onSurfaceVariant,
                  borderLeft: i > 0 ? `1px solid ${MD3.outline}` : 'none',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Room filter chips */}
          <div className="flex items-center gap-2">
            {[ALL_ROOMS_ROW, ...ROOMS].map(room => (
              <div
                key={room.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer"
                style={{
                  borderColor: room.color,
                  color: room.color,
                  backgroundColor: 'transparent',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: room.color }}
                />
                {room.name === 'All Rooms' ? 'All' : room.name.split(' ').slice(-1)[0]}
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* Hint text */}
          <span className="text-xs hidden xl:block" style={{ color: MD3.onSurfaceVariant }}>
            Click a cell to view · Drag to multi-book
          </span>

          {/* Filter button */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
            style={{ borderColor: MD3.outline, color: MD3.onSurfaceVariant }}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>

        {/* ── Calendar Grid ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto relative" style={{ userSelect: 'none' }}>
          <table
            className="border-collapse"
            style={{ width: 'max-content', minWidth: '100%', tableLayout: 'fixed' }}
          >
            {/* Header row */}
            <thead>
              <tr>
                {/* Room corner */}
                <th
                  className="text-left px-4"
                  style={{
                    width: LABEL_W,
                    minWidth: LABEL_W,
                    height: 52,
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    zIndex: 30,
                    backgroundColor: MD3.surface,
                    borderBottom: `1px solid ${MD3.outlineVariant}`,
                    borderRight: `1px solid ${MD3.outlineVariant}`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" style={{ color: MD3.onSurfaceVariant }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: MD3.onSurfaceVariant }}>
                      Room / Date
                    </span>
                  </div>
                </th>

                {/* Date columns */}
                {daysInMonth.map((day, colIdx) => {
                  const today   = isToday(day);
                  const dow     = format(day, 'EEE');
                  const isWeekend = dow === 'Sat' || dow === 'Sun';
                  return (
                    <th
                      key={colIdx}
                      style={{
                        width: COL_W,
                        minWidth: COL_W,
                        height: 52,
                        position: 'sticky',
                        top: 0,
                        zIndex: 20,
                        backgroundColor: today ? MD3.primary : isWeekend ? MD3.background : MD3.surface,
                        borderBottom: `1px solid ${MD3.outlineVariant}`,
                        borderRight: `1px solid ${MD3.outlineVariant}`,
                        textAlign: 'center',
                        padding: '0 4px',
                      }}
                    >
                      <div className="text-xs font-medium" style={{ color: today ? '#E8DEF8' : MD3.onSurfaceVariant }}>
                        {dow}
                      </div>
                      <div
                        className="text-sm font-bold mx-auto mt-0.5"
                        style={{
                          color: today ? '#FFFFFF' : isWeekend ? MD3.outline : MD3.onBackground,
                          width: 28,
                          height: 28,
                          lineHeight: '28px',
                          borderRadius: today ? '50%' : 0,
                          backgroundColor: today ? 'transparent' : 'transparent',
                        }}
                      >
                        {format(day, 'd')}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Room rows */}
            <tbody>
              {ALL_ROWS.map((room, rowIdx) => {
                const isAllRow = room.id === 'all';
                return (
                  <tr key={room.id}>
                    {/* Room label */}
                    <td
                      style={{
                        width: LABEL_W,
                        minWidth: LABEL_W,
                        height: ROW_H,
                        position: 'sticky',
                        left: 0,
                        zIndex: 10,
                        backgroundColor: MD3.surface,
                        borderBottom: `1px solid ${MD3.outlineVariant}`,
                        borderRight: `1px solid ${MD3.outlineVariant}`,
                        borderLeft: `4px solid ${room.color}`,
                        padding: '0 14px',
                      }}
                    >
                      <div className="flex flex-col justify-center h-full">
                        <div className="flex items-center gap-2 mb-0.5">
                          {isAllRow
                            ? <Home className="w-3.5 h-3.5 flex-shrink-0" style={{ color: room.color }} />
                            : <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: room.color }} />
                          }
                          <span
                            className="text-xs font-semibold leading-tight truncate"
                            style={{ color: room.color }}
                          >
                            {room.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 pl-5">
                          <Users className="w-3 h-3" style={{ color: MD3.onSurfaceVariant }} />
                          <span className="text-xs" style={{ color: MD3.onSurfaceVariant }}>
                            {room.capacity} seats
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date cells */}
                    {daysInMonth.map((day, colIdx) => {
                      const cellBookings = getBookings(room.id, day);
                      const booked       = cellBookings.length > 0;
                      const selected     = isCellSelected(rowIdx, colIdx);
                      const today        = isToday(day);
                      const dow          = format(day, 'EEE');
                      const isWeekend    = dow === 'Sat' || dow === 'Sun';

                      let bgStyle: React.CSSProperties = {};
                      if (selected) {
                        bgStyle = {
                          backgroundColor: MD3.primaryContainer,
                          outline: `2px solid ${MD3.primary}`,
                          outlineOffset: '-2px',
                        };
                      } else if (booked && !isAllRow) {
                        bgStyle = { backgroundColor: room.color };
                      } else if (booked && isAllRow) {
                        bgStyle = { backgroundColor: MD3.surfaceVariant };
                      } else if (today) {
                        bgStyle = { backgroundColor: '#F3EDFF' };
                      } else if (isWeekend) {
                        bgStyle = { backgroundColor: MD3.background };
                      } else {
                        bgStyle = { backgroundColor: MD3.surface };
                      }

                      return (
                        <td
                          key={colIdx}
                          className="cursor-pointer relative overflow-hidden transition-all"
                          style={{
                            width: COL_W,
                            minWidth: COL_W,
                            height: ROW_H,
                            borderBottom: `1px solid ${MD3.outlineVariant}`,
                            borderRight: `1px solid ${MD3.outlineVariant}`,
                            ...bgStyle,
                          }}
                          onMouseDown={e => handleCellMouseDown(e, rowIdx, colIdx)}
                          onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                        >
                          {/* Ripple hover */}
                          <div
                            className="absolute inset-0 opacity-0 hover:opacity-[0.08] transition-opacity bg-black pointer-events-none"
                            style={{ borderRadius: 0 }}
                          />

                          {booked ? (
                            isAllRow ? (
                              /* All Rooms summary */
                              <div className="px-2 py-2 h-full flex flex-col justify-center gap-1">
                                <div className="flex flex-wrap gap-1">
                                  {ROOMS.filter(r => getBookings(r.id, day).length > 0).map(r => (
                                    <span
                                      key={r.id}
                                      className="w-3 h-3 rounded-sm inline-block"
                                      style={{ backgroundColor: r.color }}
                                      title={r.name}
                                    />
                                  ))}
                                </div>
                                <div
                                  className="text-xs font-semibold leading-tight"
                                  style={{ color: MD3.onBackground }}
                                >
                                  {cellBookings.length} booked
                                </div>
                              </div>
                            ) : (
                              /* Individual room — full color */
                              <div className="px-2 py-2 h-full flex flex-col justify-center gap-0.5">
                                <div
                                  className="text-xs font-semibold leading-tight truncate"
                                  style={{ color: '#FFFFFF' }}
                                >
                                  {cellBookings.length > 1
                                    ? `${cellBookings.length} bookings`
                                    : cellBookings[0]?.bookedBy}
                                </div>
                                <div
                                  className="text-xs leading-tight truncate"
                                  style={{ color: 'rgba(255,255,255,0.75)' }}
                                >
                                  <Clock className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />
                                  {cellBookings[0]?.timeSlot}
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="h-full w-full" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Bottom Status Bar ────────────────────────────────────────── */}
        <div
          className="flex items-center gap-6 px-6 py-2 flex-shrink-0"
          style={{
            backgroundColor: MD3.surface,
            borderTop: `1px solid ${MD3.outlineVariant}`,
            height: 40,
          }}
        >
          <div className="flex items-center gap-5">
            {ROOMS.map(room => (
              <div key={room.id} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ backgroundColor: room.color }}
                />
                <span className="text-xs" style={{ color: MD3.onSurfaceVariant }}>
                  {room.name}
                </span>
              </div>
            ))}
          </div>
          <div className="flex-1" />
          <span className="text-xs" style={{ color: MD3.onSurfaceVariant }}>
            Total bookings this month: <strong style={{ color: MD3.onBackground }}>{totalMonth}</strong>
          </span>
        </div>
      </div>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <button
        className="fixed bottom-8 right-8 flex items-center gap-2 px-5 py-4 rounded-2xl shadow-lg transition-all duration-150 z-10"
        style={{
          backgroundColor: MD3.primaryContainer,
          color: MD3.onPrimaryContainer,
          boxShadow: '0 3px 12px rgba(103,80,164,0.35)',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(103,80,164,0.45)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 3px 12px rgba(103,80,164,0.35)')}
        onClick={() => {
          // trigger today's single-click modal for quick add
          const today = new Date();
          setSingleDate(today);
          setSingleRoomId(null);
          setShowSingleModal(true);
        }}
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-semibold">New Booking</span>
      </button>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <MultiBookingModal
        isOpen={showMultiModal}
        onClose={handleMultiModalClose}
        selectedRooms={selRooms}
        selectedDates={selDates}
        onConfirm={handleMultiBookingConfirm}
      />

      {singleDate && (
        <DayDetailsModal
          isOpen={showSingleModal}
          onClose={() => { setShowSingleModal(false); setSingleDate(null); setSingleRoomId(null); }}
          date={singleDate}
          bookings={bookings.filter(b => {
            const d = format(b.date, 'yyyy-MM-dd') === format(singleDate, 'yyyy-MM-dd');
            return singleRoomId ? d && b.roomId === singleRoomId : d;
          })}
          rooms={singleRoomId ? ROOMS.filter(r => r.id === singleRoomId) : ROOMS}
          onAddBooking={handleAddSingleBooking}
        />
      )}
    </div>
  );
}
