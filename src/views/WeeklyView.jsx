import React, { useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { subDays, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Trophy, Star, Dumbbell, BookOpen, Briefcase, PlusCircle, Activity } from 'lucide-react';

const iconMap = {
  Dumbbell, BookOpen, Briefcase, Star, PlusCircle, Activity
};

const WeeklyView = () => {
  const { tasks, completions, routines } = useTracker();

  const dailyTasks = tasks.filter(t => t.frequency === 'daily');
  const totalDaily = dailyTasks.length;

  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = date.toISOString().split('T')[0];
      const dayCompletions = completions[dateString] || [];
      const completedCount = dailyTasks.filter(t => dayCompletions.includes(t.id)).length;

      data.push({
        name: format(date, 'EEE'), // Mon, Tue, etc.
        completed: completedCount,
        total: totalDaily,
        percent: totalDaily === 0 ? 0 : Math.round((completedCount / totalDaily) * 100)
      });
    }
    return data;
  }, [completions, dailyTasks, totalDaily]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const dateString = subDays(new Date(), i).toISOString().split('T')[0];
      const dayCompletions = completions[dateString] || [];
      if (dayCompletions.length > 0) {
        streak++;
      } else if (i > 0) {
        break; // Stop if not today and no completion
      }
    }
    return streak;
  }, [completions]);

  const routineProgress = useMemo(() => {
    return routines.map(routine => {
      const rTasks = dailyTasks.filter(t => t.routineId === routine.id);
      const totalPossible = rTasks.length * 7;
      let completed = 0;
      
      for (let i = 6; i >= 0; i--) {
        const dateString = subDays(new Date(), i).toISOString().split('T')[0];
        const dayCompletions = completions[dateString] || [];
        completed += rTasks.filter(t => dayCompletions.includes(t.id)).length;
      }
      
      const percent = totalPossible === 0 ? 0 : Math.round((completed / totalPossible) * 100);
      return { ...routine, percent, completed, totalPossible };
    }).sort((a, b) => b.percent - a.percent);
  }, [routines, dailyTasks, completions]);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Weekly Progress</h1>
        <p>A look at your performance over the last 7 days.</p>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}>
            <Flame size={32} color="var(--accent-yellow)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{currentStreak} Days</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Current Streak</p>
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
            <Trophy size={32} color="var(--accent-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>
              {weeklyData.reduce((acc, obj) => acc + (obj.percent === 100 ? 1 : 0), 0)}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Perfect Days (This week)</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ height: '400px', width: '100%', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Completion Rate (%)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={weeklyData}>
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)' }}
            />
            <Bar dataKey="percent" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card" style={{ width: '100%' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Routine Performance (Last 7 Days)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {routineProgress.length > 0 ? routineProgress.map(rp => {
            const IconComponent = iconMap[rp.icon] || Star;
            return (
              <div key={rp.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: `${rp.color}20`, borderRadius: '8px', color: rp.color }}>
                   <IconComponent size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>{rp.name}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{rp.completed} / {rp.totalPossible} ({rp.percent}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${rp.percent}%`, backgroundColor: rp.color, borderRadius: '4px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No routines found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;
