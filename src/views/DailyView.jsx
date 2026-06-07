import React, { useState, useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Check, Dumbbell, BookOpen, Briefcase, Star, Plus, Trash2, X, PlusCircle, Clock, Sparkles } from 'lucide-react';
import AiRoutineGenerator from '../components/AiRoutineGenerator';

const iconOptions = [
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Star', icon: Star },
  { name: 'PlusCircle', icon: PlusCircle },
];

const colorOptions = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

const DailyView = () => {
  const { routines, tasks, completions, toggleTaskCompletion, addRoutine, deleteRoutine, addTask, updateTask } = useTracker();

  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineTime, setNewRoutineTime] = useState('');
  const [newRoutineIcon, setNewRoutineIcon] = useState('Star');
  const [newRoutineColor, setNewRoutineColor] = useState('#10b981');

  // Track the routine ID that is currently adding a task
  const [addingTaskToRoutine, setAddingTaskToRoutine] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  // Quick Add State
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  // Inline Editing State
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskTime, setEditingTaskTime] = useState('');

  // Get today's date string YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = completions[today] || [];

  const dailyTasks = tasks.filter(t => t.frequency === 'daily');
  const totalTasks = dailyTasks.length;
  const completedCount = dailyTasks.filter(t => todayCompletions.includes(t.id)).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  const sortedRoutines = useMemo(() => {
    return [...routines].sort((a, b) => {
      // Put routines completely without time at the bottom
      if (!a.time && b.time) return 1;
      if (a.time && !b.time) return -1;
      if (!a.time && !b.time) return 0;

      // Compare HH:MM 24h strings directly
      return a.time.localeCompare(b.time);
    });
  }, [routines]);

  const handleAddRoutine = (e) => {
    e.preventDefault();
    if (!newRoutineName.trim()) return;
    addRoutine({
      name: newRoutineName.trim(),
      time: newRoutineTime,
      icon: newRoutineIcon,
      color: newRoutineColor,
    });
    setNewRoutineName('');
    setNewRoutineTime('');
    setIsAddingRoutine(false);
  };

  const handleDeleteRoutine = (routineId, routineName) => {
    if (window.confirm(`Are you sure you want to delete the "${routineName}" routine and all its tasks?`)) {
      deleteRoutine(routineId);
    }
  };

  const handleDeleteTask = (e, taskId, taskTitle) => {
    e.stopPropagation(); // Don't toggle completion when clicking delete
    if (window.confirm(`Delete task "${taskTitle}"?`)) {
      deleteTask(taskId);
    }
  };

  const handleAddTask = (e, routineId) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      routineId,
      time: newTaskTime,
      frequency: 'daily'
    });
    setNewTaskTitle('');
    setNewTaskTime('');
    setAddingTaskToRoutine(null);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addTask({
      title: quickTaskTitle.trim(),
      routineId: null, // Standalone task
      frequency: 'daily'
    });
    setQuickTaskTitle('');
  };

  const startEditing = (e, task) => {
    e.stopPropagation();
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setEditingTaskTime(task.time || '');
  };

  const saveEdit = (taskId) => {
    updateTask(taskId, {
      title: editingTaskTitle,
      time: editingTaskTime
    });
    setEditingTaskId(null);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  const standaloneTasks = dailyTasks.filter(t => !t.routineId);

  const renderTaskItem = (task) => {
    const isCompleted = todayCompletions.includes(task.id);
    const isEditing = editingTaskId === task.id;

    if (isEditing) {
      return (
        <div key={task.id} className="checkbox-container" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
            <input
              type="time"
              value={editingTaskTime}
              onChange={(e) => setEditingTaskTime(e.target.value)}
              className="inline-edit-input"
              style={{ width: '100px' }}
              colorScheme="dark"
            />
            <input
              type="text"
              value={editingTaskTitle}
              onChange={(e) => setEditingTaskTitle(e.target.value)}
              className="inline-edit-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit(task.id);
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button onClick={() => saveEdit(task.id)} title="Save">
              <Check size={16} color="var(--accent-green)" />
            </button>
            <button onClick={cancelEdit} title="Cancel">
              <X size={16} color="var(--text-muted)" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={task.id}
        className="checkbox-container"
        onClick={() => toggleTaskCompletion(task.id, today)}
        style={{ position: 'relative' }}
      >
        <div className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}>
          {isCompleted && <Check size={16} color="white" />}
        </div>
        <span 
          className={`task-text ${isCompleted ? 'completed' : ''}`} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={(e) => startEditing(e, task)}
          title="Click to edit"
        >
          {task.time && (
            <span style={{
              fontSize: '0.75rem',
              padding: '0.1rem 0.3rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)',
              fontWeight: 'bold'
            }}>
              {task.time}
            </span>
          )}
          {task.title}
        </span>

        <button 
          onClick={(e) => handleDeleteTask(e, task.id, task.title)}
          className="task-delete-btn"
          title="Delete Task"
          style={{
            marginLeft: 'auto',
            opacity: 0,
            transition: 'opacity 0.2s',
            padding: '0.25rem',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
        >
          <Trash2 size={14} color="var(--text-muted)" />
        </button>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-gradient">Today's Progress</h1>
        <p>Keep up the momentum! You've completed {completedCount} of {totalTasks} tasks today.</p>

        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </header>

      <form onSubmit={handleQuickAdd} className="quick-add-container">
        <Plus size={20} color="var(--accent-blue)" />
        <input 
          type="text" 
          className="quick-add-input" 
          placeholder="Quick add task to Daily To-Do..." 
          value={quickTaskTitle}
          onChange={(e) => setQuickTaskTitle(e.target.value)}
        />
        {quickTaskTitle && (
          <button type="submit" style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Add</button>
        )}
      </form>

      <div className="routines-grid">
        {/* Standalone Daily Tasks Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', border: standaloneTasks.length > 0 ? '1px solid var(--accent-blue)' : '1px dashed var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: 0 }}>
              <PlusCircle size={24} color="var(--accent-blue)" />
              Daily To-Do
            </h3>
            <span style={{ fontSize: '0.875rem', opacity: 0.5 }}>{standaloneTasks.length} tasks</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {standaloneTasks.length === 0 ? (
              <p style={{ fontSize: '0.875rem', textAlign: 'center', margin: '1rem 0', opacity: 0.5 }}>No standalone tasks.</p>
            ) : (
              standaloneTasks.map(task => renderTaskItem(task))
            )}
          </div>
        </div>

        {sortedRoutines.map(routine => {
          const routineTasks = dailyTasks.filter(t => t.routineId === routine.id);

          // Sort tasks within routine chronically 
          const sortedRoutineTasks = [...routineTasks].sort((a, b) => {
            if (!a.time && b.time) return 1;
            if (a.time && !b.time) return -1;
            if (!a.time && !b.time) return 0;
            return a.time.localeCompare(b.time);
          });

          const IconComponent = iconOptions.find(opt => opt.name === routine.icon)?.icon || Star;

          return (
            <div key={routine.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: 0 }}>
                    <IconComponent size={24} color={routine.color} />
                    {routine.name}
                  </h3>
                  {routine.time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', paddingLeft: '2rem' }}>
                      <Clock size={14} />
                      {routine.time}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setAddingTaskToRoutine(routine.id); setNewTaskTitle(''); setNewTaskTime(''); }} title="Add Task">
                    <Plus size={18} color="var(--text-muted)" />
                  </button>
                  <button onClick={() => handleDeleteRoutine(routine.id, routine.name)} title="Delete Routine">
                    <Trash2 size={18} color="var(--text-muted)" />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {sortedRoutineTasks.length === 0 && addingTaskToRoutine !== routine.id && (
                  <p style={{ fontSize: '0.875rem', textAlign: 'center', margin: '1rem 0', opacity: 0.5 }}>No tasks yet.</p>
                )}

                {sortedRoutineTasks.map(task => renderTaskItem(task))}

                {addingTaskToRoutine === routine.id && (
                  <form onSubmit={(e) => handleAddTask(e, routineId)} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="time"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        style={{
                          width: '80px',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--bg-tertiary)',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          colorScheme: 'dark'
                        }}
                      />
                      <input
                        type="text"
                        autoFocus
                        placeholder="New task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--bg-tertiary)',
                          background: 'transparent',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" style={{ flex: 1, padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                        Save Task
                      </button>
                      <button type="button" onClick={() => setAddingTaskToRoutine(null)} style={{ padding: '0.5rem', background: 'transparent' }}>
                        <X size={16} color="var(--text-muted)" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Routine Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderStyle: isAddingRoutine ? 'solid' : 'dashed' }}>
          {!isAddingRoutine ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', opacity: 0.7, width: '100%', padding: '1rem' }}
                onClick={() => setIsAddingRoutine(true)}
              >
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '50%' }}>
                  <Plus size={24} color="var(--text-primary)" />
                </div>
                <p style={{ fontWeight: 500, margin: 0 }}>Create 24h Routine</p>
              </div>
              
              <div style={{ width: '80%', height: '1px', background: 'var(--bg-tertiary)', opacity: 0.3 }}></div>
              
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', opacity: 0.7, width: '100%', padding: '1rem' }}
                onClick={() => { setIsAiGenerating(true); setIsAddingRoutine(false); }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
                  <Sparkles size={24} color="var(--accent-blue)" />
                </div>
                <p style={{ fontWeight: 500, margin: 0, color: 'var(--accent-blue)' }}>Generate with AI</p>
              </div>
            </div>
          ) : isAiGenerating ? (
            <AiRoutineGenerator 
              onCancel={() => setIsAiGenerating(false)} 
              onSuccess={() => { setIsAiGenerating(false); }} 
            />
          ) : (
            <form onSubmit={handleAddRoutine} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0 }}>New 24h Routine</h3>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Routine Name"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  autoFocus
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--bg-tertiary)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />

                <input
                  type="time"
                  value={newRoutineTime}
                  onChange={(e) => setNewRoutineTime(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--bg-tertiary)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    colorScheme: 'dark'
                  }}
                />
              </div>

              <div>
                <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Color</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewRoutineColor(color)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%', backgroundColor: color,
                        border: newRoutineColor === color ? '2px solid white' : '2px solid transparent'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Icon</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {iconOptions.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setNewRoutineIcon(opt.name)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: newRoutineIcon === opt.name ? 'var(--bg-tertiary)' : 'transparent',
                        }}
                      >
                        <Icon size={20} color={newRoutineIcon === opt.name ? newRoutineColor : 'var(--text-muted)'} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '0.75rem', background: 'var(--accent-blue)', color: 'white', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingRoutine(false)}
                  style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyView;
