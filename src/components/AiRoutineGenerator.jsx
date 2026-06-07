import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, X, Check, BrainCircuit } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

const AiRoutineGenerator = ({ onCancel, onSuccess }) => {
  const { addRoutine, addTask } = useTracker();
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('1 hour daily');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    setError(null);
    setPreview(null);

    try {
      const response = await fetch('http://localhost:8000/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, duration }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate routine');
      }

      const data = await response.json();
      setPreview(data);
    } catch (err) {
      console.error('AI Generation error:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Could not connect to Python backend. Make sure it is running on port 8000.' 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removePreviewTask = (index) => {
    setPreview(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const handleApply = () => {
    if (!preview) return;

    // Add routine
    const routineId = Date.now().toString();
    addRoutine({
      id: routineId,
      name: preview.name,
      icon: preview.icon,
      color: preview.color,
      time: preview.time,
    });

    // Add tasks
    preview.tasks.forEach((task, index) => {
      addTask({
        id: (Date.now() + index + 1).toString(),
        title: task.title,
        routineId: routineId,
        time: task.time,
        frequency: 'daily',
      });
    });

    onSuccess();
  };

  return (
    <div className="glass-card animate-scale-in" style={{ padding: '1.5rem', border: '1px solid var(--accent-blue)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--accent-blue)" />
          AI Routine Generator
        </h3>
        <button onClick={onCancel} style={{ background: 'transparent' }}>
          <X size={20} color="var(--text-muted)" />
        </button>
      </div>

      {!preview ? (
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>What is your goal?</label>
            <textarea
              placeholder="e.g., Master React.js, Train for a marathon, Write a novel..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--bg-tertiary)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', opacity: 0.8 }}>Time Commitment</label>
            <input
              type="text"
              placeholder="e.g., 2 hours daily, 1 hour every morning"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--bg-tertiary)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !goal.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'var(--accent-blue)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading || !goal.trim() ? 0.7 : 1
            }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
            {isLoading ? 'AI is thinking...' : 'Generate AI Routine'}
          </button>
        </form>
      ) : (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: `1px solid ${preview.color}` }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: preview.color }}>
              {preview.name}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {preview.tasks.map((task, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <span style={{ opacity: 0.8 }}>• {task.title}</span>
                    {task.time && <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.75rem' }}>({task.time})</span>}
                  </div>
                  <button 
                    onClick={() => removePreviewTask(i)}
                    style={{ padding: '0.2rem', opacity: 0.5, backgroundColor: 'transparent' }}
                    title="Remove Task"
                  >
                    <X size={14} color="var(--text-muted)" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleApply}
              style={{ flex: 1, padding: '0.75rem', background: 'var(--accent-blue)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}
            >
              Apply to Tracker
            </button>
            <button
              onClick={() => setPreview(null)}
              style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRoutineGenerator;
