import { X, Settings, User, Bell, Palette, Clock, Shield, Building2, ChevronRight, Moon, Sun, Monitor } from 'lucide-react';
import { useState } from 'react';

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

type SettingsSection = 'profile' | 'notifications' | 'appearance' | 'booking' | 'rooms' | 'security';

const SECTIONS: { id: SettingsSection; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: 'profile',       icon: <User className="w-4 h-4" />,      label: 'Profile',        desc: 'Name, email, avatar' },
  { id: 'notifications', icon: <Bell className="w-4 h-4" />,      label: 'Notifications',  desc: 'Alerts and reminders' },
  { id: 'appearance',    icon: <Palette className="w-4 h-4" />,   label: 'Appearance',     desc: 'Theme, density, colors' },
  { id: 'booking',       icon: <Clock className="w-4 h-4" />,     label: 'Booking Rules',  desc: 'Defaults, max duration' },
  { id: 'rooms',         icon: <Building2 className="w-4 h-4" />, label: 'Rooms',          desc: 'Manage room settings' },
  { id: 'security',      icon: <Shield className="w-4 h-4" />,    label: 'Security',       desc: 'Password, 2FA, sessions' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: value ? MD3.primary : MD3.outline }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
        style={{
          backgroundColor: value ? MD3.onPrimary : MD3.surface,
          left: value ? 'calc(100% - 22px)' : '2px',
        }}
      />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: MD3.onBackground }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: MD3.onSurfaceVariant }}>{desc}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionContent({ section }: { section: SettingsSection }) {
  const [emailNotifs, setEmailNotifs]     = useState(true);
  const [pushNotifs, setPushNotifs]       = useState(true);
  const [reminderNotifs, setReminderNotifs] = useState(true);
  const [dailyDigest, setDailyDigest]     = useState(false);
  const [theme, setTheme]                 = useState<'light' | 'dark' | 'system'>('system');
  const [compactView, setCompactView]     = useState(false);
  const [showWeekends, setShowWeekends]   = useState(true);
  const [defaultDuration, setDefaultDuration] = useState('60');
  const [maxDuration, setMaxDuration]     = useState('240');
  const [autoRelease, setAutoRelease]     = useState(true);
  const [bufferTime, setBufferTime]       = useState('0');
  const [twoFA, setTwoFA]                 = useState(false);

  const inputCls = "w-full px-3 py-2 text-sm rounded-t-sm outline-none";
  const inputStyle = {
    backgroundColor: MD3.surfaceVariant,
    color: MD3.onBackground,
    border: 'none',
    borderBottom: `2px solid ${MD3.outline}`,
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none' as const,
    cursor: 'pointer',
  };

  if (section === 'profile') return (
    <div className="space-y-4">
      <div>
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: MD3.primaryContainer, color: MD3.onPrimaryContainer }}
          >
            JD
          </div>
          <div>
            <button
              className="px-4 py-1.5 rounded-full text-xs font-medium border"
              style={{ borderColor: MD3.primary, color: MD3.primary }}
            >
              Change photo
            </button>
            <p className="text-xs mt-1" style={{ color: MD3.onSurfaceVariant }}>JPG or PNG, max 2MB</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MD3.onSurfaceVariant }}>Full Name</label>
            <input defaultValue="Jane Doe" className={inputCls} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderBottomColor = MD3.primary; e.currentTarget.style.backgroundColor = '#DDD8E4'; }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = MD3.outline; e.currentTarget.style.backgroundColor = MD3.surfaceVariant; }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MD3.onSurfaceVariant }}>Email</label>
            <input defaultValue="jane.doe@company.com" type="email" className={inputCls} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderBottomColor = MD3.primary; e.currentTarget.style.backgroundColor = '#DDD8E4'; }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = MD3.outline; e.currentTarget.style.backgroundColor = MD3.surfaceVariant; }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MD3.onSurfaceVariant }}>Department</label>
            <input defaultValue="Engineering" className={inputCls} style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderBottomColor = MD3.primary; e.currentTarget.style.backgroundColor = '#DDD8E4'; }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = MD3.outline; e.currentTarget.style.backgroundColor = MD3.surfaceVariant; }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MD3.onSurfaceVariant }}>Role</label>
            <select className={inputCls} style={selectStyle} defaultValue="admin"
              onFocus={e => { e.currentTarget.style.borderBottomColor = MD3.primary; }}
              onBlur={e => { e.currentTarget.style.borderBottomColor = MD3.outline; }}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  if (section === 'notifications') return (
    <div className="divide-y" style={{ borderColor: MD3.outlineVariant }}>
      <SettingRow label="Email notifications" desc="Booking confirmations and reminders via email">
        <Toggle value={emailNotifs} onChange={setEmailNotifs} />
      </SettingRow>
      <SettingRow label="Push notifications" desc="In-app alerts for upcoming bookings">
        <Toggle value={pushNotifs} onChange={setPushNotifs} />
      </SettingRow>
      <SettingRow label="Booking reminders" desc="Remind me 15 minutes before a booking">
        <Toggle value={reminderNotifs} onChange={setReminderNotifs} />
      </SettingRow>
      <SettingRow label="Daily digest" desc="Morning summary of the day's bookings">
        <Toggle value={dailyDigest} onChange={setDailyDigest} />
      </SettingRow>
      <SettingRow label="Reminder lead time" desc="How far in advance to notify you">
        <select className="text-xs px-2 py-1.5 rounded-lg outline-none" style={{ backgroundColor: MD3.surfaceVariant, color: MD3.onBackground, border: `1px solid ${MD3.outlineVariant}` }}>
          <option>15 min</option>
          <option>30 min</option>
          <option>1 hour</option>
        </select>
      </SettingRow>
    </div>
  );

  if (section === 'appearance') return (
    <div className="divide-y" style={{ borderColor: MD3.outlineVariant }}>
      <div className="py-3">
        <div className="text-sm font-medium mb-3" style={{ color: MD3.onBackground }}>Theme</div>
        <div className="flex gap-2">
          {([
            { id: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
            { id: 'dark',  icon: <Moon className="w-4 h-4" />, label: 'Dark' },
            { id: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-colors"
              style={{
                borderColor: theme === t.id ? MD3.primary : MD3.outlineVariant,
                backgroundColor: theme === t.id ? MD3.primaryContainer : 'transparent',
                color: theme === t.id ? MD3.primary : MD3.onSurfaceVariant,
              }}
            >
              {t.icon}
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <SettingRow label="Compact view" desc="Reduce row height to show more rooms">
        <Toggle value={compactView} onChange={setCompactView} />
      </SettingRow>
      <SettingRow label="Show weekends" desc="Include Saturday and Sunday in the grid">
        <Toggle value={showWeekends} onChange={setShowWeekends} />
      </SettingRow>
      <SettingRow label="Start week on" desc="Choose the first day of the week">
        <select className="text-xs px-2 py-1.5 rounded-lg outline-none" style={{ backgroundColor: MD3.surfaceVariant, color: MD3.onBackground, border: `1px solid ${MD3.outlineVariant}` }}>
          <option>Monday</option>
          <option>Sunday</option>
        </select>
      </SettingRow>
    </div>
  );

  if (section === 'booking') return (
    <div className="divide-y" style={{ borderColor: MD3.outlineVariant }}>
      <SettingRow label="Default duration" desc="Pre-filled duration when creating a booking">
        <select value={defaultDuration} onChange={e => setDefaultDuration(e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg outline-none" style={{ backgroundColor: MD3.surfaceVariant, color: MD3.onBackground, border: `1px solid ${MD3.outlineVariant}` }}>
          <option value="30">30 min</option>
          <option value="60">1 hour</option>
          <option value="90">1.5 hours</option>
          <option value="120">2 hours</option>
        </select>
      </SettingRow>
      <SettingRow label="Maximum duration" desc="Longest a single booking can run">
        <select value={maxDuration} onChange={e => setMaxDuration(e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg outline-none" style={{ backgroundColor: MD3.surfaceVariant, color: MD3.onBackground, border: `1px solid ${MD3.outlineVariant}` }}>
          <option value="120">2 hours</option>
          <option value="180">3 hours</option>
          <option value="240">4 hours</option>
          <option value="480">8 hours</option>
        </select>
      </SettingRow>
      <SettingRow label="Buffer time between bookings" desc="Gap required between consecutive bookings">
        <select value={bufferTime} onChange={e => setBufferTime(e.target.value)}
          className="text-xs px-2 py-1.5 rounded-lg outline-none" style={{ backgroundColor: MD3.surfaceVariant, color: MD3.onBackground, border: `1px solid ${MD3.outlineVariant}` }}>
          <option value="0">None</option>
          <option value="15">15 min</option>
          <option value="30">30 min</option>
        </select>
      </SettingRow>
      <SettingRow label="Auto-release no-shows" desc="Release room if check-in not done within 15 min">
        <Toggle value={autoRelease} onChange={setAutoRelease} />
      </SettingRow>
      <SettingRow label="Booking window" desc="How far in advance bookings can be made">
        <select className="text-xs px-2 py-1.5 rounded-lg outline-none" style={{ backgroundColor: MD3.surfaceVariant, color: MD3.onBackground, border: `1px solid ${MD3.outlineVariant}` }}>
          <option>2 weeks</option>
          <option>1 month</option>
          <option>3 months</option>
          <option>6 months</option>
        </select>
      </SettingRow>
    </div>
  );

  if (section === 'rooms') return (
    <div className="divide-y" style={{ borderColor: MD3.outlineVariant }}>
      <SettingRow label="Show capacity labels" desc="Display seat count on room rows">
        <Toggle value={true} onChange={() => {}} />
      </SettingRow>
      <SettingRow label="Show amenities" desc="Display room amenities in room details">
        <Toggle value={true} onChange={() => {}} />
      </SettingRow>
      <SettingRow label="Default room filter" desc="Which rooms are shown by default">
        <select className="text-xs px-2 py-1.5 rounded-lg outline-none" style={{ backgroundColor: MD3.surfaceVariant, color: MD3.onBackground, border: `1px solid ${MD3.outlineVariant}` }}>
          <option>All rooms</option>
          <option>Favourites only</option>
        </select>
      </SettingRow>
      <SettingRow label="Maintenance mode rooms" desc="Temporarily disable rooms for maintenance">
        <button className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: MD3.outline, color: MD3.onSurfaceVariant }}>
          Manage →
        </button>
      </SettingRow>
    </div>
  );

  if (section === 'security') return (
    <div className="divide-y" style={{ borderColor: MD3.outlineVariant }}>
      <SettingRow label="Two-factor authentication" desc="Require 2FA on login">
        <Toggle value={twoFA} onChange={setTwoFA} />
      </SettingRow>
      <SettingRow label="Session timeout" desc="Auto-logout after inactivity">
        <select className="text-xs px-2 py-1.5 rounded-lg outline-none" style={{ backgroundColor: MD3.surfaceVariant, color: MD3.onBackground, border: `1px solid ${MD3.outlineVariant}` }}>
          <option>30 minutes</option>
          <option>1 hour</option>
          <option>4 hours</option>
          <option>Never</option>
        </select>
      </SettingRow>
      <div className="py-3">
        <div className="text-sm font-medium mb-1" style={{ color: MD3.onBackground }}>Change password</div>
        <div className="text-xs mb-3" style={{ color: MD3.onSurfaceVariant }}>Last changed 3 months ago</div>
        <button className="px-4 py-2 rounded-full text-xs font-medium border" style={{ borderColor: MD3.primary, color: MD3.primary }}>
          Update password
        </button>
      </div>
      <div className="py-3">
        <div className="text-sm font-medium mb-1" style={{ color: MD3.onBackground }}>Active sessions</div>
        <div className="text-xs mb-3" style={{ color: MD3.onSurfaceVariant }}>2 devices signed in</div>
        <button className="px-4 py-2 rounded-full text-xs font-medium border" style={{ borderColor: MD3.error, color: MD3.error }}>
          Sign out all other devices
        </button>
      </div>
    </div>
  );

  return null;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
          onClick={onClose}
        />
      )}

      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: 520,
          backgroundColor: MD3.surface,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${MD3.outlineVariant}` }}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: MD3.primary }} />
            <span className="text-base font-semibold" style={{ color: MD3.onBackground }}>Settings</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: MD3.onSurfaceVariant }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.surfaceVariant)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar nav */}
          <div
            className="w-44 flex-shrink-0 py-2 overflow-y-auto"
            style={{ borderRight: `1px solid ${MD3.outlineVariant}`, backgroundColor: MD3.background }}
          >
            {SECTIONS.map(s => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                  style={{
                    backgroundColor: active ? MD3.secondaryContainer : 'transparent',
                    color: active ? MD3.onSecondaryContainer : MD3.onSurfaceVariant,
                    borderLeft: active ? `3px solid ${MD3.primary}` : '3px solid transparent',
                  }}
                >
                  <span className="flex-shrink-0">{s.icon}</span>
                  <span className="text-xs font-medium">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <h3 className="text-sm font-semibold mb-4" style={{ color: MD3.onBackground }}>
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h3>
            <SectionContent section={activeSection} />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${MD3.outlineVariant}` }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ color: MD3.primary }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = MD3.primaryContainer)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{ backgroundColor: MD3.primary, color: MD3.onPrimary }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
            onClick={onClose}
          >
            Save changes
          </button>
        </div>
      </div>
    </>
  );
}
