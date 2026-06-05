import { X, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export interface RoomInfo {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  capacity: number;
}

export interface BookingFormData {
  title: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
  notes: string;
}

interface MultiBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRooms: RoomInfo[];
  selectedDates: Date[];
  onConfirm: (data: BookingFormData) => void;
}

const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00',
];

const MD3 = {
  primary:          '#6750A4',
  onPrimary:        '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  surface:          '#FFFBFE',
  surfaceVariant:   '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline:          '#79747E',
  outlineVariant:   '#CAC4D0',
  onBackground:     '#1C1B1F',
  error:            '#B3261E',
  errorContainer:   '#F9DEDC',
  onErrorContainer: '#410E0B',
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: MD3.onSurfaceVariant }}>
      {children}
      {required && <span style={{ color: MD3.error }}> *</span>}
    </label>
  );
}

function InputBase({
  className = '',
  error,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-sm rounded-t-sm outline-none transition-colors ${className}`}
      style={{
        backgroundColor: MD3.surfaceVariant,
        color: MD3.onBackground,
        border: 'none',
        borderBottom: `2px solid ${error ? MD3.error : MD3.outline}`,
        ...style,
      }}
      onFocus={e => {
        e.currentTarget.style.borderBottomColor = error ? MD3.error : MD3.primary;
        e.currentTarget.style.backgroundColor = '#DDD8E4';
      }}
      onBlur={e => {
        e.currentTarget.style.borderBottomColor = error ? MD3.error : MD3.outline;
        e.currentTarget.style.backgroundColor = MD3.surfaceVariant;
      }}
    />
  );
}

function SelectBase({
  error,
  style,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2.5 text-sm rounded-t-sm outline-none transition-colors appearance-none cursor-pointer"
      style={{
        backgroundColor: MD3.surfaceVariant,
        color: MD3.onBackground,
        border: 'none',
        borderBottom: `2px solid ${error ? MD3.error : MD3.outline}`,
        ...style,
      }}
      onFocus={e => {
        e.currentTarget.style.borderBottomColor = MD3.primary;
        e.currentTarget.style.backgroundColor = '#DDD8E4';
      }}
      onBlur={e => {
        e.currentTarget.style.borderBottomColor = error ? MD3.error : MD3.outline;
        e.currentTarget.style.backgroundColor = MD3.surfaceVariant;
      }}
    />
  );
}

export function MultiBookingModal({
  isOpen,
  onClose,
  selectedRooms,
  selectedDates,
  onConfirm,
}: MultiBookingModalProps) {
  const [title, setTitle]         = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime]     = useState('10:00');
  const [bookedBy, setBookedBy]   = useState('');
  const [notes, setNotes]         = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())    e.title    = 'Meeting title is required';
    if (!bookedBy.trim()) e.bookedBy = 'Name is required';
    if (startTime >= endTime) e.time = 'End time must be after start time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onConfirm({ title: title.trim(), startTime, endTime, bookedBy: bookedBy.trim(), notes: notes.trim() });
    resetForm();
  };

  const resetForm = () => {
    setTitle(''); setStartTime('09:00'); setEndTime('10:00');
    setBookedBy(''); setNotes(''); setErrors({});
  };

  const handleClose = () => { resetForm(); onClose(); };

  const dateLabel = selectedDates.length === 0
    ? '—'
    : selectedDates.length === 1
      ? format(selectedDates[0], 'EEEE, MMM d, yyyy')
      : `${format(selectedDates[0], 'MMM d')} – ${format(selectedDates[selectedDates.length - 1], 'MMM d, yyyy')} (${selectedDates.length} days)`;

  const totalBookings = selectedRooms.length * selectedDates.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.52)' }}
    >
      {/* MD3 Dialog surface */}
      <div
        className="relative flex flex-col w-full overflow-hidden"
        style={{
          maxWidth: 520,
          maxHeight: '90vh',
          backgroundColor: '#ECE6F0',
          borderRadius: 28,
          boxShadow: '0 8px 48px rgba(0,0,0,0.28)',
        }}
      >
        {/* Dialog Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold" style={{ color: MD3.onBackground }}>
                New Booking
              </h2>
              <p className="text-sm mt-0.5" style={{ color: MD3.onSurfaceVariant }}>
                {totalBookings} booking{totalBookings !== 1 ? 's' : ''} will be created
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full flex items-center justify-center ml-3 flex-shrink-0 transition-colors"
              style={{ color: MD3.onSurfaceVariant }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selection Summary */}
        <div
          className="mx-6 mb-4 p-4 rounded-2xl flex-shrink-0"
          style={{ backgroundColor: MD3.surface }}
        >
          {/* Rooms */}
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: MD3.onSurfaceVariant }} />
            <div className="flex flex-wrap gap-1.5">
              {selectedRooms.length === 0 ? (
                <span className="text-sm" style={{ color: MD3.onSurfaceVariant }}>No rooms selected</span>
              ) : selectedRooms.map(room => (
                <span
                  key={room.id}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium"
                  style={{ backgroundColor: room.color }}
                >
                  {room.name}
                </span>
              ))}
            </div>
          </div>
          {/* Dates */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: MD3.onSurfaceVariant }} />
            <span className="text-sm" style={{ color: MD3.onBackground }}>{dateLabel}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5 overflow-y-auto flex-1">

          {/* Meeting Title */}
          <div>
            <FieldLabel required>Meeting Title</FieldLabel>
            <InputBase
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Weekly Standup, Client Review..."
              error={!!errors.title}
            />
            {errors.title && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" style={{ color: MD3.error }} />
                <p className="text-xs" style={{ color: MD3.error }}>{errors.title}</p>
              </div>
            )}
          </div>

          {/* Time Slot */}
          <div>
            <FieldLabel>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Time Slot
              </span>
            </FieldLabel>
            <div className="flex items-center gap-3">
              <SelectBase
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                error={!!errors.time}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </SelectBase>
              <span className="text-sm font-medium flex-shrink-0" style={{ color: MD3.onSurfaceVariant }}>to</span>
              <SelectBase
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                error={!!errors.time}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </SelectBase>
            </div>
            {errors.time && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" style={{ color: MD3.error }} />
                <p className="text-xs" style={{ color: MD3.error }}>{errors.time}</p>
              </div>
            )}
          </div>

          {/* Booked By */}
          <div>
            <FieldLabel required>Booked By</FieldLabel>
            <InputBase
              value={bookedBy}
              onChange={e => setBookedBy(e.target.value)}
              placeholder="Your name or team name"
              error={!!errors.bookedBy}
            />
            {errors.bookedBy && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" style={{ color: MD3.error }} />
                <p className="text-xs" style={{ color: MD3.error }}>{errors.bookedBy}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <FieldLabel>
              Notes <span className="font-normal" style={{ color: MD3.outline }}>(optional)</span>
            </FieldLabel>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional details, agenda, requirements..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-t-sm outline-none transition-colors resize-none"
              style={{
                backgroundColor: MD3.surfaceVariant,
                color: MD3.onBackground,
                border: 'none',
                borderBottom: `2px solid ${MD3.outline}`,
              }}
              onFocus={e => {
                e.currentTarget.style.borderBottomColor = MD3.primary;
                e.currentTarget.style.backgroundColor = '#DDD8E4';
              }}
              onBlur={e => {
                e.currentTarget.style.borderBottomColor = MD3.outline;
                e.currentTarget.style.backgroundColor = MD3.surfaceVariant;
              }}
            />
          </div>

          {/* Action Buttons — MD3 Dialog actions (text + filled) */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
              style={{ color: MD3.primary }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.primaryContainer)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: MD3.primary,
                color: MD3.onPrimary,
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              Confirm{totalBookings > 1 ? ` (${totalBookings})` : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
