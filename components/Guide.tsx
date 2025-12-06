'use client';

import React from 'react';

export default function Guide() {
  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-blue-800 mb-4">Service for the User: Guide</h3>
      <p className="mb-4">The Auto Multi-Indicators module allows you to generate complex trading strategies using natural language or PineScript code.</p>

      <details open>
        <summary className="cursor-pointer text-blue-600 font-bold mb-2">How to Use</summary>
        <div className="pl-4 border-l-2 border-blue-500 space-y-2">
          <p><strong>1. Freeform Text:</strong> Describe your strategy in plain English (e.g., "Buy when RSI {'>'} 30").</p>
          <p><strong>2. PineScript:</strong> Paste existing PineScript code.</p>
          <p><strong>3. Structured Logic:</strong> Use pseudo-code (INDICATORS: ..., BUY: ..., SELL: ...).</p>
          <p><strong>4. Vague Requests:</strong> Ask for "profitable strategies" or "scalping setups" and the AI will innovate a solution for you.</p>
        </div>
      </details>
    </div>
  );
}
