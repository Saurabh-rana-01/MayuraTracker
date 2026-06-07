import React, { useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { subDays, format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Target, Activity, CalendarDays, Star, Dumbbell, BookOpen, Briefcase, PlusCircle } from 'lucide-react';

const iconMap = {
  Dumbbell, BookOpen, Briefcase, Star, PlusCircle, Activity
};

const MonthlyView = () => {
  const { tasks, completions, routines } = useTracker();

  const dailyTasks = tasks.filter(t => t.frequency === 'daily');
  const totalDaily = dailyTasks.length;

  const { monthlyData, averageRate, totalCompleted } = useMemo(() => {
    const data = [];
    let sumRate = 0;
    let totalComp = 0;

    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateString = date.toISOString().split('T')[0];
      const dayCompletions = completions[dateString] || [];
      const completedCount = dailyTasks.filter(t => dayCompletions.includes(t.id)).length;

      const percent = totalDaily === 0 ? 0 : Math.round((completedCount / totalDaily) * 100);
      data.push({
        date: format(date, 'MMM dd'),
        percent: percent,
        completed: completedCount
      });
      sumRate += percent;
      totalComp += completedCount;
    }

    return {
      monthlyData: data,
      averageRate: Math.round(sumRate / 30),
      totalCompleted: totalComp
    };
  }, [completions, dailyTasks, totalDaily]);

  // Calculate routine distribution and progress over last 30 days
  const routineProgress = useMemo(() => {
    return routines.map(routine => {
      const rTasks = dailyTasks.filter(t => t.routineId === routine.id);
      const totalPossible = rTasks.length * 30;
      let completed = 0;
      
      for (let i = 29; i >= 0; i--) {
        const dateString = subDays(new Date(), i).toISOString().split('T')[0];
        const dayCompletions = completions[dateString] || [];
        completed += rTasks.filter(t => dayCompletions.includes(t.id)).length;
      }
      
      const percent = totalPossible === 0 ? 0 : Math.round((completed / totalPossible) * 100);
      return { ...routine, percent, completed, totalPossible };
    }).sort((a, b) => b.percent - a.percent);
  }, [routines, dailyTasks, completions]);

  const routineData = useMemo(() => {
    return routineProgress.map(rp => ({
      name: rp.name,
      value: rp.completed,
      color: rp.color
    })).filter(d => d.value > 0);
  }, [routineProgress]);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Monthly Dashboard</h1>
        <p>Your performance and trends over the last 30 days.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}>
            <Activity size={32} color="var(--accent-blue)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{averageRate}%</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Average Completion Rate</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}>
            <Target size={32} color="var(--accent-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{totalCompleted}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Total Tasks Completed</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}>
            <CalendarDays size={32} color="var(--accent-yellow)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>
              {monthlyData.filter(d => d.percent === 100).length}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Perfect Days</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: '2 1 500px', height: '400px' }}>
          <h3 style={{ marginBottom: '1rem' }}>30-Day Completion Trend</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} minTickGap={20} />
              <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Area type="monotone" dataKey="percent" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorPercent)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ flex: '1 1 300px', height: '400px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Routine Distribution</h3>
          {routineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={routineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {routineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '85%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No tasks completed in last 30 days
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ width: '100%', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Monthly Routine Performance (%)</h3>
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

export default MonthlyView;
