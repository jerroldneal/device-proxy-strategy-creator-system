'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function StrategyOrchestration() {
  const [pineScript, setPineScript] = useState('// Paste your PineScript here...\n//@version=5\nstrategy("My Strategy", overlay=true)\n...');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Orchestration Config
  const [symbol, setSymbol] = useState('BTC-USDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [size, setSize] = useState('0.001');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<any>(null);

  // Polling for status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(fetchStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/pinescript/status');
      if (res.running) {
        setStatus(res);
        setLogs(res.logs || []);
      } else {
        setIsRunning(false);
      }
    } catch (e) {
      console.error("Status fetch failed", e);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/pinescript/infer', { code: pineScript });
      if (response.error) throw new Error(response.error);
      setAnalysis(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/pinescript/start', {
        code: pineScript,
        symbol,
        timeframe,
        size
      });
      if (response.error) throw new Error(response.error);
      setIsRunning(true);
      setLogs(['Starting strategy...']);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await api.post('/pinescript/stop', {});
      setIsRunning(false);
      setLogs(prev => ['Stopped strategy.', ...prev]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-bold mb-4">Strategy Orchestration (Live)</h3>
        <p className="text-gray-600 mb-4">
          Deploy your PineScript strategy directly to the live market. The system will infer logic, fetch data, and execute Maker trades.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Editor */}
          <div className="flex flex-col space-y-4">
            <div>
              <label className="font-semibold mb-2 block">PineScript Strategy</label>
              <textarea
                className="w-full h-96 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={pineScript}
                onChange={(e) => setPineScript(e.target.value)}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || isRunning}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : '1. Analyze Script'}
            </button>
          </div>

          {/* Right: Configuration & Status */}
          <div className="flex flex-col space-y-4">
            {analysis && (
              <div className="bg-green-50 p-4 rounded border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">Analysis Successful</h4>
                <div className="text-sm text-green-900">
                  <p><strong>Inputs:</strong> {Object.keys(analysis.inputs || {}).length}</p>
                  <p><strong>Actions:</strong> {analysis.actions?.length || 0}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-bold mb-4">Live Configuration</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Timeframe</label>
                  <input
                    type="text"
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Size</label>
                  <input
                    type="text"
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleStart}
                  disabled={!analysis || isRunning || loading}
                  className={`flex-1 py-3 rounded font-bold text-white ${
                    isRunning ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  2. Start Orchestration
                </button>
                {isRunning && (
                  <button
                    onClick={handleStop}
                    className="flex-1 py-3 rounded font-bold text-white bg-red-600 hover:bg-red-700"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>

            {/* Logs Console */}
            <div className="flex-1 bg-black text-green-400 p-4 rounded font-mono text-xs overflow-y-auto h-64">
              {logs.length === 0 && <span className="text-gray-500">System logs will appear here...</span>}
              {logs.map((log, i) => (
                <div key={i} className="mb-1 border-b border-gray-800 pb-1">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
