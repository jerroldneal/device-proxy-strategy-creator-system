'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Position {
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  unrealizedPnl: string;
  percentage?: number;
}

interface OpenPositionsListProps {
  onAction: (type: 'close' | 'sl' | 'tp' | 'ts', initialValues: any) => void;
}

export default function OpenPositionsList({ onAction }: OpenPositionsListProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchPositions = async () => {
    try {
      const res = await api.get('/blofin/positions');
      // Standardize response
      const rawPositions = res.data || [];

      const formatted: Position[] = rawPositions.map((p: any) => {
        let side = p.side;
        if (side === 'buy') side = 'long';
        if (side === 'sell') side = 'short';

        return {
          symbol: p.symbol || p.instId,
          side: side,
          size: p.contracts || p.size || p.amount,
          entryPrice: parseFloat(p.entryPrice || p.avgPrice || '0').toFixed(4),
          markPrice: parseFloat(p.markPrice || '0').toFixed(4),
          unrealizedPnl: p.unrealizedPnl || p.upl || '0',
          percentage: (p.percentage !== undefined && p.percentage !== null) ? parseFloat(p.percentage) : undefined
        };
      });

      setPositions(formatted);

      // Default collapse if no positions on first load
      if (!hasLoaded) {
        if (formatted.length === 0) {
          setIsCollapsed(true);
        }
        setHasLoaded(true);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching positions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && positions.length === 0) return <div className="p-4 text-gray-500">Loading positions...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  const displayedPositions = activeTab === 'active' ? positions : [];

  return (
    <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
      <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-xl font-bold">Positions</h3>
        <span className="text-gray-500 text-xl">{isCollapsed ? '+' : '-'}</span>
      </div>

      {!isCollapsed && (
        <div className="mt-4">
          <div className="flex space-x-4 mb-4 border-b">
            <button
              className={`pb-2 px-1 ${activeTab === 'active' ? 'border-b-2 border-blue-500 font-bold text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({positions.length})
            </button>
            <button
              className={`pb-2 px-1 ${activeTab === 'inactive' ? 'border-b-2 border-blue-500 font-bold text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('inactive')}
            >
              Inactive (0)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Symbol</th>
                  <th className="py-2 px-4 border-b text-left">Side</th>
                  <th className="py-2 px-4 border-b text-left">Size</th>
                  <th className="py-2 px-4 border-b text-left">Entry</th>
                  <th className="py-2 px-4 border-b text-left">Mark</th>
                  <th className="py-2 px-4 border-b text-left">PnL</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedPositions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                      No {activeTab} positions
                    </td>
                  </tr>
                ) : (
                  displayedPositions.map((p, idx) => {
                    const pnl = parseFloat(p.unrealizedPnl);
                    const pnlColor = pnl >= 0 ? 'text-green-600' : 'text-red-600';

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{p.symbol}</td>
                        <td className="py-2 px-4 border-b font-bold">
                          <span className={p.side === 'long' ? 'text-green-600' : 'text-red-600'}>
                            {p.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b">{p.size}</td>
                        <td className="py-2 px-4 border-b">{p.entryPrice}</td>
                        <td className="py-2 px-4 border-b">{p.markPrice}</td>
                        <td className={`py-2 px-4 border-b font-bold ${pnlColor}`}>
                          {p.percentage !== undefined && !isNaN(p.percentage)
                            ? `${p.percentage.toFixed(2)}%`
                            : parseFloat(p.unrealizedPnl).toFixed(4)}
                        </td>
                        <td className="py-2 px-4 border-b flex gap-2">
                          <button
                            onClick={() => onAction('sl', { symbol: p.symbol, positionSide: p.side, size: p.size, entryPrice: p.entryPrice })}
                            className="px-2 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-xs"
                          >
                            SL
                          </button>
                          <button
                            onClick={() => onAction('tp', { symbol: p.symbol, positionSide: p.side, size: p.size, entryPrice: p.entryPrice })}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs"
                          >
                            TP
                          </button>
                          <button
                            onClick={() => onAction('ts', { symbol: p.symbol, positionSide: p.side, size: p.size, entryPrice: p.entryPrice })}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-xs"
                          >
                            TS
                          </button>
                          <button
                            onClick={() => onAction('close', { symbol: p.symbol, positionSide: p.side, size: p.size })}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-xs"
                          >
                            Close
                          </button>
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
