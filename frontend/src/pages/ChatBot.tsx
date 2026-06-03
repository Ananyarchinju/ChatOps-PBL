import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string | React.ReactNode;
  timestamp: Date;
};

export default function ChatBot() {
  const { token } = useAuth();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!token) return;
    
    axios.get('/api/chat/history', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const historyMessages: Message[] = [];
      res.data.forEach((item: any) => {
        historyMessages.push({
          id: item.id + '-u',
          role: 'user',
          content: item.command,
          timestamp: new Date(item.timestamp)
        });
        if (item.output) {
          historyMessages.push({
            id: item.id + '-b',
            role: 'bot',
            content: (
              <div className="font-mono text-sm whitespace-pre-wrap">
                {item.output}
              </div>
            ),
            timestamp: new Date(item.timestamp)
          });
        }
      });
      
      if (historyMessages.length === 0) {
        historyMessages.push({
          id: '1',
          role: 'bot',
          content: 'Hello! I am your ChatOps assistant. Try typing `/help` or `/status` to see what I can do.',
          timestamp: new Date(),
        });
      }
      setMessages(historyMessages);

      // Auto-execute command if passed from Dashboard
      if (location.state && location.state.autoCommand) {
        executeCommand(location.state.autoCommand, historyMessages);
        // Clear the state so it doesn't re-run if they refresh
        window.history.replaceState({}, document.title);
      }
    }).catch(err => console.error("Failed to load history", err));
  }, [token, location.state]);

  const executeCommand = async (commandToRun: string, currentMessages: Message[]) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: commandToRun, timestamp: new Date() };
    const newMessages = [...currentMessages, userMsg];
    setMessages(newMessages);

    try {
      const res = await axios.post('/api/chat/command', { command: commandToRun }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages([...newMessages, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: (
          <div className="font-mono text-sm whitespace-pre-wrap">
            {res.data.response}
          </div>
        ),
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages([...newMessages, {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Error connecting to ChatOps backend.',
        timestamp: new Date()
      }]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput('');
    executeCommand(currentInput, messages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
          <Bot className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">ChatOps Terminal</h1>
          <p className="text-sm text-slate-400">Execute DevOps commands via chat</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-700/50">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                    : 'bg-slate-800 text-blue-400 border border-slate-700'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-xl">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <div className="absolute left-4 text-slate-500">
              <Command className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command like /build, /deploy, or ask a question..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-12 pr-16 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono placeholder:font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-3 p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 text-xs text-slate-400 scrollbar-hide">
            <span className="shrink-0 font-medium mr-1">Suggestions:</span>
            {['/help', '/status', '/build ChatOps', '/docker ps'].map(cmd => (
              <button 
                key={cmd} 
                onClick={() => setInput(cmd)}
                className="shrink-0 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full transition-colors border border-slate-700 hover:border-slate-500"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
