import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Play, Pause, RotateCcw, CheckCircle, Coffee, Brain } from 'lucide-react';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const FocusView = () => {
  const { tasks, completions, toggleTaskCompletion } = useTracker();
  
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [timeRemaining, setTimeRemaining] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);

  // Get tasks that are not completed today
  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = completions[today] || [];
  const incompleteDailyTasks = tasks.filter(t => t.frequency === 'daily' && !todayCompletions.includes(t.id));

  // Switch modes
  const toggleMode = useCallback((newMode) => {
    setMode(newMode);
    setTimeRemaining(newMode === 'work' ? WORK_TIME : BREAK_TIME);
    setIsActive(false);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      // Timer finished!
      setIsActive(false);
      
      if (mode === 'work') {
        // Automatically check off task if selected 
        if (selectedTaskId) {
            // Check if it's already completed just in case
            if (!todayCompletions.includes(selectedTaskId)) {
                toggleTaskCompletion(selectedTaskId, today);
                alert("Pomodoro Complete! Task marked as done. Great focus!");
            }
        } else {
            alert("Pomodoro Complete! Time for a break.");
        }
        toggleMode('break');
      } else {
        alert("Break is over! Time to focus.");
        toggleMode('work');
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, mode, selectedTaskId, toggleTaskCompletion, today, todayCompletions, toggleMode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgressStrokeOffset = () => {
    const total = mode === 'work' ? WORK_TIME : BREAK_TIME;
    const progress = timeRemaining / total;
    const circumference = 2 * Math.PI * 120; // r=120
    return circumference - (progress * circumference);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-gradient">Focus Mode</h1>
        <p>Eliminate distractions and complete your routines using the Pomodoro technique.</p>
      </header>

      <div style={{ flex: 1, display: 'flex', gap: '2rem' }}>
        
        {/* Left Panel: Settings & Task Selection */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
             <h2 style={{ fontSize: '1.25rem' }}>Select Focus Task</h2>
             {incompleteDailyTasks.length > 0 ? (
               <select 
                 value={selectedTaskId}
                 onChange={(e) => setSelectedTaskId(e.target.value)}
                 style={{
                   width: '100%',
                   padding: '1rem',
                   borderRadius: 'var(--radius-sm)',
                   backgroundColor: 'var(--bg-tertiary)',
                   color: 'var(--text-primary)',
                   border: '1px solid rgba(255,255,255,0.1)',
                   outline: 'none',
                   fontSize: '1rem',
                   marginTop: '0.5rem',
                   cursor: 'pointer'
                 }}
               >
                 <option value="">-- Choose a task to focus on --</option>
                 {incompleteDailyTasks.map(task => (
                   <option key={task.id} value={task.id}>{task.title}</option>
                 ))}
               </select>
             ) : (
                <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} />
                  You have completed all your daily tasks!
                </div>
             )}
          </div>

          <div className="glass-card" style={{ flex: 1 }}>
             <h2 style={{ fontSize: '1.25rem' }}>How it works</h2>
             <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '1.5rem', marginTop: '1rem' }}>
               <li>Select a difficult task from your daily routine.</li>
               <li>Start the 25-minute Deep Work timer.</li>
               <li>Work continuously without distractions.</li>
               <li>When the timer ends, your task is automatically marked complete!</li>
               <li>Enjoy a 5-minute break.</li>
             </ul>
          </div>
        </div>

        {/* Right Panel: The Timer */}
        <div className="glass-card" style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
           
           <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                onClick={() => toggleMode('work')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-xl)', 
                  backgroundColor: mode === 'work' ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                  color: mode === 'work' ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600
                }}
              >
                <Brain size={18} /> Deep Work
              </button>
              <button 
                onClick={() => toggleMode('break')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-xl)', 
                  backgroundColor: mode === 'break' ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                  color: mode === 'break' ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600
                }}
              >
                <Coffee size={18} /> Short Break
              </button>
           </div>
           
           {/* Circular Timer Custom Component */}
           <div style={{ position: 'relative', width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
               {/* Background Track */}
               <circle cx="150" cy="150" r="120" stroke="var(--bg-tertiary)" strokeWidth="12" fill="none" />
               {/* Progress Track */}
               <circle 
                 cx="150" cy="150" r="120" 
                 stroke={mode === 'work' ? 'var(--accent-blue)' : 'var(--accent-green)'} 
                 strokeWidth="12" fill="none" 
                 strokeLinecap="round"
                 strokeDasharray={2 * Math.PI * 120}
                 strokeDashoffset={getProgressStrokeOffset()}
                 style={{ transition: 'stroke-dashoffset 1s linear' }}
               />
             </svg>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
               <span style={{ fontSize: '4.5rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-2px', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                 {formatTime(timeRemaining)}
               </span>
               <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '-0.5rem' }}>
                 {mode === 'work' ? 'Focus' : 'Relax'}
               </span>
             </div>
           </div>

           <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
              <button 
                onClick={() => setIsActive(!isActive)}
                style={{ 
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? 'var(--accent-red)' : 'var(--accent-blue)',
                  border: `2px solid ${isActive ? 'var(--accent-red)' : 'var(--accent-blue)'}`,
                  boxShadow: `0 0 15px ${isActive ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
                }}
              >
                {isActive ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
              </button>
              
              <button 
                onClick={() => { setIsActive(false); setTimeRemaining(mode === 'work' ? WORK_TIME : BREAK_TIME); }}
                style={{ 
                  width: '64px', height: '64px', borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <RotateCcw size={24} />
              </button>
           </div>
           
        </div>
      </div>
    </div>
  );
};

export default FocusView;
