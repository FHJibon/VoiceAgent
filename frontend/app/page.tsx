'use client';

import { useState } from 'react';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import FormSection from '../components/FormSection';
import VoiceAssistant from '../components/VoiceAssistant';
import ChatHistory from '../components/ChatHistory';

export default function Home() {
  const {
    formData,
    chatHistory,
    connectionStatus,
    recordingStatus,
    audioLevel,
    isAISpeaking,
    isSubmitted,
    toggleRecording
  } = useVoiceAgent();

  const [activeTab, setActiveTab] = useState<'assistant' | 'identity' | 'history'>('assistant');

  return (
    <main className="h-[100dvh] lg:h-screen w-full bg-white text-black selection:bg-black selection:text-white flex flex-col justify-between overflow-hidden">
      
      {}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white/90 backdrop-blur-md shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
          <h1 className="text-base font-black tracking-tight text-black uppercase">Form Engine</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-green-50 text-[9px] font-bold text-green-600 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Active
        </div>
      </header>

      {}
      <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-4 lg:gap-8 overflow-hidden min-h-0">
        
        {}
        <section className={`w-full lg:w-1/4 h-full shrink-0 order-2 lg:order-1 min-h-0 ${
          activeTab === 'identity' ? 'block' : 'hidden lg:block'
        }`}>
          <FormSection formData={formData} isSubmitted={isSubmitted} />
        </section>

        {}
        <section className={`flex-1 flex flex-col items-center justify-center border-y lg:border-y-0 lg:border-x border-gray-100 py-4 lg:py-0 px-4 lg:px-8 order-1 lg:order-2 min-h-0 ${
          activeTab === 'assistant' ? 'flex' : 'hidden lg:flex'
        }`}>
          <VoiceAssistant 
            connectionStatus={connectionStatus}
            recordingStatus={recordingStatus}
            audioLevel={audioLevel}
            isAISpeaking={isAISpeaking}
            toggleRecording={toggleRecording}
          />
        </section>

        {}
        <section className={`w-full lg:w-1/4 h-full shrink-0 order-3 lg:order-3 min-h-0 ${
          activeTab === 'history' ? 'block' : 'hidden lg:block'
        }`}>
          <ChatHistory chatHistory={chatHistory} />
        </section>
      </div>

      {}
      <nav className="lg:hidden shrink-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-2 flex items-center justify-around shadow-[0_-8px_24px_rgba(0,0,0,0.02)] select-none">
        
        {}
        <button
          onClick={() => setActiveTab('assistant')}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-300 cursor-pointer ${
            activeTab === 'assistant' 
              ? 'text-black font-bold scale-105' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {(recordingStatus === 'recording' || isAISpeaking) && (
              <span className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full ${
                recordingStatus === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-blue-500 animate-pulse'
              }`} />
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Assistant</span>
        </button>

        {}
        <button
          onClick={() => setActiveTab('identity')}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-300 cursor-pointer ${
            activeTab === 'identity' 
              ? 'text-black font-bold scale-105' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isSubmitted && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500" />
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Identity</span>
        </button>

        {}
        <button
          onClick={() => setActiveTab('history')}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-300 cursor-pointer ${
            activeTab === 'history' 
              ? 'text-black font-bold scale-105' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {chatHistory.length > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.25 text-[8px] font-black text-white bg-black rounded-full min-w-[14px] text-center">
                {chatHistory.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider">Transcript</span>
        </button>
      </nav>

      {}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white text-black p-6 lg:p-10 rounded-[32px] max-w-sm w-full text-center shadow-2xl border border-gray-100/50 flex flex-col items-center animate-scale-up select-none">
            {}
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 animate-bounce shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-xl lg:text-2xl font-black text-black tracking-tight mb-2">Form Submitted!</h3>
            <p className="text-gray-400 text-xs lg:text-sm leading-normal">
              Your details have been successfully synchronized with the CRM database.
            </p>
            
            <div className="w-full h-[1px] bg-gray-100 my-6 shrink-0" />
            
            {}
            <div className="w-full space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px]">Name</span>
                <span className="font-semibold text-black">{formData.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px]">Phone</span>
                <span className="font-semibold text-black">{formData.phone}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[8px]">Job Title</span>
                <span className="font-semibold text-black">{formData.jobTitle}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                window.location.reload();
              }}
              className="w-full py-3.5 bg-black hover:bg-gray-900 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}
    </main>
  );
}