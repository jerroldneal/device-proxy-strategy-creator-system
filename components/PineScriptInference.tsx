'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';

export default function PineScriptInference() {
  const [input, setInput] = useState('// Paste your PineScript here...\n//@version=5\nstrategy("My Strategy", overlay=true)\nrsi = ta.rsi(close, 14)\nif (rsi > 70)\n    strategy.entry("Sell", strategy.short)');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/pinescript/infer', { code: input });
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-bold mb-4">PineScript Inference Engine</h3>
        <p className="text-gray-600 mb-4">
          Paste your PineScript code below. The AI will analyze it and extract the necessary inputs, values, and actions required to execute the strategy.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold mb-2">PineScript Input</label>
            <textarea
              className="w-full h-96 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="// Paste PineScript code here..."
            />
            <div className="mt-4">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze Script'}
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-2">Inference Result (JSON)</label>
            <div className="relative h-96">
              <textarea
                className="w-full h-full p-4 font-mono text-sm bg-gray-50 border rounded-lg text-gray-800"
                value={result ? JSON.stringify(result, null, 2) : ''}
                readOnly
                placeholder="JSON output will appear here..."
              />
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                  <div className="text-red-600 font-bold p-4 border border-red-200 rounded bg-red-50">
                    Error: {error}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-bold mb-4">Parsed Components</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded border border-blue-100">
              <h5 className="font-bold text-blue-800 mb-2">Inputs</h5>
              <ul className="list-disc list-inside text-sm text-blue-900">
                {result.inputs && Object.entries(result.inputs).map(([key, val]: any) => (
                  <li key={key}><span className="font-mono font-bold">{key}</span>: {val}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded border border-green-100">
              <h5 className="font-bold text-green-800 mb-2">Values to Calculate</h5>
              <ul className="list-disc list-inside text-sm text-green-900">
                {result.values && result.values.map((val: string) => (
                  <li key={val} className="font-mono">{val}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded border border-purple-100">
              <h5 className="font-bold text-purple-800 mb-2">Actions</h5>
              <ul className="list-disc list-inside text-sm text-purple-900">
                {result.actions && result.actions.map((action: string) => (
                  <li key={action} className="font-mono">{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
