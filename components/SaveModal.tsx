'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface SaveModalProps {
  onClose: () => void;
  input: string;
  json: any;
  pineScript: string;
  strategyContext: any;
  setStrategyContext: (ctx: any) => void;
}

export default function SaveModal({ onClose, input, json, pineScript, strategyContext, setStrategyContext }: SaveModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (strategyContext.name) {
      setName(strategyContext.name);
    }
  }, [strategyContext]);

  const handleSave = async () => {
    if (!name.trim()) return alert('Name is required');
    
    try {
      const body = {
        name,
        input,
        json,
        pinescript: pineScript,
        type: 'major', // Explicit save is major
        baseVersion: strategyContext.version
      };
      
      const data = await api.post('/strategies/save', body);
      if (data.status === 'saved') {
        setStrategyContext({
          name: name,
          version: data.version,
          isLatest: true,
        });
        alert('Strategy Saved!');
        onClose();
      } else {
        alert('Error saving: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving strategy');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Save Strategy</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <p className="mb-2 text-gray-600">Enter a name for this strategy:</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Strategy Name"
          className="w-full border p-2 rounded mb-6"
          autoFocus
        />
        
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}
