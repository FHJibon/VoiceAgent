'use client';

import { FormData } from '../hooks/useVoiceAgent';

interface FormSectionProps {
  formData: FormData;
  isSubmitted: boolean;
}

export default function FormSection({ formData, isSubmitted }: FormSectionProps) {
  const fields = [
    { key: 'name', label: 'Name', sub: 'Full name', icon: (
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
    ) },
    { key: 'phone', label: 'Phone Number', sub: 'Contact number', icon: (
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    ) },
    { key: 'jobTitle', label: 'Job Title', sub: 'Your profession', icon: (
      <path d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1z" />
    ) },
  ];

  return (
    <div className="flex flex-col h-full max-h-full">
      {}
      <div className="mb-4 lg:mb-10 shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[10px] font-bold text-white uppercase tracking-widest mb-3 lg:mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          Active Session
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-black tracking-tight">Identity</h2>
        <p className="text-gray-400 text-xs lg:text-sm mt-0.5 lg:mt-1">Real-time voice extraction</p>
      </div>

      {}
      <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4 pr-1 custom-scrollbar">
        {fields.map((field) => (
          <div key={field.key} className="group relative p-4 lg:p-6 bg-white border border-gray-100 rounded-2xl lg:rounded-3xl transition-all hover:border-black/5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-3 lg:gap-4">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-50 text-black rounded-xl lg:rounded-2xl flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white shrink-0">
                  <svg className="w-4.5 h-4.5 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                    {field.icon}
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{field.label}</p>
                  <p className={`text-xs lg:text-sm font-medium transition-colors ${formData[field.key as keyof FormData] ? 'text-black' : 'text-gray-300 italic'}`}>
                    {formData[field.key as keyof FormData] || 'Listening...'}
                  </p>
                </div>
              </div>
              
              {formData[field.key as keyof FormData] && (
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center animate-zoom-in shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}