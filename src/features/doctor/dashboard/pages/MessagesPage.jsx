import React, { useState } from 'react';
import { Search, Video, Phone, Info, PlusCircle, Image as ImageIcon, Smile, Send, FileText, Download, CheckCheck, MessageSquare } from 'lucide-react';


const CONVERSATIONS = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    time: '10:42 AM',
    preview: 'Sent an attachment: Lab Results.pdf',
    unread: 2,
    online: true,
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    time: 'Yesterday',
    preview: 'The medication seems to be working we...',
    unread: 0,
    online: false,
  },
  {
    id: 'michael',
    name: 'Michael Chen',
    time: 'Tuesday',
    preview: 'When can I schedule the follow-up?',
    unread: 0,
    online: false,
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    time: 'Monday',
    preview: 'Thank you for the advice, Doctor.',
    unread: 0,
    online: false,
  },
];

const MESSAGES = {
  alex: [
    { id: 1, sender: 'patient', type: 'text', text: "Hello Dr. Richardson, I've finished my blood work this morning. The lab just sent over the results. Could you please take a look?", time: '09:15 AM' },
    { id: 2, sender: 'patient', type: 'file', fileName: 'Lab Results.pdf', fileSize: '2.4 MB', fileType: 'Medical Report', time: '09:16 AM' },
    { id: 3, sender: 'doctor', type: 'text', text: "Thank you, Alex. I've received the file. Let me review these results quickly and I'll get back to you with my analysis. How are you feeling today overall?", time: '10:30 AM' },
    { id: 4, sender: 'patient', type: 'text', text: "I'm feeling a bit better, though the fatigue is still lingering in the afternoons. I'm hoping the results show some progress.", time: '10:42 AM' },
  ],
  sarah: [
    { id: 1, sender: 'patient', type: 'text', text: 'The medication seems to be working well so far. The headaches have reduced significantly.', time: '3:20 PM' },
    { id: 2, sender: 'doctor', type: 'text', text: "That's great to hear, Sarah. Let's continue with the current dosage for two more weeks and then reassess.", time: '4:05 PM' },
  ],
  michael: [
    { id: 1, sender: 'patient', type: 'text', text: 'When can I schedule the follow-up? My calendar is open next week.', time: '11:30 AM' },
  ],
  elena: [
    { id: 1, sender: 'patient', type: 'text', text: 'Thank you for the advice, Doctor. I will start the new routine tomorrow.', time: '9:00 AM' },
  ],
};

/* ──────────────────────────────────────────────────────────────────────────
   MessagesPage — full-bleed chat layout
   ────────────────────────────────────────────────────────────────────────── */

const MessagesPage = () => {
  const [activeId, setActiveId] = useState('alex');
  const activeConvo = CONVERSATIONS.find(c => c.id === activeId) || CONVERSATIONS[0];
  const messages = MESSAGES[activeId] || [];

  return (
    /* Negative margins cancel the parent layout padding so the chat goes edge-to-edge */
    <div className="-mx-8 -mt-6 -mb-10 flex h-[calc(100vh-65px)] overflow-hidden bg-white text-slate-800">

      {/* ── Left Panel: Conversation List ─────────────────────────────────── */}
      <div className="w-[340px] shrink-0 border-r border-[#EAEAEB] flex flex-col bg-[#F8FAFC]">

        {/* Header */}
        <div className="px-6 py-6 border-b border-transparent">
          <h1 className="text-[24px] font-extrabold text-[#0F172A] tracking-tight">Messages</h1>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1 custom-scrollbar">
          {CONVERSATIONS.map(convo => {
            const isActive = convo.id === activeId;
            return (
              <div
                key={convo.id}
                onClick={() => setActiveId(convo.id)}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-200 group
                  ${isActive
                    ? 'bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100'
                    : 'hover:bg-slate-100 border border-transparent'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-[#2563EB] rounded-r-md shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className={`font-bold text-[14px] truncate pr-2 ${isActive ? 'text-[#0F172A]' : 'text-slate-700 group-hover:text-[#0F172A]'}`}>
                      {convo.name}
                    </span>
                    <span className={`text-[11px] shrink-0 pt-0.5 ${isActive ? 'text-[#2563EB] font-bold' : 'text-slate-400 font-medium'}`}>
                      {convo.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-[13px] truncate ${isActive ? 'text-slate-600' : 'text-slate-500'}`}>
                      {convo.preview}
                    </p>
                    {convo.unread > 0 && (
                      <div className="w-5 h-5 shrink-0 rounded-full bg-[#2563EB] flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                        {convo.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right Panel: Chat Area ────────────────────────────────────────── */}
      <div className="flex-1 bg-[#FAFCFF] flex flex-col relative min-w-0">

        {/* Chat Header */}
        <div className="h-[76px] shrink-0 border-b border-slate-200/60 flex items-center justify-between px-8 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeConvo.name)}&background=e2e8f0&color=475569&bold=true`}
                alt={activeConvo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="font-extrabold text-[16px] text-[#0F172A] tracking-tight leading-snug">
                {activeConvo.name}
              </h2>
              <p className={`text-[13px] font-medium ${activeConvo.online ? 'text-emerald-600' : 'text-slate-400'}`}>
                {activeConvo.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 transition-colors">
              <Video size={20} strokeWidth={2.5} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 transition-colors">
              <Phone size={20} strokeWidth={2.5} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
              <Info size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6 bg-[#FAFCFF]">
          <div className="relative z-10 flex flex-col gap-6 w-full max-w-4xl mx-auto">

            {/* Date Separator */}
            <div className="flex justify-center my-2">
              <span className="px-4 py-1.5 bg-slate-100/80 backdrop-blur-sm text-slate-500 text-[11px] font-extrabold rounded-full uppercase tracking-wider shadow-sm border border-slate-200/50">
                Today
              </span>
            </div>

            {/* Messages */}
            {messages.map(msg => {
              if (msg.sender === 'patient' && msg.type === 'text') {
                return (
                  <div key={msg.id} className="flex flex-col items-start max-w-[70%] gap-1.5 group">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3.5 text-[14.5px] text-slate-700 shadow-sm leading-relaxed">
                      {msg.text}
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold pl-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.time}
                    </span>
                  </div>
                );
              }

              if (msg.sender === 'patient' && msg.type === 'file') {
                return (
                  <div key={msg.id} className="flex flex-col items-start max-w-[70%] gap-1.5 group">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm w-full sm:w-[340px] flex items-center justify-between cursor-pointer hover:border-[#2563EB]/40 hover:shadow-md transition-all group/file">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 group-hover/file:bg-red-100 transition-colors">
                          <FileText className="text-red-500" size={24} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[14px] font-bold text-slate-800 line-clamp-1">{msg.fileName}</p>
                          <p className="text-[12px] text-slate-500 font-medium">{msg.fileSize} • {msg.fileType}</p>
                        </div>
                      </div>
                      <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#2563EB] bg-blue-50 group-hover/file:bg-[#2563EB] group-hover/file:text-white transition-all shrink-0">
                        <Download size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold pl-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.time}
                    </span>
                  </div>
                );
              }

              if (msg.sender === 'doctor') {
                return (
                  <div key={msg.id} className="flex flex-col items-end self-end max-w-[70%] gap-1.5 group">
                    <div className="bg-[#2563EB] text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-[14.5px] shadow-sm leading-relaxed">
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 pr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] text-slate-400 font-bold">{msg.time}</span>
                      <CheckCheck size={16} className="text-[#2563EB]" strokeWidth={2.5} />
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          <div className="h-2 shrink-0" />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-slate-200/60 z-10 shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-full flex items-center px-4 py-2 shadow-sm focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mr-1 shrink-0">
                <PlusCircle size={22} strokeWidth={2} />
              </button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mr-3 shrink-0">
                <ImageIcon size={22} strokeWidth={2} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none text-[15px] text-slate-800 placeholder:text-slate-400 py-2 font-medium"
              />
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-2 shrink-0">
                <Smile size={22} strokeWidth={2} />
              </button>
              <button className="w-10 h-10 shrink-0 rounded-full bg-[#2563EB] flex items-center justify-center text-white ml-2 hover:bg-[#1D4ED8] hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
                <Send size={18} className="-ml-0.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
