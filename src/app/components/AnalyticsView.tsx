import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts';
import { format, startOfMonth, eachDayOfInterval, endOfMonth, isToday } from 'date-fns';
import { TrendingUp, Calendar, Users, Building2 } from 'lucide-react';
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
  tertiary:            '#006E1C',
  tertiaryContainer:   '#B8F0C1',
  onTertiaryContainer: '#002106',
};

interface AnalyticsViewProps {
  rooms: RoomInfo[];
  bookings: Booking[];
  currentMonth: Date;
}

export function AnalyticsView({ rooms, bookings, currentMonth }: AnalyticsViewProps) {
  const monthStr = format(currentMonth, 'yyyy-MM');
  const monthBookings = bookings.filter(b => format(b.date, 'yyyy-MM') === monthStr);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });

  // Bookings per day (line chart)
  const dailyData = days.map(day => ({
    day: format(day, 'd'),
    bookings: bookings.filter(b => format(b.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length,
    isToday: isToday(day),
  }));

  // Bookings per room (bar chart)
  const roomData = rooms.map(r => ({
    name: r.name.split(' ').slice(-1)[0],
    fullName: r.name,
    bookings: monthBookings.filter(b => b.roomId === r.id).length,
    color: r.color,
  }));

  // Pie chart — share per room
  const pieData = rooms.map(r => ({
    name: r.name,
    value: monthBookings.filter(b => b.roomId === r.id).length,
    color: r.color,
  })).filter(d => d.value > 0);

  // Top bookers
  const bookerMap = new Map<string, number>();
  monthBookings.forEach(b => {
    const name = b.bookedBy.split('·')[0].trim();
    bookerMap.set(name, (bookerMap.get(name) ?? 0) + 1);
  });
  const topBookers = Array.from(bookerMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalToday = bookings.filter(b => isToday(b.date)).length;
  const mostBooked = roomData.reduce((a, b) => (b.bookings > a.bookings ? b : a), roomData[0]);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6" style={{ backgroundColor: MD3.background }}>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'This Month',
            value: monthBookings.length,
            sub: format(currentMonth, 'MMMM yyyy'),
            icon: <Calendar className="w-5 h-5" />,
            color: MD3.primary,
            bg: MD3.primaryContainer,
          },
          {
            label: 'Today',
            value: totalToday,
            sub: format(new Date(), 'EEEE, MMM d'),
            icon: <TrendingUp className="w-5 h-5" />,
            color: '#0061A4',
            bg: '#D1E4FF',
          },
          {
            label: 'Most Booked',
            value: mostBooked?.name ?? '—',
            sub: `${mostBooked?.bookings ?? 0} bookings`,
            icon: <Building2 className="w-5 h-5" />,
            color: '#BA4B00',
            bg: '#FFDBC8',
          },
          {
            label: 'Total Rooms',
            value: rooms.length,
            sub: `${rooms.reduce((s, r) => s + r.capacity, 0)} total seats`,
            icon: <Users className="w-5 h-5" />,
            color: '#006E1C',
            bg: '#B8F0C1',
          },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-5" style={{ backgroundColor: kpi.bg }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: kpi.color, opacity: 0.8 }}>{kpi.label}</span>
              <div style={{ color: kpi.color, opacity: 0.7 }}>{kpi.icon}</div>
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs" style={{ color: kpi.color, opacity: 0.7 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-4">

        {/* Daily bookings line chart */}
        <div className="col-span-2 rounded-2xl p-5" style={{ backgroundColor: MD3.surface }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: MD3.onBackground }}>
            Daily Bookings — {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={MD3.outlineVariant} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: MD3.onSurfaceVariant }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: MD3.onSurfaceVariant }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', backgroundColor: MD3.surfaceVariant, fontSize: 12 }}
                cursor={{ stroke: MD3.primary, strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke={MD3.primary}
                strokeWidth={2}
                dot={{ fill: MD3.primary, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Room share pie chart */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: MD3.surface }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: MD3.onBackground }}>Room Share</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', backgroundColor: MD3.surfaceVariant, fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 10, color: MD3.onSurfaceVariant }}>{value.split(' ').slice(-1)[0]}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs" style={{ color: MD3.onSurfaceVariant }}>
              No bookings this month
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Bar chart — bookings per room */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: MD3.surface }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: MD3.onBackground }}>Bookings by Room</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={roomData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: MD3.onSurfaceVariant }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: MD3.onSurfaceVariant }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', backgroundColor: MD3.surfaceVariant, fontSize: 12 }}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              />
              <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                {roomData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top bookers */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: MD3.surface }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: MD3.onBackground }}>Top Bookers</h3>
          {topBookers.length === 0 ? (
            <div className="flex items-center justify-center h-36 text-xs" style={{ color: MD3.onSurfaceVariant }}>
              No bookings this month
            </div>
          ) : (
            <div className="space-y-3">
              {topBookers.map(([name, count], idx) => {
                const maxCount = topBookers[0][1];
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: idx === 0 ? MD3.primary : MD3.surfaceVariant,
                        color: idx === 0 ? MD3.onPrimary : MD3.onSurfaceVariant,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium truncate" style={{ color: MD3.onBackground }}>{name}</span>
                        <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: MD3.primary }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: MD3.outlineVariant }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: MD3.primary }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
