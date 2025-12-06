'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Strategy {
  id: string;
  running: boolean;
  config: {
    type?: string;
    intent?: string;
    symbol: string;
    side: string;
    size: string;
    stopPrice?: string | number;
    targetPrice?: string | number;
    strategyName?: string;
  };
}

export default function ActiveStrategiesList() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [tickers, setTickers] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  const fetchStrategies = async () => {
    try {
      const [resStrategies, resTickers] = await Promise.all([
        api.get('/maker/list'),
        api.get('/blofin/tickers')
      ]);

      if (resStrategies.error) throw new Error(resStrategies.error);
      setStrategies(resStrategies.strategies || []);

      const tickerMap: any = {};
      if (resTickers.data) {
        resTickers.data.forEach((t: any) => {
          tickerMap[t.symbol] = parseFloat(t.last);
        });
      }
      setTickers(tickerMap);

      setError(null);
    } catch (err: any) {
      console.error('Error fetching strategies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
    const interval = setInterval(fetchStrategies, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this strategy?')) return;
    try {
      await api.post('/maker/stop', { id });
      fetchStrategies();
    } catch (err) {
      alert('Failed to stop strategy');
    }
  };

  const getStrategyType = (s: Strategy) => {
    const { config } = s;
    if (config.type === 'active-strategy') return `Active Strategy (${config.strategyName})`;
    if (config.intent === 'stop-loss') return 'Stop Loss';
    if (config.intent === 'take-profit') return 'Take Profit';
    if (config.intent === 'trailing-stop') return 'Trailing Stop';
    if (config.intent === 'enter') return 'Entry (Maker)';
    if (config.intent === 'exit-maker') return 'Exit (Maker)';
    if (config.intent === 'sl-exit-maker') return 'SL Exit';
    if (config.intent === 'tp-exit-maker') return 'TP Exit';
    if (config.intent === 'ts-exit-maker') return 'TS Exit';
    if (config.intent === 'exit-maker-position') return 'Manual Exit';
    return 'Maker Strategy';
  };

  if (loading && strategies.length === 0) return <div className="p-4 text-gray-500">Loading strategies...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  const displayedStrategies = strategies.filter(s =>
    activeTab === 'active' ? s.running : !s.running
  );

  return (
    <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
      <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-xl font-bold">Strategies</h3>
        <span className="text-gray-500 text-xl">{isCollapsed ? '+' : '-'}</span>
      </div>

      {!isCollapsed && (
        <div className="mt-4">
          <div className="flex space-x-4 mb-4 border-b">
            <button
              className={`pb-2 px-1 ${activeTab === 'active' ? 'border-b-2 border-blue-500 font-bold text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({strategies.filter(s => s.running).length})
            </button>
            <button
              className={`pb-2 px-1 ${activeTab === 'inactive' ? 'border-b-2 border-blue-500 font-bold text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('inactive')}
            >
              Inactive ({strategies.filter(s => !s.running).length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Type</th>
                  <th className="py-2 px-4 border-b text-left">Symbol</th>
                  <th className="py-2 px-4 border-b text-left">Side</th>
                  <th className="py-2 px-4 border-b text-left">Size</th>
                  <th className="py-2 px-4 border-b text-left">Trigger</th>
                  <th className="py-2 px-4 border-b text-left">Current</th>
                  <th className="py-2 px-4 border-b text-left">Distance</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedStrategies.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                      No {activeTab} strategies
                    </td>
                  </tr>
                ) : (
                  displayedStrategies.map((s) => {
                    const currentPrice = tickers[s.config.symbol];
                    const triggerPrice = s.config.stopPrice !== undefined ? parseFloat(s.config.stopPrice as string) : 
                                         s.config.targetPrice !== undefined ? parseFloat(s.config.targetPrice as string) : null;
                    
                    let distance = '-';
                    if (currentPrice && triggerPrice) {
                      const dist = Math.abs((currentPrice - triggerPrice) / currentPrice * 100);
                      distance = `${dist.toFixed(2)}%`;
                    }

                    return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">
                        <div className="font-medium">{getStrategyType(s)}</div>
                        <div className="text-xs text-gray-400">{s.id.substring(0, 8)}</div>
                      </td>
                      <td className="py-2 px-4 border-b">{s.config.symbol}</td>
                      <td className="py-2 px-4 border-b font-bold">
                        <span className={s.config.side === 'buy' || s.config.side === 'long' ? 'text-green-600' : 'text-red-600'}>
                          {s.config.side ? s.config.side.toUpperCase() : '-'}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">{s.config.size}</td>
                      <td className="py-2 px-4 border-b">
                        {triggerPrice ? triggerPrice.toFixed(4) : '-'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {currentPrice ? currentPrice.toFixed(4) : '-'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {distance}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {s.running ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">Running</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">Stopped</span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {s.running && (
                          <button
                            onClick={() => handleCancel(s.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
