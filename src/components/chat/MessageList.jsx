import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Bot, FileText, Copy, RefreshCw, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import CodeBlock from './CodeBlock';
import NexusOrb from '../ui/NexusOrb';
import { Tooltip, TooltipProvider } from '../ui/Tooltip';
import { toast } from 'sonner';

export default function MessageList({ messages, currentMood, messagesEndRef, onSuggestionClick, onRegenerate }) {
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  const renderUserContent = (content) => {
    const docIndex = content.indexOf('\n\n\n--- Attached Document:'); // Wait, the split is just "\n--- Attached Document:" or "\n\n\n---" ?
    // Let's use a more robust check:
    const startIdx = content.indexOf('\n--- Attached Document:');
    if (startIdx !== -1) {
      const textPart = content.substring(0, startIdx);
      const docsPart = content.substring(startIdx);
      
      const docNames = [];
      const regex = /--- Attached Document: (.*?) ---/g;
      let match;
      while ((match = regex.exec(docsPart)) !== null) {
        docNames.push(match[1].trim());
      }
      
      return (
        <>
          <div className="whitespace-pre-wrap">{textPart.trim()}</div>
          {docNames.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {docNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-[0.8rem] bg-black/20 border border-white/10 rounded-md px-3 py-2 w-fit shadow-sm">
                  <FileText size={14} className="opacity-70" />
                  <span className="opacity-90 font-medium">{name}</span>
                  <span className="opacity-50 ml-1 text-[0.7rem] uppercase tracking-wider">(Read by AI)</span>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');

  useEffect(() => {
    const handleNameChange = () => setUserName(localStorage.getItem('userName') || 'User');
    window.addEventListener('profileUpdate', handleNameChange);
    return () => window.removeEventListener('profileUpdate', handleNameChange);
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-24 pt-24 pb-36 flex flex-col gap-6 custom-scrollbar scroll-smooth">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-10"
        >
          <NexusOrb 
            size={120} 
            moodColor={`from-${currentMood.color}-400 to-${currentMood.color}-600`}
            glowColor={`bg-${currentMood.color}-500/20`}
            isThinking={false}
            className="mb-10"
          />
          <h2 className="text-3xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Hi, {userName}.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-12">
            What would you like to build today?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
            {[
              { icon: '🚀', text: 'Build an AI Project' },
              { icon: '💻', text: 'Debug my Code' },
              { icon: '📚', text: 'Explain a Concept' },
              { icon: '📝', text: 'Summarize a PDF' }
            ].map((suggestion, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSuggestionClick && onSuggestionClick(suggestion.text)}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{suggestion.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <TooltipProvider>
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-24 pt-24 pb-36 flex flex-col gap-6 custom-scrollbar scroll-smooth">
      {messages.map((msg, index) => (
        <motion.div 
          key={index} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}
        >
          <div className="flex flex-col gap-2 max-w-[95%] sm:max-w-[85%] w-full sm:w-auto">
            <div className={cn(
              "rounded-2xl px-5 py-3.5 leading-relaxed text-[0.95rem]",
              msg.role === 'user' 
                ? "bg-[#1A1A1D] text-white rounded-br-sm border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" 
                : cn("bg-black/40 backdrop-blur-2xl text-white/90 border border-white/5 shadow-lg", `shadow-${currentMood.color}-500/5`)
            )}>
              {msg.role === 'assistant' ? (
                msg.content === '' ? (
                  <div className="flex flex-col gap-3 py-2 px-1 w-48">
                    <div className="flex items-center gap-3 text-xs font-medium text-white/70">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <RefreshCw size={14} className={currentMood.primary} />
                      </motion.div>
                      <span>Brain.exe is thinking...</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2 text-[10px] text-white/50">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        <span>Understanding Context</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/50">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        <span>Analyzing Request</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/80">
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          <Layers size={12} className={currentMood.primary} />
                        </motion.div>
                        <span>Generating Response</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="markdown-body">
                    {localStorage.getItem('brain_setting_markdown') !== 'false' ? (
                      <ReactMarkdown components={components}>{msg.content}</ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{msg.content}</div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-2">
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-1">
                      {msg.images.map((img, idx) => (
                        <div key={idx} className="w-48 h-48 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                          <img src={`data:image/jpeg;base64,${img}`} alt="User upload" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {renderUserContent(msg.content)}
                </div>
              )}
            </div>
            
            {msg.role === 'assistant' && msg.content !== '' && (
              <div className="flex items-center gap-2 mt-1 ml-2">
                <Tooltip content="Copy">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                      toast.success('Message copied to clipboard');
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/60 hover:text-white transition-all active:scale-95"
                  >
                    <Copy size={12} />
                  </button>
                </Tooltip>
                <Tooltip content="Explain Simpler">
                  <button 
                    onClick={() => {
                      if (onSuggestionClick) {
                        onSuggestionClick(`Can you explain this simpler?\n\n"${msg.content.substring(0, 100)}..."`);
                        toast.success('Prompt added to input box');
                      }
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/60 hover:text-white transition-all active:scale-95"
                  >
                    <Sparkles size={12} />
                    <span>Explain Simpler</span>
                  </button>
                </Tooltip>
                <Tooltip content="Regenerate">
                  <button 
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-white/60 hover:text-white transition-all active:scale-95"
                  >
                    <RefreshCw size={12} />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
      </div>
    </TooltipProvider>
  );
}
