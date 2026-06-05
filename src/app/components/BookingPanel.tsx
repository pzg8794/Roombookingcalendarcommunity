import { format } from 'date-fns';
import { Clock, Users, X } from 'lucide-react';

export interface Booking {
  id: string;
  roomId: string;
  date: Date;
  timeSlot: string;
  roomName: string;
  capacity: number;
  bookedBy: string;
}

interface BookingPanelProps {
  selectedDate: Date;
  bookings: Booking[];
  onBook: (roomId: string, timeSlot: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

const ROOMS = [
  { id: '1', name: 'Conference Room A', capacity: 10 },
  { id: '2', name: 'Conference Room B', capacity: 8 },
  { id: '3', name: 'Meeting Room 1', capacity: 6 },
  { id: '4', name: 'Meeting Room 2', capacity: 4 },
];

const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
];

export function BookingPanel({ selectedDate, bookings, onBook, onCancelBooking }: BookingPanelProps) {
  const isSlotBooked = (roomId: string, timeSlot: string) => {
    return bookings.some(
      booking =>
        booking.roomId === roomId &&
        booking.timeSlot === timeSlot &&
        format(booking.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
  };

  const getBookingForSlot = (roomId: string, timeSlot: string) => {
    return bookings.find(
      booking =>
        booking.roomId === roomId &&
        booking.timeSlot === timeSlot &&
        format(booking.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Room Bookings</h2>
        <p className="text-gray-600">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="space-y-6">
        {ROOMS.map(room => (
          <div key={room.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{room.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Users className="w-4 h-4" />
                  <span>Capacity: {room.capacity}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map(timeSlot => {
                const isBooked = isSlotBooked(room.id, timeSlot);
                const booking = getBookingForSlot(room.id, timeSlot);

                return (
                  <div key={timeSlot} className="relative">
                    {isBooked && booking ? (
                      <div className="bg-red-50 border border-red-200 rounded p-2 text-xs group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-red-700">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">{timeSlot}</span>
                          </div>
                          <button
                            onClick={() => onCancelBooking(booking.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-red-600 mt-1 truncate">
                          {booking.bookedBy}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onBook(room.id, timeSlot)}
                        className="w-full bg-green-50 border border-green-200 rounded p-2 text-xs hover:bg-green-100 transition-colors"
                      >
                        <div className="flex items-center justify-center gap-1 text-green-700">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">{timeSlot}</span>
                        </div>
                        <div className="text-green-600 mt-1">Available</div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ROOMS };
