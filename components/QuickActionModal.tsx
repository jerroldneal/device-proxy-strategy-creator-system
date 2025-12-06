'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';

interface QuickActionModalProps {
  type: 'close' | 'sl' | 'tp' | 'ts' | 'enter-buy' | 'enter-sell';
  initialValues?: {
    symbol?: string;
    positionSide?: string;
    size?: string;
    entryPrice?: string;
  };
  onClose: () => void;
}

export default function QuickActionModal({ type, initialValues, onClose }: QuickActionModalProps) {
  const [symbol, setSymbol] = useState(initialValues?.symbol || 'BTC-USDT');
  const [positionSide, setPositionSide] = useState(initialValues?.positionSide || (type === 'enter-sell' ? 'short' : 'long'));
  const [size, setSize] = useState(initialValues?.size || '0.01');
  const [entryPrice, setEntryPrice] = useState(initialValues?.entryPrice || '');
  const [percentage, setPercentage] = useState('1.0');
  const [loading, setLoading] = useState(false);

  const getTitle = () => {
    switch (type) {
      case 'close': return 'Close Position';
      case 'sl': return 'Set Stop Loss';
      case 'tp': return 'Set Take Profit';
      case 'ts': return 'Set Trailing Stop';
      case 'enter-buy': return 'Enter Buy (Maker)';
      case 'enter-sell': return 'Enter Sell (Maker)';
      default: return 'Action';
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let body: any = { symbol, positionSide, size };

      switch (type) {
        case 'close':
          endpoint = '/close-position-maker';
          break;
        case 'sl':
          endpoint = '/stop-loss/set';
          body.entryPrice = entryPrice;
          body.stopPercentage = percentage;
          break;
        case 'tp':
          endpoint = '/take-profit/set';
          body.entryPrice = entryPrice;
          body.profitPercentage = percentage;
          break;
        case 'ts':
          endpoint = '/trailing-stop/set';
          body.entryPrice = entryPrice;
          body.trailingPercentage = percentage;
          break;
        case 'enter-buy':
        case 'enter-sell':
          endpoint = '/enter';
          body = {
            symbol,
            side: type === 'enter-buy' ? 'buy' : 'sell',
            size,
            spread: 0.0005,
            reduceOnly: false,
            interval: 1000
          };
          break;
      }

      const res = await api.post(endpoint, body);
      if (res.error) {
        alert('Error: ' + res.error);
      } else {
        alert('Action Successful! ID: ' + (res.id || 'Done'));
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to execute action');
    } finally {
      setLoading(false);
    }
  };

  const isEntry = type === 'enter-buy' || type === 'enter-sell';
  const isRisk = type === 'sl' || type === 'tp' || type === 'ts';
  const isClose = type === 'close';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-900">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{getTitle()}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        {isEntry && (
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        )}

        {(isEntry || isClose) && (
          <div className="flex gap-4 mb-4">
            {isEntry && (
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Side</label>
                <select
                  value={positionSide}
                  onChange={(e) => setPositionSide(e.target.value)}
                  className="w-full border p-2 rounded"
                  disabled
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>
            )}
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
        )}

        {isRisk && (
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">
              {type === 'sl' ? 'Stop %' : type === 'tp' ? 'Profit %' : 'Trailing %'}
            </label>
            <div className="flex items-center border rounded">
              <input
                type="number"
                step="0.01"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="flex-1 p-2 outline-none rounded-l"
                placeholder="1.0"
              />
              <span className="px-2 text-gray-500">%</span>
              <div className="flex flex-col border-l">
                <button
                  onClick={() => setPercentage((prev) => (parseFloat(prev || '0') + 0.01).toFixed(2))}
                  className="px-3 py-0.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold border-b"
                  type="button"
                >
                  ▲
                </button>
                <button
                  onClick={() => setPercentage((prev) => Math.max(0, parseFloat(prev || '0') - 0.01).toFixed(2))}
                  className="px-3 py-0.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold"
                  type="button"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Executing...' : 'Execute'}
          </button>
        </div>
      </div>
    </div>
  );
}
