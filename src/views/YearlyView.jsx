import React, { useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Target, Award, Star, Dumbbell, BookOpen, Briefcase, PlusCircle, Activity, TrendingUp, Zap } from 'lucide-react';

const iconMap = {
  Dumbbell, BookOpen, Briefcase, Star, PlusCircle, Activity
};

const YearlyView = () => {
  const { tasks, completions, routines } = useTracker();
  const dailyTasks = tasks.filter(t => t.frequency === 'daily');

  const monthlyData = useMemo(() => {
    const data = [];
    // Generate data for the last 12 months for better understanding
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const endDateToUse = end > new Date() ? new Date() : end;

      const daysInInterval = eachDayOfInterval({ start, end: endDateToUse });
      let totalTasksInMonth = daysInInterval.length * dailyTasks.length;
      let completedTasksInMonth = 0;

      daysInInterval.forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        const dayCompletions = completions[dateString] || [];
        completedTasksInMonth += dailyTasks.filter(t => dayCompletions.includes(t.id)).length;
      });

      data.push({
        name: format(monthDate, 'MMM yy'),
        percent: totalTasksInMonth === 0 ? 0 : Math.round((completedTasksInMonth / totalTasksInMonth) * 100),
        totalCompleted: completedTasksInMonth
      });
    }
    return data;
  }, [completions, dailyTasks]);

  const stats = useMemo(() => {
    const totalComps = Object.values(completions).reduce((acc, arr) => acc + arr.length, 0);
    const peakMonth = [...monthlyData].sort((a,b) => b.percent - a.percent)[0];
    
    // Average consistency (percentage of days with at least one task completed)
    const datesWithProgress = Object.keys(completions).filter(d => completions[d].length > 0).length;
    const consistencyRate = Math.round((datesWithProgress / 365) * 100);

    return { totalComps, peakMonth, consistencyRate };
  }, [completions, monthlyData]);

  // Heatmap Data (last 365 days)
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Start from the beginning of the week 52 weeks ago
    const startDate = startOfWeek(subDays(today, 364));

    for (let i = 0; i < 371; i++) { // roughly 53 weeks
      const date = subDays(today, 364 - i);
      const dateString = date.toISOString().split('T')[0];
      const count = (completions[dateString] || []).length;
      data.push({ date, count, dateString });
    }
    return data;
  }, [completions]);

  const maxDailyTasks = dailyTasks.length || 1;

  const getHeatmapColor = (count) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.03)';
    const intensity = Math.min(count / maxDailyTasks, 1);
    if (intensity <= 0.25) return 'rgba(99, 102, 241, 0.3)';
    if (intensity <= 0.5) return 'rgba(99, 102, 241, 0.5)';
    if (intensity <= 0.75) return 'rgba(99, 102, 241, 0.7)';
    return 'rgba(99, 102, 241, 1)'; // Indigo theme consistent with app
  };

  const routineProgress = useMemo(() => {
    return routines.map(routine => {
      const rTasks = dailyTasks.filter(t => t.routineId === routine.id);
      let totalPossible = 0;
      let completed = 0;

      // Last 6 months window
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const endDateToUse = end > new Date() ? new Date() : end;
        const daysInInterval = eachDayOfInterval({ start, end: endDateToUse });

        totalPossible += daysInInterval.length * rTasks.length;
        daysInInterval.forEach(date => {
          const dateString = date.toISOString().split('T')[0];
          const dayCompletions = completions[dateString] || [];
          completed += rTasks.filter(t => dayCompletions.includes(t.id)).length;
        });
      }

      const percent = totalPossible === 0 ? 0 : Math.round((completed / totalPossible) * 100);
      return { ...routine, percent, completed, totalPossible };
    }).sort((a, b) => b.percent - a.percent);
  }, [routines, dailyTasks, completions]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Yearly Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>A bird's eye view of your productivity journey.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div className="icon-container" style={{ color: 'var(--accent-purple)', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
            <Award size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{stats.totalComps}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Tasks Completed</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div className="icon-container" style={{ color: 'var(--accent-yellow)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <TrendingUp size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>{stats.peakMonth?.name || 'N/A'}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Peak Productivity Month</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div className="icon-container" style={{ color: 'var(--accent-green)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Zap size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>{stats.consistencyRate}<span style={{fontSize: '1rem'}}>%</span></h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Yearly Consistency</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ width: '100%', marginBottom: '2rem', padding: '1.5rem 2rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <Activity size={20} color="var(--accent-blue)" />
           Daily Activity Heatmap
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(53, 1fr)', 
          gridTemplateRows: 'repeat(7, 1fr)', 
          gap: '3px',
          height: '140px'
        }}>
          {heatmapData.map((day, idx) => (
            <div 
              key={idx}
              title={`${day.dateString}: ${day.count} tasks`}
              style={{
                backgroundColor: getHeatmapColor(day.count),
                borderRadius: '2px',
                width: '100%',
                height: '100%',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.5)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
          ))}
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Showing last 365 days of progress</p>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getHeatmapColor(i) }} />)}
              <span>More</span>
           </div>
        </div>
      </div>

      <div className="glass-card" style={{ height: '400px', width: '100%', padding: '1.5rem 2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>12-Month Performance Trend (%)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={monthlyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="yearlyTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <YAxis stroke="var(--text-secondary)" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '12px' }}
              itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="percent" 
              stroke="var(--accent-purple)" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#yearlyTrendGradient)" 
              activeDot={{ r: 8, fill: 'var(--accent-purple)', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card" style={{ width: '100%', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Long-term Routine Consistency (Last 6 Months)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{rp.percent}%</span>
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

export default YearlyView;
