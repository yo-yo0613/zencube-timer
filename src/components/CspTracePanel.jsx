import React, { useState, useEffect } from 'react';
import {
  traceCsp,
  getNextValidTop,
  getPrevValidTop,
  getNextValidBot,
  getPrevValidBot
} from '../lib/sq1Trace';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

const colorMap = {
  'B': '#3b82f6', // Blue
  'G': '#10b981', // Green
  'R': '#ef4444', // Red
  'O': '#f97316', // Orange
};

const ColorPattern = ({ colors }) => {
  if (!colors || colors.length === 0) return <span className="text-brand-gray-400 text-xs">N/A</span>;
  return (
    <div className="flex gap-1.5 items-center">
      {colors.map((c, idx) => {
        if (c === 'W') {
          return (
            <div
              key={idx}
              className="w-3.5 h-3.5 rounded-sm border border-brand-gray-300 dark:border-brand-gray-700 bg-white shadow-sm"
              title="White"
            />
          );
        }
        if (c === 'B' && (colors.includes('W') || colors.includes('B') && !colors.some(col => ['G','R','O'].includes(col)))) {
          // If this is a black/white sequence, represent 'B' as black
          return (
            <div
              key={idx}
              className="w-3.5 h-3.5 rounded-sm border border-black/20 bg-brand-gray-900 shadow-sm"
              title="Black"
            />
          );
        }
        // Normal side color mapping (B, G, R, O)
        return (
          <div
            key={idx}
            className="w-3.5 h-3.5 rounded-sm border border-black/10 shadow-sm"
            style={{ backgroundColor: colorMap[c] || '#ccc' }}
            title={c}
          />
        );
      })}
      <span className="font-mono text-[10px] text-brand-gray-500 uppercase ml-1">
        {colors.join(' ')}
      </span>
    </div>
  );
};

export default function CspTracePanel({ scramble }) {
  const [topStart, setTopStart] = useState(0);
  const [botStart, setBotStart] = useState(0);

  // Reset offset when scramble changes
  useEffect(() => {
    setTopStart(0);
    setBotStart(0);
  }, [scramble]);

  if (!scramble) return null;

  let traceResult;
  try {
    traceResult = traceCsp(scramble, topStart, botStart);
  } catch (err) {
    console.error("CSP Tracing error:", err);
    return (
      <div className="text-red-500 text-xs p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-3xl">
        無法分析此打亂 (Trace Error)
      </div>
    );
  }

  const { state, components, oddCount, result } = traceResult;

  const handleTopPrev = () => {
    setTopStart(prev => getPrevValidTop(state, prev));
  };

  const handleTopNext = () => {
    setTopStart(prev => getNextValidTop(state, prev));
  };

  const handleBotPrev = () => {
    setBotStart(prev => getPrevValidBot(state, prev));
  };

  const handleBotNext = () => {
    setBotStart(prev => getNextValidBot(state, prev));
  };

  return (
    <div className="bg-white dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2rem] p-6 shadow-sm space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-brand-gray-100 dark:border-brand-gray-900">
        <h3 className="text-sm font-black tracking-wider uppercase text-brand-gray-800 dark:text-brand-gray-200 flex items-center gap-2">
          🔍 CSP Trace 即時分析
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-black text-brand-gray-450 tracking-wider">
            Odd 分量數: {oddCount}
          </span>
          <span
            className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
              result === 'Even'
                ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400 border border-green-200/55 dark:border-green-900/30'
                : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200/55 dark:border-red-900/30'
            }`}
          >
            {result === 'Even' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Even (無 Parity)
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" />
                Odd (有 Parity)
              </>
            )}
          </span>
        </div>
      </div>

      {/* Tracing Offsets Buttons */}
      <div className="grid grid-cols-2 gap-4 bg-brand-gray-50 dark:bg-brand-gray-950/60 p-3 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-900/50">
        {/* Top Start */}
        <div className="space-y-1.5 text-center">
          <span className="text-[10px] text-brand-gray-450 uppercase font-black block">
            頂層起點 (U-Offset): {topStart}
          </span>
          <div className="flex justify-center gap-1 items-center">
            <button
              onClick={handleTopPrev}
              className="p-1 rounded-lg bg-white dark:bg-brand-gray-900 border border-brand-gray-250 dark:border-brand-gray-800 text-brand-gray-650 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition"
              title="前一個合法起點"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleTopNext}
              className="p-1 rounded-lg bg-white dark:bg-brand-gray-900 border border-brand-gray-250 dark:border-brand-gray-800 text-brand-gray-650 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition"
              title="後一個合法起點"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bot Start */}
        <div className="space-y-1.5 text-center">
          <span className="text-[10px] text-brand-gray-450 uppercase font-black block">
            底層起點 (D-Offset): {botStart}
          </span>
          <div className="flex justify-center gap-1 items-center">
            <button
              onClick={handleBotPrev}
              className="p-1 rounded-lg bg-white dark:bg-brand-gray-900 border border-brand-gray-250 dark:border-brand-gray-800 text-brand-gray-650 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition"
              title="前一個合法起點"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleBotNext}
              className="p-1 rounded-lg bg-white dark:bg-brand-gray-900 border border-brand-gray-250 dark:border-brand-gray-800 text-brand-gray-650 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition"
              title="後一個合法起點"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tracing Components Grid */}
      <div className="space-y-2 text-xs">
        {components.map((comp) => {
          const isOdd = comp.parity === 'Odd';
          const isNA = comp.parity === 'N/A';
          return (
            <div
              key={comp.name}
              className="flex items-center justify-between p-2.5 rounded-xl border border-brand-gray-100 dark:border-brand-gray-900/60 hover:bg-brand-gray-50/50 dark:hover:bg-brand-gray-900/20 transition"
            >
              <span className="font-bold text-brand-gray-700 dark:text-brand-gray-300">
                {comp.name}
              </span>
              <div className="flex items-center gap-4">
                <ColorPattern colors={comp.colors || comp.sequence} />
                <span
                  className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                    isNA
                      ? 'bg-brand-gray-100 text-brand-gray-450 dark:bg-brand-gray-900 dark:text-brand-gray-500'
                      : isOdd
                      ? 'bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400'
                      : 'bg-green-50 text-green-500 dark:bg-green-950/20 dark:text-green-400'
                  }`}
                >
                  {comp.parity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
