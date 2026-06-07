import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DailyView from './views/DailyView';
import FocusView from './views/FocusView';
import WeeklyView from './views/WeeklyView';
import MonthlyView from './views/MonthlyView';
import YearlyView from './views/YearlyView';
import CalendarView from './views/CalendarView';

function App() {
  const [currentView, setCurrentView] = useState('daily');

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {currentView === 'daily' && <DailyView />}
        {currentView === 'focus' && <FocusView />}
        {currentView === 'weekly' && <WeeklyView />}
        {currentView === 'monthly' && <MonthlyView />}
        {currentView === 'yearly' && <YearlyView />}
        {currentView === 'calendar' && <CalendarView />}
      </main>
    </div>
  );
}

export default App;
