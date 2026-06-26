import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Play, Download, Maximize2, WrapText, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipProvider } from '../ui/Tooltip';
import { cn } from '../../lib/utils';

export default function CodeBlock({ language, value }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const downloadCode = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded');
  };

  return (
    <TooltipProvider>
      <div className="my-5 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl group relative transition-all duration-300">
        {/* Premium Window Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1A1A1D] border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white/40 hover:text-white transition-colors">
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
            <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
            </div>
            {language && (
              <span className="text-xs font-mono font-bold text-white/40 uppercase tracking-widest">{language}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
            <Tooltip content="Toggle Word Wrap">
              <button onClick={() => setIsWrapped(!isWrapped)} className={cn("p-1.5 rounded-lg transition-colors", isWrapped ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5")}>
                <WrapText size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Download File">
              <button onClick={downloadCode} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                <Download size={14} />
              </button>
            </Tooltip>
            <Tooltip content="Copy Code">
              <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium">
                {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {isCopied ? <span className="text-emerald-400">Copied</span> : 'Copy'}
              </button>
            </Tooltip>
          </div>
        </div>
        
        {/* Code Area */}
        {!isCollapsed && (
          <div className="p-4 text-[0.85rem] overflow-x-auto custom-scrollbar relative">
            <SyntaxHighlighter
              language={language || 'text'}
              style={atomDark}
              showLineNumbers={true}
              lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: 'rgba(255,255,255,0.2)', textAlign: 'right' }}
              customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
              wrapLines={isWrapped}
              wrapLongLines={isWrapped}
            >
              {value}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
