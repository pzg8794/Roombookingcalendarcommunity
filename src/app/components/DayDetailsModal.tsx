import { X, Clock, Users, MapPin, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { Booking } from './BookingPanel';
import { useState } from 'react';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  bookings: Booking[];
  rooms: Array<{ id: string; name: string; capacity: number; color: string }>;
  onAddBooking: (roomId: string, timeSlot: string, bookedBy: string) => void;
}

const TIME_SLOTS = [
  '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
  '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
];

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
  onBackground:       '#1C1B1F',
  error:              '#B3261E',
  errorContainer:     '#F9DEDC',
  onErrorContainer:   '#410E0B',
  tertiary:           '#006E1C',
  tertiaryContainer:  '#B8F0C1',
  onTertiaryContainer:'#002106',
};

export function DayDetailsModal({ isOpen, onClose, date, bookings, rooms, onAddBooking }: DayDetailsModalProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoom, setSelectedRoom]       = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookerName, setBookerName]           = useState('');
  const [activeRoomTab, setActiveRoomTab]     = useState<string>(rooms[0]?.id ?? '');

  if (!isOpen) return null;

  const isSlotBooked = (roomId: string, timeSlot: string) =>
    bookings.some(b => b.roomId === roomId && b.timeSlot === timeSlot);

  const getBookingForSlot = (roomId: string, timeSlot: string) =>
    bookings.find(b => b.roomId === roomId && b.timeSlot === timeSlot);

  const handleBookSlot = (roomId: string, timeSlot: string) => {
    setSelectedRoom(roomId);
    setSelectedTimeSlot(timeSlot);
    setShowBookingForm(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookerName.trim() && selectedRoom && selectedTimeSlot) {
      onAddBooking(selectedRoom, selectedTimeSlot, bookerName.trim());
      setBookerName('');
      setShowBookingForm(false);
      setSelectedRoom('');
      setSelectedTimeSlot('');
    }
  };

  const handleCloseModal = () => {
    setShowBookingForm(false);
    setSelectedRoom('');
    setSelectedTimeSlot('');
    setBookerName('');
    onClose();
  };

  const currentRoom = rooms.find(r => r.id === activeRoomTab) ?? rooms[0];
  const availableCount = TIME_SLOTS.filter(ts => !isSlotBooked(activeRoomTab, ts)).length;
  const bookedCount    = TIME_SLOTS.filter(ts =>  isSlotBooked(activeRoomTab, ts)).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.52)' }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 720,
          maxHeight: '92vh',
          backgroundColor: '#ECE6F0',
          borderRadius: 28,
          boxShadow: '0 8px 48px rgba(0,0,0,0.28)',
          overflow: 'hidden',
        }}
      >
        {/* ── Dialog Header ──────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: MD3.onSurfaceVariant }}>
                Day Details
              </p>
              <h2 className="text-xl font-semibold" style={{ color: MD3.onBackground }}>
                {format(date, 'EEEE, MMMM d')}
                <span className="ml-2 text-base font-normal" style={{ color: MD3.onSurfaceVariant }}>
                  {format(date, 'yyyy')}
                </span>
              </h2>
              <p className="text-sm mt-0.5" style={{ color: MD3.onSurfaceVariant }}>
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} scheduled across all rooms
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-3"
              style={{ color: MD3.onSurfaceVariant }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Room Tab Bar ───────────────────────────────────────────── */}
        <div
          className="flex items-end gap-0 flex-shrink-0 overflow-x-auto px-6"
          style={{ borderBottom: `1px solid ${MD3.outlineVariant}` }}
        >
          {rooms.map(room => {
            const active = activeRoomTab === room.id;
            const rBooked = bookings.filter(b => b.roomId === room.id).length;
            return (
              <button
                key={room.id}
                onClick={() => { setActiveRoomTab(room.id); setShowBookingForm(false); }}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap relative flex-shrink-0"
                style={{
                  color: active ? MD3.primary : MD3.onSurfaceVariant,
                  borderBottom: active ? `3px solid ${MD3.primary}` : '3px solid transparent',
                  marginBottom: -1,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: room.color }}
                />
                {room.name}
                {rBooked > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: room.color, color: '#fff', fontSize: 10 }}
                  >
                    {rBooked}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Room header strip */}
          {currentRoom && (
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3 mb-4"
              style={{ backgroundColor: currentRoom.color }}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white opacity-80" />
                <span className="text-sm font-semibold text-white">{currentRoom.name}</span>
              </div>
              <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 opacity-80" />
                  <span className="opacity-90">{currentRoom.capacity} seats</span>
                </div>
                <div
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  {bookedCount} booked · {availableCount} free
                </div>
              </div>
            </div>
          )}

          {/* Quick booking form */}
          {showBookingForm && (
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: MD3.primaryContainer }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: MD3.onPrimaryContainer }}>
                Book slot: <span style={{ opacity: 0.8 }}>{selectedTimeSlot}</span>
              </p>
              <form onSubmit={handleSubmitBooking} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: MD3.onPrimaryContainer }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={bookerName}
                    onChange={e => setBookerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full px-3 py-2 text-sm rounded-t-sm outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      color: MD3.onBackground,
                      border: 'none',
                      borderBottom: `2px solid ${MD3.primary}`,
                    }}
                  />
                </div>
                <div className="flex gap-2 pb-0.5">
                  <button
                    type="button"
                    onClick={() => { setShowBookingForm(false); setBookerName(''); }}
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{ color: MD3.primary, backgroundColor: 'rgba(255,255,255,0.5)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{ backgroundColor: MD3.primary, color: MD3.onPrimary }}
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Time Slots Grid */}
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(timeSlot => {
              const booked  = isSlotBooked(activeRoomTab, timeSlot);
              const booking = getBookingForSlot(activeRoomTab, timeSlot);
              const isSelectedForForm = selectedTimeSlot === timeSlot && showBookingForm;

              return (
                <div
                  key={timeSlot}
                  onClick={() => !booked && !showBookingForm && handleBookSlot(activeRoomTab, timeSlot)}
                  className="rounded-2xl p-3 transition-all cursor-pointer"
                  style={{
                    backgroundColor: booked
                      ? MD3.errorContainer
                      : isSelectedForForm
                        ? MD3.primaryContainer
                        : MD3.surface,
                    border: isSelectedForForm
                      ? `2px solid ${MD3.primary}`
                      : booked
                        ? `1px solid rgba(179,38,30,0.2)`
                        : `1px solid ${MD3.outlineVariant}`,
                    cursor: booked ? 'default' : 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!booked) e.currentTarget.style.backgroundColor = isSelectedForForm ? MD3.primaryContainer : MD3.surfaceVariant;
                  }}
                  onMouseLeave={e => {
                    if (!booked) e.currentTarget.style.backgroundColor = isSelectedForForm ? MD3.primaryContainer : MD3.surface;
                  }}
                >
                  {/* Time */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: booked ? MD3.error : MD3.primary }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: booked ? MD3.onErrorContainer : MD3.onPrimaryContainer }}
                    >
                      {timeSlot}
                    </span>
                  </div>

                  {/* Status */}
                  {booked && booking ? (
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <XCircle className="w-3 h-3 flex-shrink-0" style={{ color: MD3.error }} />
                        <span
                          className="text-xs font-medium"
                          style={{ color: MD3.onErrorContainer }}
                        >
                          Booked
                        </span>
                      </div>
                      <p
                        className="text-xs truncate pl-4"
                        style={{ color: MD3.error, opacity: 0.8 }}
                      >
                        {booking.bookedBy}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {isSelectedForForm ? (
                        <>
                          <Plus className="w-3 h-3 flex-shrink-0" style={{ color: MD3.primary }} />
                          <span className="text-xs font-medium" style={{ color: MD3.primary }}>
                            Booking...
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: MD3.tertiary }} />
                          <span className="text-xs font-medium" style={{ color: MD3.tertiary }}>
                            Available
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Dialog Footer ──────────────────────────────────────────── */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${MD3.outlineVariant}` }}
        >
          <button
            onClick={handleCloseModal}
            className="px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            style={{ color: MD3.primary }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.primaryContainer)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
