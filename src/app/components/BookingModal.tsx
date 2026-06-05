import { X } from 'lucide-react';
import { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  roomName: string;
  timeSlot: string;
  date: string;
}

export function BookingModal({ isOpen, onClose, onConfirm, roomName, timeSlot, date }: BookingModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Confirm Booking</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
          <div>
            <span className="text-sm text-gray-600">Room:</span>
            <p className="font-medium">{roomName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Date:</span>
            <p className="font-medium">{date}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Time:</span>
            <p className="font-medium">{timeSlot}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="bookerName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="bookerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
