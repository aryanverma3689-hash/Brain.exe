import React, { useState, useRef, useEffect } from 'react';
import { useMood } from '../context/MoodContext';
import Sidebar from '../components/chat/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function ChatPage({ setPaletteOpen }) {
  const { currentMood, setCurrentMood } = useMood();
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(() => {
    return localStorage.getItem('isWebSearchEnabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isWebSearchEnabled', isWebSearchEnabled);
  }, [isWebSearchEnabled]);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  const createNewChat = async (title = 'New Chat') => {
    const finalTitle = typeof title === 'string' ? title : 'New Chat';
    if (isLoading) handleStop();
    const newSession = {
      id: Date.now().toString(),
      title: finalTitle,
      mood: currentMood?.id || 'general',
      messages: []
    };
    try {
      await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      return newSession.id;
    } catch (e) {
      console.error(e);
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      return newSession.id;
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sessions`);
        const data = await res.json();
        if (data && data.length > 0) {
          setSessions(data);
          setActiveSessionId(data[0].id);
        } else {
          createNewChat();
        }
      } catch (err) {
        console.error("Failed to load sessions", err);
        const initial = [{ id: '1', title: 'New Chat', mood: currentMood.id, messages: [] }];
        setSessions(initial);
        setActiveSessionId('1');
      }
    };
    fetchSessions();
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    try {
      await fetch(`${API_BASE}/api/sessions/${id}`, { method: 'DELETE' });
      const updatedSessions = sessions.filter(s => s.id !== id);
      setSessions(updatedSessions);
      if (activeSessionId === id) {
        setActiveSessionId(updatedSessions[0].id);
      }
    } catch (e) {
      console.error(e);
      const updatedSessions = sessions.filter(s => s.id !== id);
      setSessions(updatedSessions);
      if (activeSessionId === id) {
        setActiveSessionId(updatedSessions[0].id);
      }
    }
  };

  const scrollToBottom = () => {
    const autoScroll = localStorage.getItem('brain_setting_auto_scroll');
    if (autoScroll !== 'false') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const playSound = () => {
    const soundEnabled = localStorage.getItem('brain_setting_notif_sound');
    if (soundEnabled === 'true') {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTEAAAAAAABAPz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/');
        audio.volume = 0.2;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  };

  const handleSend = async () => {
    if (!input.trim() && images.length === 0 && documents.length === 0) return;

    if (isLoading) {
      handleStop();
    }

    let currentInput = input.trim();
    if (documents.length > 0) {
      currentInput += "\n\n";
      documents.forEach(doc => {
        currentInput += `\n--- Attached Document: ${doc.name} ---\n${doc.text}\n`;
      });
    }

    const currentImages = [...images];
    
    const userMessage = { role: 'user', content: currentInput, images: currentImages };
    const aiMessagePlaceholder = { role: 'assistant', content: '' };

    const updatedMessages = [...messages, userMessage, aiMessagePlaceholder];
    const generatedTitle = messages.length === 0 ? (input.trim().substring(0, 30) || 'Attachment') + '...' : activeSession.title;

    const updatedSessions = sessions.map(s => 
      s.id === activeSessionId 
        ? { ...s, title: generatedTitle, messages: updatedMessages }
        : s
    );
    setSessions(updatedSessions);
    
    if (messages.length === 0) {
      fetch(`${API_BASE}/api/sessions/${activeSessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: generatedTitle })
      }).catch(console.error);
    }

    playSound();
    setInput('');
    setImages([]);
    setDocuments([]);
    setIsLoading(true);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    abortControllerRef.current = new AbortController();

    try {
      const sysPrompt = localStorage.getItem('brain_setting_sys_prompt') || '';
      const apiKey = localStorage.getItem('brain_setting_api_key') || '';
      const textModel = localStorage.getItem('brain_setting_text_model') || 'Brain Core (Flash 2.5)';

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: activeSessionId,
          prompt: currentInput,
          images: currentImages,
          history: messages,
          mood: currentMood.id,
          web_search: isWebSearchEnabled,
          sys_prompt: sysPrompt,
          api_key: apiKey,
          text_model: textModel
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Server error');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.response) {
                aiResponse += data.response;
                
                setSessions(prev => prev.map(s => 
                  s.id === activeSessionId 
                    ? { ...s, messages: [...s.messages.slice(0, -1), { role: 'assistant', content: aiResponse }] }
                    : s
                ));
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Chat error:", error);
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId 
            ? { ...s, messages: [...s.messages.slice(0, -1), { role: 'assistant', content: 'Sorry, I encountered an error. Please ensure the backend is running.' }] }
            : s
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    const pressEnter = localStorage.getItem('brain_setting_press_enter');
    if (e.key === 'Enter' && !e.shiftKey && pressEnter !== 'false') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRegenerate = () => {
    if (isLoading || messages.length === 0) return;
    
    // Find last user message
    const lastUserMessageIndex = messages.findLastIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[lastUserMessageIndex];
    const newMessages = messages.slice(0, lastUserMessageIndex + 1);
    
    // Remove all messages after the last user message
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: newMessages }
        : s
    ));
    
    // Set input and trigger send
    setInput(lastUserMessage.content);
    if (lastUserMessage.images) setImages(lastUserMessage.images);
    
    // Wait for state to update, then trigger handleSend
    setTimeout(() => {
      handleSend();
    }, 0);
  };

  const updateSessionTitle = async (id, newTitle) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    } catch (e) {
      console.error(e);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    }
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-white/20 text-white">
      <Sidebar 
        currentMood={currentMood}
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        createNewChat={createNewChat}
        deleteSession={deleteSession}
        updateSessionTitle={updateSessionTitle}
        setPaletteOpen={setPaletteOpen}
        isLoading={isLoading}
        handleStop={handleStop}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-black/40 backdrop-blur-xl relative">
        <ChatHeader 
          activeSession={activeSession} 
          currentMood={currentMood} 
          setCurrentMood={setCurrentMood} 
          isMoodMenuOpen={isMoodMenuOpen} 
          setIsMoodMenuOpen={setIsMoodMenuOpen} 
          setPaletteOpen={setPaletteOpen} 
          sessions={sessions}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />

        <MessageList 
          messages={messages}
          currentMood={currentMood}
          messagesEndRef={messagesEndRef}
          onSuggestionClick={handleSuggestionClick}
          onRegenerate={handleRegenerate}
        />

        <ChatInput 
          input={input}
          setInput={setInput}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleSend={handleSend}
          isLoading={isLoading}
          handleStop={handleStop}
          textareaRef={textareaRef}
          currentMood={currentMood}
          images={images}
          setImages={setImages}
          documents={documents}
          setDocuments={setDocuments}
          isWebSearchEnabled={isWebSearchEnabled}
          setIsWebSearchEnabled={setIsWebSearchEnabled}
        />
      </div>
    </div>
  );
}
