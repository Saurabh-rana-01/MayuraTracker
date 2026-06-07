import React, { createContext, useContext, useState, useEffect } from 'react';

const TRACKER_STORAGE_KEY = 'mayura_tracker_data';

// Default initial state
const initialState = {
  routines: [
    { id: 'r1', name: 'Academics', color: '#10b981', icon: 'BookOpen' },
    { id: 'r2', name: 'Assignments', color: '#6366f1', icon: 'Briefcase' },
    { id: 'r3', name: 'Health & Fitness', color: '#f59e0b', icon: 'Dumbbell' }
  ],
  tasks: [
    { id: 't1', title: 'Attend all Lectures', routineId: 'r1', frequency: 'daily' },
    { id: 't2', title: '1 hr Revision', routineId: 'r1', frequency: 'daily' },
    { id: 't4', title: 'Start upcoming Essay', routineId: 'r2', frequency: 'daily' },
    { id: 't5', title: 'Group Project Prep', routineId: 'r2', frequency: 'daily' },
    { id: 't3', title: 'Morning Gym', routineId: 'r3', frequency: 'daily' }
  ],
  completions: {}, // { 'YYYY-MM-DD': ['t1', 't2'] }
};

export const TrackerContext = createContext();

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) throw new Error('useTracker must be used within a TrackerProvider');
  return context;
};

export const TrackerProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(TRACKER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialState;
    } catch (e) {
      console.error('Failed to load tracker data', e);
      return initialState;
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const toggleTaskCompletion = (taskId, dateString) => {
    setData(prev => {
      const dayCompletions = prev.completions[dateString] || [];
      const isCompleted = dayCompletions.includes(taskId);
      
      const newDayCompletions = isCompleted
        ? dayCompletions.filter(id => id !== taskId)
        : [...dayCompletions, taskId];

      return {
        ...prev,
        completions: {
          ...prev.completions,
          [dateString]: newDayCompletions
        }
      };
    });
  };

  const addRoutine = (routine) => {
    setData(prev => ({ ...prev, routines: [...prev.routines, { id: Date.now().toString(), ...routine }] }));
  };

  const addTask = (task) => {
    setData(prev => ({ ...prev, tasks: [...prev.tasks, { id: Date.now().toString(), ...task }] }));
  };

  const deleteTask = (taskId) => {
    setData(prev => {
      // Create a new completions object without the taskId
      const newCompletions = { ...prev.completions };
      Object.keys(newCompletions).forEach(date => {
        newCompletions[date] = newCompletions[date].filter(id => id !== taskId);
      });

      return {
        ...prev, 
        tasks: prev.tasks.filter(t => t.id !== taskId),
        completions: newCompletions
      };
    });
  };
  
  const deleteRoutine = (routineId) => {
    setData(prev => ({
       ...prev, 
       routines: prev.routines.filter(r => r.id !== routineId),
       tasks: prev.tasks.filter(t => t.routineId !== routineId)
    }));
  };

  const updateTask = (taskId, updates) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
  };

  return (
    <TrackerContext.Provider value={{
      ...data,
      toggleTaskCompletion,
      addRoutine,
      addTask,
      updateTask,
      deleteTask,
      deleteRoutine
    }}>
      {children}
    </TrackerContext.Provider>
  );
};
