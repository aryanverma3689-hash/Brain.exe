import React, { useRef, useState, useEffect } from 'react';
import { Send, Square, Paperclip, X, FileText, Globe, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipProvider } from '../ui/Tooltip';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function ChatInput({ 
  input, 
  setInput,
  handleInputChange, 
  handleKeyDown, 
  handleSend, 
  isLoading, 
  handleStop, 
  textareaRef, 
  currentMood,
  images,
  setImages,
  documents,
  setDocuments,
  isWebSearchEnabled,
  setIsWebSearchEnabled
}) {
  const fileInputRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (newTranscript) {
          setInput(prev => prev + newTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setInput]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const processFile = async (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        setImages([...(images || []), base64String]);
      };
      reader.readAsDataURL(file);
    } else {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch(`${API_BASE}/api/extract-text`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.text) {
          setDocuments([...(documents || []), { name: data.filename, text: data.text }]);
        }
      } catch (err) {
        console.error("Failed to extract text", err);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
        }
      }
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  return (
    <TooltipProvider>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 pt-6 sm:pt-10 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/90 to-transparent z-20">
        <div className="max-w-4xl mx-auto flex flex-col items-center w-full">
          
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="z-20 mb-4"
              >
                <button 
                  onClick={handleStop}
                  className="flex items-center gap-2 bg-[#1A1A1D] border border-white/10 text-white/80 hover:text-white px-5 py-2.5 rounded-full text-xs font-medium hover:bg-white/10 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl group"
                >
                  <Square size={12} className="fill-white/80 group-hover:fill-white group-hover:text-red-400 transition-colors" /> 
                  <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Stop generating</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative group w-full"
          >
            {/* Ambient animated glow behind the input box */}
            <div className={cn("absolute -inset-1 rounded-3xl blur-xl opacity-20 group-focus-within:opacity-40 transition duration-700 bg-gradient-to-r", currentMood.gradient.replace('to-black', 'to-white/20').replace('to-slate-900', 'to-blue-400'))}></div>
            
            <div className="relative flex flex-col bg-[#1A1A1D]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
              
              {/* Attachments Preview Area */}
              {((images && images.length > 0) || (documents && documents.length > 0)) && (
                <div className="flex gap-3 p-3 overflow-x-auto border-b border-white/5 bg-black/20">
                  {images && images.map((img, idx) => (
                    <div key={`img-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg group/img">
                      <img src={`data:image/jpeg;base64,${img}`} alt="upload" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-black/80 rounded-full p-1 hover:bg-red-500 transition-colors opacity-0 group-hover/img:opacity-100 scale-75 group-hover/img:scale-100"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {documents && documents.map((doc, idx) => (
                    <div key={`doc-${idx}`} className="relative flex flex-col items-center justify-center bg-[#2A2A2D] w-20 h-20 rounded-xl border border-white/10 shrink-0 group/doc shadow-lg">
                      <FileText size={24} className="text-white/40 mb-1 group-hover/doc:text-white/80 transition-colors" />
                      <span className="text-[9px] text-white/60 truncate w-16 text-center">{doc.name}</span>
                      <button 
                        onClick={() => removeDocument(idx)}
                        className="absolute top-1.5 right-1.5 bg-black/80 rounded-full p-1 hover:bg-red-500 transition-colors opacity-0 group-hover/doc:opacity-100 scale-75 group-hover/doc:scale-100 z-10"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Area (Horizontal Orientation) */}
              <div className="flex items-end px-3 py-2 min-h-[60px]">
                
                {/* Left Actions */}
                <div className="flex items-center gap-1 mb-1 mr-2 shrink-0">
                  <input 
                    type="file" 
                    accept="image/*,.pdf,.txt,.md,.csv" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <Tooltip content="Attach File">
                    <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                      <Paperclip size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Web Search">
                    <button 
                      onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                      className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all", isWebSearchEnabled ? "text-blue-400 bg-blue-400/10" : "text-white/40 hover:text-white hover:bg-white/10")}
                    >
                      <Globe size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip content={isListening ? "Listening..." : "Voice Input"}>
                    <button 
                      onClick={toggleListen}
                      className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all relative", isListening ? "text-rose-400 bg-rose-400/10" : "text-white/40 hover:text-white hover:bg-white/10")}
                    >
                      <Mic size={16} />
                      {isListening && <span className="absolute inset-0 rounded-full border border-rose-400/50 animate-pulse" />}
                    </button>
                  </Tooltip>
                </div>

                {/* Text Area */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder="Ask Brain.exe anything... (Ctrl+K for commands)"
                  rows={1}
                  className="flex-1 max-h-[40vh] bg-transparent text-white placeholder:text-white/30 resize-none outline-none text-[15px] leading-relaxed custom-scrollbar py-2"
                />
                
                {/* Right Actions */}
                <div className="flex items-center gap-2 mb-1 ml-2 shrink-0">
                  <Tooltip content="Deep Think: On">
                    <button onClick={() => toast.success('Deep Think enabled for the next prompt', { icon: '🧠' })} className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[10px] font-medium text-white/50 hover:text-white/80 transition-colors">
                      Deep Think
                    </button>
                  </Tooltip>
                  <Tooltip content="Send Message (Enter)">
                    <button 
                      onClick={handleSend} 
                      disabled={!input.trim() && (!images || images.length === 0) && (!documents || documents.length === 0)}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed",
                        (input.trim() || (images && images.length > 0) || (documents && documents.length > 0)) 
                          ? cn("scale-105 shadow-[0_0_15px_rgba(255,255,255,0.1)]", currentMood.bgLight) 
                          : "bg-white/5 text-white/30"
                      )}
                    >
                      <Send size={16} className={(input.trim() || (images && images.length > 0) || (documents && documents.length > 0)) ? cn("translate-x-[-1px] translate-y-[1px]", currentMood.primary) : "translate-x-[-1px] translate-y-[1px]"} />
                    </button>
                  </Tooltip>
                </div>
              </div>

            </div>
            
            {/* Footer Text */}
            <div className="text-center mt-3">
              <span className="text-[10px] text-white/30 tracking-wide">
                Brain.exe can make mistakes. Consider verifying important information.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}
