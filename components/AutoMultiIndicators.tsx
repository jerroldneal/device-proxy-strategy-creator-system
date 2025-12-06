'use client';

import React, { useState } from 'react';
import Editor from './Editor';
import Results from './Results';
import RunStrategy from './RunStrategy';
import Guide from './Guide';
import BeginStrategyModal from './BeginStrategyModal';

export default function AutoMultiIndicators() {
  const [activeTab, setActiveTab] = useState('editor');
  const [input, setInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [pineScript, setPineScript] = useState('');
  const [strategyContext, setStrategyContext] = useState({
    name: '',
    version: '',
    isLatest: true,
  });
  const [showBeginModal, setShowBeginModal] = useState(false);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Auto Multi-Indicators (AI Analysis)</h2>

      <div className="flex space-x-2 mb-4 border-b pb-2">
        {['editor', 'results', 'run', 'trading', 'guide'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'editor' && (
          <Editor
            input={input}
            setInput={setInput}
            onAnalyze={(result, pine) => {
              setAnalysisResult(result);
              setPineScript(pine);
              setActiveTab('results');
            }}
            strategyContext={strategyContext}
            setStrategyContext={setStrategyContext}
          />
        )}
        {activeTab === 'results' && (
          <Results
            input={input}
            result={analysisResult}
            pineScript={pineScript}
            onBack={() => setActiveTab('editor')}
            onRun={() => setActiveTab('run')}
            strategyContext={strategyContext}
            setStrategyContext={setStrategyContext}
          />
        )}
        {activeTab === 'run' && (
          <RunStrategy
            analysisResult={analysisResult}
          />
        )}
        {activeTab === 'trading' && (
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <button 
              onClick={() => setShowBeginModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
            >
              [Begin Strategy]
            </button>
            <p className="mt-4 text-gray-600">
              Starts a live trading strategy on the server using the selected configuration.
            </p>
          </div>
        )}
        {activeTab === 'guide' && <Guide />}
      </div>

      {showBeginModal && (
        <BeginStrategyModal onClose={() => setShowBeginModal(false)} />
      )}
    </div>
  );
}
