import React, { useState } from "react";
import { Send, Sparkles, Bot, X, Loader2 } from "lucide-react";

export default function WhatIfChat({
  onSimulate,
  isLoading,
  isSimulating,
  simResult,
  onReset,
}) {
  const [input, setInput] = useState("");
  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSimulate(input.trim());
    setInput("");
  };

  return (
    <div className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm flex flex-col overflow-hidden h-full">
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-zinc-100 shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <Sparkles size={15} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900">
            {isLoading
              ? "AI Analyzing..."
              : isSimulating
                ? "Simulation Active"
                : "AI What-If Analysis"}
          </p>
          <p className="text-[11px] text-zinc-400">Simulate health scenarios</p>
        </div>
        {isSimulating && !isLoading && (
          <button
            onClick={onReset}
            className="text-xs px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-full font-bold"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex-1 px-4 py-3 overflow-y-auto flex flex-col gap-2 min-h-0">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
              <Loader2
                size={32}
                className="text-blue-600 animate-spin relative"
              />
            </div>
            <p className="text-sm font-bold text-zinc-700 animate-pulse">
              Running simulation...
            </p>
            <p className="text-xs text-zinc-400 text-center max-w-[220px]">
              Our AI is analyzing the scenario against your health profile
            </p>
          </div>
        ) : simResult ? (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <Bot size={14} className="text-blue-600" />
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm px-3 py-2.5 text-sm text-zinc-700 leading-relaxed max-w-[90%]">
              {simResult}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Bot size={22} className="text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-700">Ask the AI</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-[200px] mx-auto">
                Type a what-if question to simulate health outcomes
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {[
                "Follow a diet",
                "Exercise daily",
                "Quit sugar",
                "Lose 10kg",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(`What if I ${s.toLowerCase()}?`)}
                  className="text-xs px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-zinc-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 shrink-0">
        <div className="flex items-center gap-2 bg-zinc-50 rounded-xl border border-zinc-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. What if I followed a diet?"
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40 shrink-0"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
