// components/contract/qa-navigator.tsx
"use client";

import * as React from "react";
import { Send, Loader2, BookOpen, Quote, X, Sparkles, MessageCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatCitation } from "./types";
import ReactMarkdown from "react-markdown";

interface QANavigatorProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What are the key termination clauses?",
  "What's the liability cap?",
  "Are there any auto-renewal provisions?",
  "What's the governing law and jurisdiction?",
];

export function QANavigator({ messages, onSendMessage, isTyping }: QANavigatorProps) {
  const [query, setQuery] = React.useState("");
  const [selectedCitation, setSelectedCitation] = React.useState<ChatCitation | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isTyping) return;
    onSendMessage(query.trim());
    setQuery("");
  };

  const handleSuggestion = (q: string) => {
    if (isTyping) return;
    onSendMessage(q);
  };

  return (
    <div className="flex h-[550px] bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm relative">

      {/* Left Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2.5 shrink-0 bg-zinc-50/50">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 leading-none">AI Contract Navigator</p>
            <p className="text-[10px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
              Ready to answer questions
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {/* Suggested questions (shown at top if only initial message) */}
          {messages.length <= 1 && (
            <div className="space-y-2 animate-fade-slide-up">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="h-3 w-3 text-amber-400" />
                Suggested Questions
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(q)}
                    disabled={isTyping}
                    className="text-left text-[11px] font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-100 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-blue-200 disabled:opacity-50"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2.5 max-w-[88%] animate-fade-slide-up",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm select-none",
                msg.role === "user"
                  ? "bg-gradient-to-br from-zinc-700 to-zinc-900"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600"
              )}>
                {msg.role === "user" ? "U" : <Sparkles className="h-3 w-3" />}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className={cn(
                  "px-4 py-2.5 text-xs font-medium leading-relaxed",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl rounded-tr-sm shadow-md"
                    : "bg-zinc-50 border border-zinc-200/80 text-zinc-800 rounded-2xl rounded-tl-sm shadow-sm prose prose-xs max-w-none prose-p:leading-relaxed"
                )}>
                  {msg.role === "ai" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                </div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {msg.citations.map((cite, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCitation(cite)}
                        className={cn(
                          "text-[9px] font-black border px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-all outline-none",
                          selectedCitation?.section === cite.section
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100"
                        )}
                      >
                        <BookOpen className="h-2.5 w-2.5 shrink-0" />
                        Ref: {cite.section}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 max-w-[80%] animate-fade-slide-up">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              </div>
              <div className="px-4 py-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                {[0, 150, 300].map((delay, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-dot-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-100 bg-white shrink-0">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about any clause or obligation..."
                disabled={isTyping}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-blue-400/60 rounded-xl text-xs font-medium outline-none transition-all shadow-sm placeholder:text-zinc-400"
              />
            </div>
            <button
              type="submit"
              disabled={isTyping || !query.trim()}
              className="h-9 w-9 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-blue-200 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Citations Panel */}
      <div className={cn(
        "border-l border-zinc-200 bg-zinc-50/50 flex flex-col shrink-0 transition-all duration-300",
        selectedCitation ? "w-[280px] opacity-100" : "w-[0px] md:w-[240px] overflow-hidden opacity-0 md:opacity-100"
      )}>
        <div className="flex justify-between items-center p-4 pb-3 border-b border-zinc-200/60">
          <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
            Citation
          </h4>
          {selectedCitation && (
            <button
              onClick={() => setSelectedCitation(null)}
              className="h-5 w-5 rounded-md hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {selectedCitation ? (
          <div className="space-y-3 p-4 animate-fade-slide-up flex-grow flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {selectedCitation.section}
              </span>
            </div>
            <div className="bg-white border border-zinc-200 p-3.5 rounded-xl text-xs leading-relaxed text-zinc-700 font-medium relative flex-grow overflow-y-auto max-h-[380px] shadow-sm">
              <Quote className="h-5 w-5 text-zinc-100 absolute top-2 right-2" />
              <p className="relative font-mono whitespace-pre-wrap leading-relaxed text-[11px]">{selectedCitation.text}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6 text-zinc-400 space-y-3 select-none">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center">
              <Quote className="h-5 w-5 text-zinc-300" />
            </div>
            <p className="text-[11px] font-medium leading-relaxed">Click citation tags to pin referenced clauses here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { cn };
