'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface RunStrategyProps {
  analysisResult: any;
}

export default function RunStrategy({ analysisResult }: RunStrategyProps) {
  const [symbol, setSymbol] = useState('BTC-USDT');
  const [timeframe, setTimeframe] = useState('1m');
  const [lookback, setLookback] = useState(5);
  const [endTime, setEndTime] = useState('');
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);

  useEffect(() => {
    refreshTimestamps();
  }, [symbol, timeframe]);

  const refreshTimestamps = async () => {
    try {
      const data = await api.get(`/indicators/timestamps?symbol=${symbol}&timeframe=${timeframe}`);
      if (data.timestamps) {
        setTimestamps(data.timestamps.sort((a: number, b: number) => b - a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRun = async () => {
    if (!analysisResult) return alert('No strategy to run');
    setLoading(true);
    setRunResult(null);
    try {
      const body = {
        symbol,
        timeframe,
        strategy: analysisResult,
        lookback,
        endTime: endTime ? parseInt(endTime) : undefined,
      };
      const data = await api.post('/ai/evaluate-multi-strategy', body);
      if (data.error) {
        setRunResult({ error: data.error });
      } else {
        setRunResult(data);
      }
    } catch (err: any) {
      setRunResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-900">
      <div className="p-4 border-b mb-4">
        <h3 className="text-lg font-bold mb-4">Run & Manage Strategy</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-bold mb-1">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="border p-2 rounded w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border p-2 rounded w-24"
            >
              {['1m', '5m', '15m', '1h', '4h', '1d'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Lookback</label>
            <input
              type="number"
              value={lookback}
              onChange={(e) => setLookback(parseInt(e.target.value))}
              className="border p-2 rounded w-20"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">End Time</label>
            <div className="flex gap-1">
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border p-2 rounded w-48"
              >
                <option value="">Latest</option>
                {timestamps.map(ts => (
                  <option key={ts} value={ts}>{new Date(ts).toLocaleString()}</option>
                ))}
              </select>
              <button onClick={refreshTimestamps} className="px-2 border rounded hover:bg-gray-100">↻</button>
            </div>
          </div>
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
          >
            {loading ? 'Running...' : 'Run Strategy'}
          </button>
        </div>
      </div>

      {runResult && (
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-bold mb-2">Execution Result</h4>
          {runResult.error ? (
            <div className="text-red-600">{runResult.error}</div>
          ) : (
            <div className="overflow-x-auto">
              {runResult.results && Array.isArray(runResult.results) ? (
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Time</th>
                      {Object.keys(runResult.results[0]?.signals || {}).map(k => <th key={k} className="py-2">{k} (Sig)</th>)}
                      {Object.keys(runResult.results[0]?.plots || {}).map(k => <th key={k} className="py-2">{k} (Plot)</th>)}
                      <th className="py-2">Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runResult.results.map((r: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-gray-100">
                        <td className="py-2">{new Date(r.timestamp).toLocaleString()}</td>
                        {Object.keys(r.signals || {}).map(k => (
                          <td key={k} className={`py-2 font-bold ${r.signals[k] ? 'text-green-600' : 'text-red-600'}`}>
                            {r.signals[k] ? 'TRUE' : 'FALSE'}
                          </td>
                        ))}
                        {Object.keys(r.plots || {}).map(k => (
                          <td key={k} className="py-2">{typeof r.plots[k] === 'number' ? r.plots[k].toFixed(4) : r.plots[k]}</td>
                        ))}
                        <td className="py-2 text-gray-500 text-xs">
                          {Object.entries(r.context || {})
                            .filter(([k]) => k !== 'timestamp' && k !== 'price')
                            .map(([k, v]: any) => `${k}:${typeof v === 'number' ? v.toFixed(4) : v}`)
                            .join(' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>
                  <div className={`text-xl font-bold mb-2 ${runResult.result ? 'text-green-600' : 'text-red-600'}`}>
                    {runResult.result ? 'TRUE (Signal Triggered)' : 'FALSE'}
                  </div>
                  <div className="mb-2"><strong>Logic:</strong> <code>{runResult.logic}</code></div>
                  <div className="text-sm text-gray-600">
                    {Object.entries(runResult.context || {}).map(([k, v]) => (
                      <div key={k}><b>{k}:</b> {String(v)}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
