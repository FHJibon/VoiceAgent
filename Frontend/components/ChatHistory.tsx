'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage } from '../hooks/useVoiceAgent';

interface ChatHistoryProps {
  chatHistory: ChatMessage[];
}

export default function ChatHistory({ chatHistory }: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const formatMessageContent = (message: string, type: 'user' | 'assistant') => {
    if (type === 'user') {
      return message.split('\n').map((line, idx) => (
        <span key={idx}>
          {line}
          {idx < message.split('\n').length - 1 && <br />}
        </span>
      ));
    }

    let formattedMessage = message;
    
    formattedMessage = formattedMessage.replace(/\s*[-*]?\s*\bName\s*:/gi, '\n- Name:');
    formattedMessage = formattedMessage.replace(/\s*[-*]?\s*\bPhone\s*:/gi, '\n- Phone:');
    formattedMessage = formattedMessage.replace(/\s*[-*]?\s*\bJob\s*Title\s*:/gi, '\n- Job Title:');
    
    formattedMessage = formattedMessage.replace(/\s*(Is everything correct|do you need to edit|or do you need|correct, or do you)/gi, '\n$1');

    const lines = formattedMessage.split('\n');
    const introLines: string[] = [];
    const rows: { label: string; value: string }[] = [];
    const trailingLines: string[] = [];
    let hasStartedRows = false;

    const rowRegex = /^\s*[-*]?\s*([^:\n]{2,20})\s*:\s*(.+)$/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const match = rowRegex.exec(trimmed);
      if (match) {
        hasStartedRows = true;
        const label = match[1].trim().replace(/\b\w/g, c => c.toUpperCase());
        const value = match[2].trim().replace(/^[-*\s\n\r]+/, '').replace(/[-*\s\n\r]+$/, '').trim();
        rows.push({ label, value });
      } else {
        if (hasStartedRows) {
          trailingLines.push(trimmed);
        } else {
          introLines.push(trimmed);
        }
      }
    }

    if (rows.length === 0) {
      return message.split('\n').map((line, idx) => (
        <span key={idx}>
          {line}
          {idx < message.split('\n').length - 1 && <br />}
        </span>
      ));
    }

    const elements: React.ReactNode[] = [];

    if (introLines.length > 0) {
      const introText = introLines.join(' ');
      elements.push(
        <p key="intro" className="mb-2 text-gray-500 font-medium text-xs leading-normal">
          {introText}
        </p>
      );
    }

    elements.push(
      <div key="rows-container" className="my-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100/80 space-y-1.5 select-none shrink-0 w-full">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex flex-row items-center justify-between text-[11px] py-1 border-b border-gray-100/50 last:border-b-0">
            <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px]">{row.label}</span>
            <span className="font-semibold text-black">{row.value}</span>
          </div>
        ))}
      </div>
    );

    if (trailingLines.length > 0) {
      const trailingText = trailingLines.join(' ');
      elements.push(
        <p key="question" className="mt-2 text-black font-semibold text-xs leading-normal">
          {trailingText}
        </p>
      );
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30 rounded-2xl lg:rounded-[32px] border border-gray-100/80 overflow-hidden backdrop-blur-sm shadow-sm">
      <div className="p-4 lg:p-6 border-b border-gray-100/50 bg-white/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Live Transcript</h3>
          </div>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {chatHistory.length} Messages
          </span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 scroll-smooth custom-scrollbar"
      >
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-12 h-12 mb-4 border-2 border-dashed border-gray-300 rounded-xl lg:rounded-2xl" />
            <p className="text-gray-400 text-sm font-medium">Listening for input...</p>
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} group animate-slide-in`}>
              <div className={`max-w-[90%] px-4 py-3 lg:px-5 lg:py-3.5 rounded-xl lg:rounded-2xl text-xs lg:text-sm leading-relaxed transition-all ${
                msg.type === 'user' 
                  ? 'bg-black text-white rounded-tr-none shadow-lg shadow-black/5' 
                  : 'bg-white text-black border border-gray-100 rounded-tl-none shadow-sm group-hover:border-gray-200'
              }`}>
                {formatMessageContent(msg.message, msg.type)}
              </div>
              <span className="text-[10px] font-mono text-gray-400 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}