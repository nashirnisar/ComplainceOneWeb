import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ComplianceTask, ChatMessage } from '../types';
import { Bot, User, Send, Sparkles, Loader2, RefreshCw, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIAssistantProps {
  userProfile: UserProfile;
  tasks: ComplianceTask[];
  onClose?: () => void;
}

export default function AIAssistant({ userProfile, tasks, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      content: `How can I help you today? I'm ComplianceOne AI, your dedicated financial obligation advisor.

I have analyzed your **${userProfile?.userType || "profile"}** details. Ask me any tax, corporate-filing, or compliance questions, and I can also alert or contact your advisor instantly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [advisorContactStates, setAdvisorContactStates] = useState<Record<string, 'yes' | 'no'>>({});
  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleAdvisorChoice = (msgId: string, choice: 'yes' | 'no') => {
    setAdvisorContactStates(prev => ({
      ...prev,
      [msgId]: choice
    }));
  };

  const suggestionChips = [
    "What filings am I obligated to complete?",
    "Show details of my upcoming GST deadlines.",
    "What is the penalty for delayed AOC-4 submissions?",
    "Do individuals or freelancers pay Advance Tax?"
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessageToBackend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setErrorMsg('');
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setInputMessage('');

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userProfile,
          tasks
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch response from ComplianceOne engine.");
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while calling the AI. Please verify API key is set in secrets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageToBackend(inputMessage);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        content: `I've refreshed our conversation context! How can I assist you with your compliance duties now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Safe Simple Markdown parsing helper to avoid external dependencies
  const renderFormattedContent = (content: string) => {
    return content.split('\n').map((line, lineIdx) => {
      let trimmed = line.trim();
      
      // Headings
      if (trimmed.startsWith('### ')) {
        return <h4 key={lineIdx} className="text-sm font-bold text-emerald-400 mt-2 mb-1">{trimmed.replace('### ', '')}</h4>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={lineIdx} className="text-base font-extrabold text-white mt-3 mb-1">{trimmed.replace('## ', '')}</h3>;
      }
      if (trimmed.startsWith('# ')) {
        return <h2 key={lineIdx} className="text-lg font-black text-white mt-4 mb-2">{trimmed.replace('# ', '')}</h2>;
      }

      // Bullets
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const text = trimmed.substring(2);
        return (
          <li key={lineIdx} className="ml-4 list-disc text-xs text-indigo-200 leading-relaxed mb-0.5">
            {parseBoldText(text)}
          </li>
        );
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={lineIdx} className="border-l-4 border-emerald-500 pl-3.5 py-1 my-2 bg-white/5 text-xs italic text-indigo-300 rounded">
            {parseBoldText(trimmed.replace('> ', ''))}
          </blockquote>
        );
      }

      // Normal text / blank space
      if (!trimmed) {
        return <div key={lineIdx} className="h-2" />;
      }

      return (
        <p key={lineIdx} className="text-xs text-indigo-100 leading-relaxed mb-1.5 break-words">
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    // Regex for bold text **word**
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-emerald-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="ai-assistant-container" className="bg-[#1e1b4b] rounded-3xl border border-indigo-950 shadow-2xl overflow-hidden flex flex-col h-full w-full relative">
      {/* Floating decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      
      {/* Header bar */}
      <div className="border-b border-indigo-900/50 text-white p-5 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2.5">
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl shadow-inner animate-pulse">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight text-white flex items-center">
              <span>ComplianceOne AI</span>
              <span className="ml-2 h-2 w-2 bg-emerald-400 rounded-full inline-block"></span>
            </h3>
            <p className="text-[10px] text-indigo-300 font-mono">Powered by Gemini 3.5-Flash</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-indigo-350 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Clear Context logs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-indigo-350 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Chat"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages scrolling stack */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#14123b]">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start space-x-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                msg.sender === 'user' ? 'bg-[#4f46e5] text-white shadow-md' : 'bg-white/10 text-white border border-white/10'
              }`}>
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-emerald-400" />}
              </div>
              <div className={`p-3.5 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-[#4f46e5] text-white rounded-tr-none' 
                  : 'bg-white/5 text-slate-100 border border-white/10 rounded-tl-none shadow-sm'
              }`}>
                {msg.sender === 'user' ? (
                  <p className="text-xs leading-relaxed text-white whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <div>{renderFormattedContent(msg.content)}</div>
                    
                    <div className="mt-4 pt-3 border-t border-indigo-900/40 space-y-2">
                      <p className="text-xxs font-bold text-indigo-200 tracking-wide uppercase">
                        Would you like me to contact your advisor?
                      </p>
                      
                      {advisorContactStates[msg.id] === undefined ? (
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleAdvisorChoice(msg.id, 'yes')}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-[10px] sm:text-xxs font-extrabold shadow-sm hover:scale-105 transition active:scale-95 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvisorChoice(msg.id, 'no')}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] sm:text-xxs font-extrabold transition active:scale-95 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : advisorContactStates[msg.id] === 'yes' ? (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="text-[10px] text-emerald-400 font-bold bg-emerald-950/25 p-2 rounded-lg border border-emerald-500/20"
                        >
                          ✓ Request sent! Your advisor has been notified.
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="text-[10px] text-slate-400 font-medium italic"
                        >
                          No problem! Feel free to ask more compliance queries.
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
                <span className={`block text-[9px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-indigo-200 opacity-80' : 'text-indigo-300'
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-3 max-w-[80%]">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 shrink-0">
              <Bot className="h-4 w-4 text-emerald-400 animate-bounce" />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 shadow-xs flex items-center space-x-2 text-xs text-indigo-200">
              <Loader2 className="h-4 w-4 text-emerald-400 animate-spin animate-spin-reverse" />
              <span>Analyzing global financial books and filing instructions...</span>
            </div>
          </motion.div>
        )}

        {errorMsg && (
          <div className="bg-rose-950/50 text-rose-300 p-3.5 rounded-xl border border-rose-900/50 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="p-3 border-t border-indigo-900/50 bg-[#1e1b4b] grid grid-cols-1 md:grid-cols-2 gap-2 z-10">
          {suggestionChips.map((chipText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendMessageToBackend(chipText)}
              className="text-left text-xxs px-3 py-2 bg-white/5 border border-indigo-800 rounded-lg hover:bg-white/10 text-indigo-200 hover:text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{chipText}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-[#14123b] border-t border-indigo-900/50 flex items-center space-x-2 z-10">
        <input
          type="text"
          value={inputMessage}
          disabled={isLoading}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Clarify tax thresholds, deadlines, or payment steps..."
          className="flex-1 px-4 py-2.5 text-xs bg-[#1e1b4b] border border-indigo-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-white placeholder-indigo-300"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:bg-indigo-950 disabled:text-indigo-850 transition cursor-pointer shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
