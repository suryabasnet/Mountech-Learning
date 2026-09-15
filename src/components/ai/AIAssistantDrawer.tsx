import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export const AIAssistantDrawer: React.FC = () => {
  const {
    aiDrawerOpen,
    closeAiAssistant,
    aiDrawerPrompt,
    currentUser,
    selectedCourseId,
    courses,
    t,
  } = useLMS();

  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Hello ${currentUser?.name || 'Scholar'}! I am the MounTech AI Pedagogical Tutor. I can help explain difficult concepts, formulate practice problems, or provide formative study guidance. How can I assist you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const course = courses.find(c => c.id === selectedCourseId);

  // If prompt was passed via openAiAssistant(prompt), automatically submit it
  useEffect(() => {
    if (aiDrawerPrompt && aiDrawerOpen) {
      handleSendMessage(aiDrawerPrompt);
    }
  }, [aiDrawerPrompt, aiDrawerOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!aiDrawerOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            userRole: currentUser?.role,
            courseTitle: course?.title,
            courseCode: course?.code,
          },
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || "I'm sorry, I couldn't process that request right now.";

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Notice: Could not connect to the pedagogical AI service. Please check your network connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-gradient-to-r from-sky-900 to-teal-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
              MounTech AI Tutor
            </h3>
            <p className="text-[11px] text-slate-300">
              {course ? `${course.code} Context` : 'Pedagogical Assistant'}
            </p>
          </div>
        </div>

        <button
          onClick={closeAiAssistant}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
        <button
          onClick={() => handleSendMessage('Explain the core concept in simple terms with a real-world example.')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-sky-400 whitespace-nowrap cursor-pointer"
        >
          💡 Simple Explanation
        </button>
        <button
          onClick={() => handleSendMessage('Give me 2 practice multiple-choice questions to test my understanding.')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-sky-400 whitespace-nowrap cursor-pointer"
        >
          📝 Practice Quiz
        </button>
        {currentUser?.role === 'teacher' && (
          <button
            onClick={() => handleSendMessage('Suggest 3 assessment rubric criteria for a student database design project.')}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-sky-400 whitespace-nowrap cursor-pointer"
          >
            📋 Rubric Generator
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-xs'
                  : 'bg-slate-100 text-slate-800 rounded-bl-xs'
              }`}
            >
              <p>{m.text}</p>
              <span
                className={`text-[9px] block mt-1 ${
                  m.role === 'user' ? 'text-sky-200 text-right' : 'text-slate-400'
                }`}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs">
            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 rounded-bl-xs flex items-center gap-1.5">
              <span className="animate-pulse">Analyzing pedagogical curriculum...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Ethics notice */}
      <div className="px-4 py-1.5 bg-slate-50 text-[10px] text-slate-400 text-center border-t border-slate-100">
        AI assists formative learning and drafting. All official grading is validated by faculty.
      </div>

      {/* Input Composer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about course lessons, quizzes, or assignments..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
