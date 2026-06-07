import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Plus, Loader2, BrainCircuit } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';

const GoalAdvisor = () => {
  const { routines, tasks, addRoutine, addTask } = useTracker();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Mayura AI Advisor. What goal are you working on today? I can help you plan your day, break down complex projects, or just give you some motivation!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          current_state: { routines, tasks }
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now. Is the Python backend running?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRoutine = (jsonStr) => {
    try {
      const suggestion = JSON.parse(jsonStr);
      const routineId = Date.now().toString();
      
      addRoutine({
        id: routineId,
        name: suggestion.name,
        icon: suggestion.icon || 'Star',
        color: suggestion.color || '#3b82f6',
      });

      suggestion.tasks.forEach((task, idx) => {
        addTask({
          id: (Date.now() + idx + 1).toString(),
          title: task.title,
          routineId: routineId,
          time: task.time,
          frequency: 'daily'
        });
      });

      setMessages(prev => [...prev, { role: 'assistant', content: `Great! I've added the "${suggestion.name}" routine to your tracker.` }]);
    } catch (e) {
      console.error("Failed to parse routine suggestion", e);
    }
  };

  const renderContent = (content) => {
    const parts = content.split(/(\[ROUTINE_SUGGESTION\].*?\[\/ROUTINE_SUGGESTION\])/s);
    
    return parts.map((part, index) => {
      if (part.startsWith('[ROUTINE_SUGGESTION]')) {
        const jsonStr = part.replace('[ROUTINE_SUGGESTION]', '').replace('[/ROUTINE_SUGGESTION]', '').trim();
        let data;
        try { data = JSON.parse(jsonStr); } catch(e) { return null; }

        return (
          <div key={index} className="suggestion-card" style={{
            margin: '1rem 0',
            padding: '1rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid var(--accent-blue)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--accent-blue)' }}>
              <Sparkles size={16} />
              Proposed Routine: {data.name}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              {data.tasks.length} tasks scheduled
            </div>
            <button 
              onClick={() => handleApplyRoutine(jsonStr)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: 'var(--accent-blue)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} /> Apply this Routine
            </button>
          </div>
        );
      }
      return <p key={index} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{part}</p>;
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BrainCircuit size={32} color="var(--accent-blue)" />
          AI Goal Advisor
        </h1>
        <p>Your personal strategist for productivity and consistent growth.</p>
      </header>

      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              gap: '1rem', 
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: m.role === 'user' ? 'var(--bg-tertiary)' : 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} color="white" />}
              </div>
              <div style={{ 
                backgroundColor: m.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                borderTopRightRadius: m.role === 'user' ? 0 : 'var(--radius-md)',
                borderTopLeftRadius: m.role === 'assistant' ? 0 : 'var(--radius-md)',
              }}>
                {renderContent(m.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={18} color="white" className="animate-spin" />
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', borderTopLeftRadius: 0 }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ padding: '1.5rem', borderTop: '1px solid var(--bg-tertiary)', display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--bg-tertiary)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'var(--accent-blue)', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
              opacity: (!input.trim() || isLoading) ? 0.7 : 1
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoalAdvisor;
