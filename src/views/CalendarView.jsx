import React, { useState, useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
  isToday, isFuture
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays, Check, X } from 'lucide-react';

const CalendarView = () => {
  const { completions, tasks } = useTracker();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const dailyTasks = tasks.filter(t => t.frequency === 'daily');
  const totalDaily = dailyTasks.length;

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const getCompletionState = (date) => {
    if (isFuture(date) || totalDaily === 0) return null;
    const dateString = date.toISOString().split('T')[0];
    const dayCompletions = completions[dateString] || [];
    const completedCount = dailyTasks.filter(t => dayCompletions.includes(t.id)).length;

    if (completedCount === 0) return 'none';
    if (completedCount === totalDaily) return 'perfect';
    return 'partial';
  };

  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
  const selectedDayCompletions = selectedDateString ? (completions[selectedDateString] || []) : [];
  const completedTasksList = dailyTasks.filter(t => selectedDayCompletions.includes(t.id));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', height: '100%' }}>
      {/* Calendar Section */}
      <div style={{ flex: 2 }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>History & Calendar</h1>
            <p>Track your student routines across the entire month.</p>
          </div>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem' }}>
            <button onClick={prevMonth}><ChevronLeft /></button>
            <h2 style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth}><ChevronRight /></button>
          </div>
        </header>

        <div className="glass-card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {daysInMonth.map(day => {
              const state = getCompletionState(day);
              const isSelected = selectedDate && day.getTime() === selectedDate.getTime();

              let bgColor = 'var(--bg-tertiary)';
              if (state === 'perfect') bgColor = 'rgba(16, 185, 129, 0.2)';
              if (state === 'partial') bgColor = 'rgba(59, 130, 246, 0.2)';
              if (state === 'none' && !isFuture(day)) bgColor = 'rgba(239, 68, 68, 0.1)';

              let ringColor = 'transparent';
              if (state === 'perfect') ringColor = 'var(--accent-green)';
              if (state === 'partial') ringColor = 'var(--accent-blue)';

              return (
                <div
                  key={day.toString()}
                  onClick={() => !isFuture(day) && setSelectedDate(day)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: bgColor,
                    border: isSelected ? '2px solid var(--text-primary)' : `1px solid ${ringColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isFuture(day) ? 'not-allowed' : 'pointer',
                    opacity: isSameMonth(day, currentMonth) ? 1 : 0.3,
                    transition: 'all var(--transition-fast)'
                  }}
                  className={!isFuture(day) ? "hover-scale" : ""}
                >
                  <span style={{
                    fontWeight: isToday(day) ? 'bold' : 'normal',
                    color: isToday(day) ? 'var(--accent-blue)' : 'var(--text-primary)'
                  }}>
                    {format(day, 'd')}
                  </span>

                  {state === 'perfect' && <Check size={14} color="var(--accent-green)" style={{ marginTop: '4px' }} />}
                  {state === 'partial' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', marginTop: '8px' }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Panel for Selected Day */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedDate ? (
          <div className="glass-card animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays color="var(--accent-purple)" />
                {format(selectedDate, 'MMM do, yyyy')}
              </h2>
              <button onClick={() => setSelectedDate(null)}><X size={20} color="var(--text-muted)" /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Tasks Completed: {completedTasksList.length} / {totalDaily}
              </h3>

              {completedTasksList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {completedTasksList.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                      <Check size={18} color="var(--accent-green)" />
                      <span>{task.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                  No tasks completed on this date.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <CalendarDays size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Select a date on the calendar<br />to view historical details.</p>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hover-scale:hover { transform: scale(1.05); filter: brightness(1.2); }
      `}} />
    </div>
  );
};

export default CalendarView;
