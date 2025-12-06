'use client';

import React, { useState } from 'react';
import SaveModal from './SaveModal';

interface ResultsProps {
  input: string;
  result: any;
  pineScript: string;
  onBack: () => void;
  onRun: () => void;
  strategyContext: any;
  setStrategyContext: (ctx: any) => void;
}

export default function Results({ input, result, pineScript, onBack, onRun, strategyContext, setStrategyContext }: ResultsProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <button onClick={onBack} className="px-4 py-2 border rounded hover:bg-gray-50">← Back to Editor</button>
        <button onClick={() => setShowSaveModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Strategy</button>
        <button onClick={onRun} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Run Strategy →</button>
      </div>

      <details className="mb-4 bg-gray-50 p-4 rounded border">
        <summary className="cursor-pointer font-bold text-gray-700">Input Strategy</summary>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-gray-800">{input}</pre>
      </details>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold mb-2">JSON Result (Intermediate)</h3>
          <textarea
            readOnly
            className="w-full h-96 p-4 bg-gray-50 border rounded font-mono text-xs"
            value={result ? JSON.stringify(result, null, 2) : ''}
          />
        </div>
        <div>
          <h3 className="font-bold mb-2">Representative PineScript</h3>
          <textarea
            readOnly
            className="w-full h-96 p-4 bg-blue-50 border border-blue-200 rounded font-mono text-xs"
            value={pineScript}
          />
        </div>
      </div>

      {showSaveModal && (
        <SaveModal
          onClose={() => setShowSaveModal(false)}
          input={input}
          json={result}
          pineScript={pineScript}
          strategyContext={strategyContext}
          setStrategyContext={setStrategyContext}
        />
      )}
    </div>
  );
}
