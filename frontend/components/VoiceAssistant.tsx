'use client';

import { ConnectionStatus, RecordingStatus } from '../hooks/useVoiceAgent';

interface VoiceAssistantProps {
  connectionStatus: ConnectionStatus;
  recordingStatus: RecordingStatus;
  audioLevel: number;
  isAISpeaking: boolean;
  toggleRecording: () => void;
}

export default function VoiceAssistant({
  connectionStatus,
  recordingStatus,
  audioLevel,
  isAISpeaking,
  toggleRecording
}: VoiceAssistantProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-4 lg:py-12 px-2 select-none">
      {}
      <div className={`absolute w-[90vw] h-[90vw] max-w-[500px] max-h-[500px] rounded-full blur-[80px] lg:blur-[120px] transition-all duration-1000 -z-10 opacity-20 ${recordingStatus === 'recording' ? 'bg-red-400' :
          isAISpeaking ? 'bg-blue-400' :
            'bg-gray-200'
        }`} />

      {}
      <div className="relative mb-8 lg:mb-16 group">
        <div
          className={`w-44 h-44 sm:w-64 sm:h-64 rounded-full transition-all duration-700 flex items-center justify-center relative ${recordingStatus === 'recording' ? 'bg-red-50/50' :
              isAISpeaking ? 'bg-black/5' :
                'bg-gray-50/50'
            }`}
        >
          {}
          <div className={`absolute inset-0 rounded-full border border-black/5 animate-[ping_3s_infinite] ${recordingStatus === 'recording' ? 'border-red-500/20' : ''}`} />
          <div className={`absolute inset-4 rounded-full border border-black/5 animate-[ping_4s_infinite] ${recordingStatus === 'recording' ? 'border-red-500/10' : ''}`} />

          {}
          <div
            className={`rounded-full transition-all duration-300 flex items-center justify-center shadow-2xl ${recordingStatus === 'recording' ? 'bg-red-500 shadow-red-500/40' :
                isAISpeaking ? 'bg-black shadow-black/20' :
                  'bg-white border border-gray-100'
              }`}
            style={{
              width: `${50 + (recordingStatus === 'recording' ? audioLevel * 120 : isAISpeaking ? 20 + Math.random() * 30 : 0)}%`,
              height: `${50 + (recordingStatus === 'recording' ? audioLevel * 120 : isAISpeaking ? 20 + Math.random() * 30 : 0)}%`,
            }}
          >
            {recordingStatus === 'recording' && (
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </div>
        </div>

        {}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-white border border-gray-100 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] whitespace-nowrap">
          <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            {connectionStatus}
          </span>
        </div>
      </div>

      <div className="max-w-sm px-4">
        <h1 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-6 tracking-tight text-black">Form Engine</h1>
        <p className="text-gray-400 text-sm sm:text-lg mb-6 sm:mb-12 leading-relaxed max-w-[280px] sm:max-w-none mx-auto">
          Interact naturally with our intelligent assistant to complete your form submission.
        </p>

        <button
          onClick={toggleRecording}
          disabled={connectionStatus !== 'connected'}
          className={`group relative px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold transition-all overflow-hidden ${recordingStatus === 'recording'
              ? 'bg-red-500 text-white shadow-xl shadow-red-500/25'
              : 'bg-black text-white shadow-xl shadow-black/10'
            } disabled:opacity-30 disabled:grayscale hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            {recordingStatus === 'recording' ? (
              <>
                <div className="w-2 h-2 bg-white rounded-sm animate-pulse" />
                Stop Interaction
              </>
            ) : (
              <>
                <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                </svg>
                Begin Conversation
              </>
            )}
          </div>
        </button>

        <div className="mt-4 sm:mt-8 flex items-center justify-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-gray-300">
            {recordingStatus === 'recording' ? 'Engine actively listening...' :
              recordingStatus === 'processing' ? 'Synthesizing response...' :
                isAISpeaking ? 'Assistant is speaking...' : 'System ready'}
          </span>
          {recordingStatus === 'recording' && (
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-0.5 h-3 bg-red-500 animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}