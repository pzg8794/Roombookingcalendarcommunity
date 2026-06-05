import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  bookedDates: Date[];
}

export function Calendar({ selectedDate, onDateSelect, bookedDates }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();

  // Create array of days including padding
  const calendarDays = Array(startDayOfWeek).fill(null).concat(daysInMonth);

  const hasBooking = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date));
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const hasBookings = hasBooking(day);
          const isPast = day < new Date() && !isCurrentDay;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              disabled={isPast}
              className={`
                aspect-square p-2 rounded-lg text-sm font-medium transition-all
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${!isSelected && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isCurrentDay && !isSelected ? 'border-2 border-blue-600' : ''}
                ${isPast ? 'opacity-30 cursor-not-allowed' : ''}
                ${!isSelected && !isPast ? 'hover:scale-105' : ''}
                relative
              `}
            >
              {format(day, 'd')}
              {hasBookings && (
                <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-600'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
