'use client';

import React, { useState, useEffect } from 'react';
import Editor from './Editor';
import Results from './Results';
import RunStrategy from './RunStrategy';
import Guide from './Guide';
import BeginStrategyModal from './BeginStrategyModal';
import QuickActionModal from './QuickActionModal';
import StatusBar from './StatusBar';
import ActiveStrategiesList from './ActiveStrategiesList';
import OpenPositionsList from './OpenPositionsList';
import ActionArsenal from './ActionArsenal';
import PineScriptInference from './PineScriptInference';
import StrategyOrchestration from './StrategyOrchestration';
import { api } from '../lib/api';

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
  const [quickAction, setQuickAction] = useState<'close' | 'sl' | 'tp' | 'ts' | 'enter-buy' | 'enter-sell' | null>(null);
  const [quickActionValues, setQuickActionValues] = useState<any>(null);
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false);

  // Diagnostics State
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [healthDetails, setHealthDetails] = useState<any>(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setConnectionStatus('checking');
    setStatusMessage('Connecting to backend...');
    try {
      // 1. Check Health
      const health = await api.get('/health');
      if (health.error) throw new Error(health.error);

      // 2. Check Strategies (Database Access)
      const strategies = await api.get('/strategies/list');
      if (strategies.error) throw new Error('Database access failed: ' + strategies.error);

      setHealthDetails({
        env: health.config?.env,
        exchange: health.config?.defaultExchange,
        strategiesCount: strategies.list?.length || 0
      });
      setConnectionStatus('connected');
      setStatusMessage('System Operational');
    } catch (err: any) {
      console.error('Diagnostics failed:', err);
      setConnectionStatus('disconnected');
      setStatusMessage(err.message || 'Connection Failed');
      setHealthDetails({ error: err.message });
    }
  };

  const handleQuickAction = (type: 'close' | 'sl' | 'tp' | 'ts' | 'enter-buy' | 'enter-sell', values?: any) => {
    setQuickActionValues(values || null);
    setQuickAction(type);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md text-gray-900 pb-16">
      <h2 className="text-2xl font-bold mb-4">Auto Multi-Indicators (AI Analysis)</h2>

      <div className="flex space-x-2 mb-4 border-b pb-2">
        {['editor', 'results', 'run', 'trading', 'arsenal', 'inference', 'orchestration', 'guide', 'system'].map((tab) => (
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
            <div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
              <div
                className="flex justify-between items-center cursor-pointer select-none"
                onClick={() => setIsQuickActionsCollapsed(!isQuickActionsCollapsed)}
              >
                <h3 className="text-xl font-bold">Quick Actions</h3>
                <span className="text-gray-500 text-xl">{isQuickActionsCollapsed ? '+' : '-'}</span>
              </div>

              {!isQuickActionsCollapsed && (
                <div className="flex flex-wrap gap-4 mt-4">
                  <button
                    onClick={() => handleQuickAction('enter-buy')}
                    className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
                  >
                    Enter Buy
                  </button>
                  <button
                    onClick={() => handleQuickAction('enter-sell')}
                    className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
                  >
                    Enter Sell
                  </button>
                  <button
                    onClick={() => setShowBeginModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
                  >
                    Strategies
                  </button>
                </div>
              )}
            </div>

            <ActiveStrategiesList />
            <OpenPositionsList onAction={handleQuickAction} />
          </div>
        )}
        {activeTab === 'arsenal' && <ActionArsenal />}
        {activeTab === 'inference' && <PineScriptInference />}
        {activeTab === 'orchestration' && <StrategyOrchestration />}
        {activeTab === 'guide' && <Guide />}
        {activeTab === 'system' && (
          <div>
            <h3 className="text-xl font-bold mb-4">System Status</h3>
            <div className="bg-gray-50 p-4 rounded border mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-lg">Connection Status:</span>
                <span className={`px-3 py-1 rounded font-bold uppercase ${
                  connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                  connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {connectionStatus}
                </span>
              </div>
              <p className="mb-4 text-gray-700">{statusMessage}</p>

              <button
                onClick={runDiagnostics}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry Connection
              </button>
            </div>

            {healthDetails && (
              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-bold mb-2">Health Details</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(healthDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {showBeginModal && (
        <BeginStrategyModal onClose={() => setShowBeginModal(false)} />
      )}

      {quickAction && (
        <QuickActionModal
          type={quickAction}
          initialValues={quickActionValues}
          onClose={() => {
            setQuickAction(null);
            setQuickActionValues(null);
          }}
        />
      )}

      <StatusBar
        status={connectionStatus}
        message={statusMessage}
        details={healthDetails}
        onRetry={runDiagnostics}
      />
    </div>
  );
}
