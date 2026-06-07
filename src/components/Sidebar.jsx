import React from 'react';
import { Calendar, CheckSquare, BarChart2, LayoutDashboard, CalendarDays, Activity, Timer, BrainCircuit } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'daily', label: 'Daily', icon: CheckSquare },
    { id: 'focus', label: 'Focus Mode', icon: Timer },
    { id: 'weekly', label: 'Weekly', icon: Calendar },
    { id: 'monthly', label: 'Monthly', icon: Activity },
    { id: 'yearly', label: 'Yearly', icon: BarChart2 },
    { id: 'calendar', label: 'History', icon: CalendarDays },
  ];

  return (
    <aside className="sidebar">
      <div style={{ padding: '1rem 0', marginBottom: '1rem', borderBottom: '1px solid var(--bg-tertiary)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <LayoutDashboard className="text-accent-blue" />
          <span style={{ color: 'var(--accent-blue)' }}>Mayura</span> Tracker
        </h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Routine summary snippet could go here */}
      <div style={{ marginTop: 'auto', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Stay Consistent!</p>
        <p style={{ fontSize: '0.75rem' }}>Keep up your daily streaks to build lasting habits.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
