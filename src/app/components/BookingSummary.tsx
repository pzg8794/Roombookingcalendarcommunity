import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import type { Booking } from './BookingPanel';

interface BookingSummaryProps {
  bookings: Booking[];
}

export function BookingSummary({ bookings }: BookingSummaryProps) {
  const upcomingBookings = bookings
    .filter(booking => booking.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
      
      {upcomingBookings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No upcoming bookings</p>
      ) : (
        <div className="space-y-3">
          {upcomingBookings.map(booking => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{booking.roomName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(booking.date, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{booking.timeSlot}</span>
                  </div>
                </div>
                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {booking.bookedBy}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
