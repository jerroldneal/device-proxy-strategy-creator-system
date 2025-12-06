'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface BeginStrategyModalProps {
  onClose: () => void;
}

export default function BeginStrategyModal({ onClose }: BeginStrategyModalProps) {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [symbol, setSymbol] = useState('BTC-USDT');
  const [timeframe, setTimeframe] = useState('1m');
  const [size, setSize] = useState('0.01');
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

  const handleStart = async () => {
    if (!selectedStrategy) return alert('Please select a strategy');
    setLoading(true);
    try {
      const strategyData = await api.get(`/strategies/${encodeURIComponent(selectedStrategy)}`);
      if (strategyData.error) {
          alert('Error loading strategy: ' + strategyData.error);
          setLoading(false);
          return;
      }

      const body = {
        symbol,
        timeframe,
        size,
        strategy: strategyData.json // The analyzed JSON
      };
      // Add name to strategy object for display
      body.strategy.name = selectedStrategy;

      const res = await api.post('/strategy/start', body);
      if (res.status === 'started') {
        alert('Strategy Started! ID: ' + res.id);
        onClose();
      } else {
        alert('Error starting: ' + res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert('Error starting strategy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-900">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Begin Strategy</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Strategy</label>
            <select
                className="w-full border p-2 rounded"
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
            >
                <option value="">-- Select Strategy --</option>
                {strategies.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                ))}
            </select>
        </div>

        <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Symbol</label>
            <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full border p-2 rounded"
            />
        </div>

        <div className="flex gap-4 mb-4">
            <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Timeframe</label>
                <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    {['1m', '5m', '15m', '1h', '4h', '1d'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Size</label>
                <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? 'Starting...' : 'Start Strategy'}
          </button>
        </div>
      </div>
    </div>
  );
}
