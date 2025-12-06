'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface EditorProps {
  input: string;
  setInput: (val: string) => void;
  onAnalyze: (result: any, pine: string) => void;
  strategyContext: any;
  setStrategyContext: (ctx: any) => void;
}

export default function Editor({ input, setInput, onAnalyze, strategyContext, setStrategyContext }: EditorProps) {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const data = await api.get('/strategies/list');
      setStrategies(data.list || []);
    } catch (err) {
      console.error('Error fetching strategies:', err);
    }
  };

  const handleStrategySelect = (name: string) => {
    setSelectedStrategy(name);
    const meta = strategies.find((s) => s.name === name);
    if (meta && meta.versions) {
      setVersions([...meta.versions].sort((a: any, b: any) => b - a));
    } else {
      setVersions([]);
    }
    setSelectedVersion('');
  };

  const loadStrategy = async () => {
    if (!selectedStrategy) return;
    try {
      let url = `/strategies/${encodeURIComponent(selectedStrategy)}`;
      if (selectedVersion) {
        url += `/${selectedVersion}`;
      }
      const data = await api.get(url);
      if (data.error) {
        alert('Error: ' + data.error);
        return;
      }
      setInput(data.input);
      onAnalyze(data.json, data.pinescript); // Pre-load results but stay on editor? Or maybe just set state.

      const meta = strategies.find(s => s.name === selectedStrategy);
      setStrategyContext({
        name: selectedStrategy,
        version: selectedVersion || (meta ? meta.latestVersion : '0'),
        isLatest: !selectedVersion || (meta && selectedVersion == meta.latestVersion),
      });
    } catch (err) {
      console.error(err);
      alert('Failed to load strategy');
    }
  };

  const loadTemplate = (type: string) => {
    if (type === 'simple') {
      setInput("Buy when RSI(14) < 30. Sell when RSI(14) > 70.");
    } else if (type === 'pine') {
      setInput(`//@version=5
strategy("My Strategy", overlay=true)
rsiVal = ta.rsi(close, 14)
longCondition = ta.crossover(rsiVal, 30)
if (longCondition)
    strategy.entry("Long", strategy.long)
shortCondition = ta.crossunder(rsiVal, 70)
if (shortCondition)
    strategy.close("Long")`);
    } else if (type === 'complex') {
      setInput("INDICATORS: RSI(14), EMA(200)\nBUY: RSI < 30 AND Price > EMA(200)\nSELL: RSI > 70");
    } else if (type === 'vague') {
      setInput("Devise a profitable trend-following strategy for this symbol. I want to catch big moves but avoid chop.");
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return alert('Please enter text');
    setLoading(true);
    try {
      const data = await api.post('/ai/analyze-multi', { input });
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        onAnalyze(data, data.pinescript || '// No PineScript');
      }
    } catch (err) {
      console.error(err);
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 p-4 bg-gray-50 rounded flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2">
          <span className="font-bold mr-2">Templates:</span>
          <button onClick={() => loadTemplate('simple')} className="px-2 py-1 border border-blue-500 text-blue-500 rounded text-sm hover:bg-blue-50">Simple RSI</button>
          <button onClick={() => loadTemplate('pine')} className="px-2 py-1 border border-blue-500 text-blue-500 rounded text-sm hover:bg-blue-50">PineScript</button>
          <button onClick={() => loadTemplate('complex')} className="px-2 py-1 border border-blue-500 text-blue-500 rounded text-sm hover:bg-blue-50">Complex</button>
          <button onClick={() => loadTemplate('vague')} className="px-2 py-1 border border-purple-500 text-purple-500 rounded text-sm hover:bg-purple-50">✨ Generate</button>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="border p-1 rounded"
            value={selectedStrategy}
            onChange={(e) => handleStrategySelect(e.target.value)}
          >
            <option value="">-- Load Strategy --</option>
            {strategies.map(s => (
              <option key={s.name} value={s.name}>{s.name} (v{s.latestVersion})</option>
            ))}
          </select>
          <select
            className="border p-1 rounded w-24"
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
          >
            <option value="">Latest</option>
            {versions.map(v => (
              <option key={v} value={v}>v{v}</option>
            ))}
          </select>
          <button onClick={loadStrategy} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Load</button>
        </div>
      </div>

      <p className="text-gray-600 mb-2">Enter freeform text or PineScript below:</p>
      <textarea
        className="w-full h-64 p-4 border rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste PineScript or describe strategy..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="mt-4">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Analyzing...' : 'Analyze →'}
        </button>
      </div>
    </div>
  );
}
