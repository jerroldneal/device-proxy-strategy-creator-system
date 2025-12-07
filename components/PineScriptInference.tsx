'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';

export default function PineScriptInference() {
  const [input, setInput] = useState('// Paste your PineScript here...\n//@version=5\nstrategy("My Strategy", overlay=true)\nrsi = ta.rsi(close, 14)\nif (rsi > 70)\n    strategy.entry("Sell", strategy.short)');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Execution State
  // We now support multiple rows of inputs (Batch Execution)
  const [inputRows, setInputRows] = useState<Record<string, string>[]>([]);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setExecutionResult(null);
    setInputRows([]);

    try {
      const response = await api.post('/pinescript/infer', { code: input });
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response);

      // Initialize first row of input values
      if (response.inputs) {
        const initialValues: Record<string, string> = {};
        Object.keys(response.inputs).forEach(key => {
          initialValues[key] = '';
        });
        setInputRows([initialValues]);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    if (!result || !result.inputs) return;
    const newRow: Record<string, string> = {};
    Object.keys(result.inputs).forEach(key => {
      // Copy from last row for convenience, or empty
      const lastRow = inputRows[inputRows.length - 1];
      newRow[key] = lastRow ? lastRow[key] : '';
    });
    setInputRows([...inputRows, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    const newRows = [...inputRows];
    newRows.splice(index, 1);
    setInputRows(newRows);
  };

  const handleInputChange = (rowIndex: number, key: string, value: string) => {
    const newRows = [...inputRows];
    newRows[rowIndex] = { ...newRows[rowIndex], [key]: value };
    setInputRows(newRows);
  };

  const handleExecute = async () => {
    setExecuting(true);
    setExecutionResult(null);
    try {
      const response = await api.post('/pinescript/execute', {
        code: input,
        inputsList: inputRows
      });
      if (response.error) throw new Error(response.error);
      setExecutionResult(response);
    } catch (err: any) {
      setError(err.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-bold mb-4">PineScript Inference Engine (Batch Mode)</h3>
        <p className="text-gray-600 mb-4">
          Paste your PineScript code below. The AI will analyze it. Then, enter multiple rows of data to simulate a time-series execution.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold mb-2">PineScript Input</label>
            <textarea
              className="w-full h-96 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="// Paste PineScript code here..."
            />
            <div className="mt-4">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze Script'}
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-2">Inference Result (JSON)</label>
            <div className="relative h-96">
              <textarea
                className="w-full h-full p-4 font-mono text-sm bg-gray-50 border rounded-lg text-gray-800"
                value={result ? JSON.stringify(result, null, 2) : ''}
                readOnly
                placeholder="JSON output will appear here..."
              />
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                  <div className="text-red-600 font-bold p-4 border border-red-200 rounded bg-red-50">
                    Error: {error}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-bold mb-4">Parsed Components</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded border border-blue-100">
                <h5 className="font-bold text-blue-800 mb-2">Inputs</h5>
                <ul className="list-disc list-inside text-sm text-blue-900">
                  {result.inputs && Object.entries(result.inputs).map(([key, val]: any) => (
                    <li key={key}><span className="font-mono font-bold">{key}</span>: {val}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded border border-green-100">
                <h5 className="font-bold text-green-800 mb-2">Values to Calculate</h5>
                <ul className="list-disc list-inside text-sm text-green-900">
                  {result.values && result.values.map((val: string) => (
                    <li key={val} className="font-mono">{val}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded border border-purple-100">
                <h5 className="font-bold text-purple-800 mb-2">Actions</h5>
                <ul className="list-disc list-inside text-sm text-purple-900">
                  {result.actions && result.actions.map((action: string) => (
                    <li key={action} className="font-mono">{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border overflow-x-auto">
            <h4 className="text-lg font-bold mb-4">Batch Simulation Data</h4>
            <p className="text-gray-600 mb-4">Add rows to simulate multiple time steps.</p>

            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-left w-10">#</th>
                  {Object.keys(result.inputs).map(key => (
                    <th key={key} className="border p-2 text-left">{key}</th>
                  ))}
                  <th className="border p-2 text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {inputRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border p-2 text-center text-gray-500">{idx + 1}</td>
                    {Object.keys(result.inputs).map(key => (
                      <td key={key} className="border p-2">
                        <input
                          type="text"
                          className="w-full p-1 border rounded"
                          value={row[key] || ''}
                          onChange={(e) => handleInputChange(idx, key, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        className="text-red-600 hover:text-red-800 font-bold"
                        title="Remove Row"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleAddRow}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-semibold"
              >
                + Add Row
              </button>
              <button
                onClick={handleExecute}
                disabled={executing || inputRows.length === 0}
                className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${
                  executing || inputRows.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {executing ? 'Simulating Batch...' : 'Run Batch Simulation'}
              </button>
            </div>

            {executionResult && executionResult.results && (
              <div className="mt-8">
                <h5 className="font-bold text-gray-800 mb-3">Simulation Results</h5>
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border p-2 text-left w-10">#</th>
                      <th className="border p-2 text-left">Calculated Values</th>
                      <th className="border p-2 text-left">Triggered Actions</th>
                      <th className="border p-2 text-left">Logic Trace</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionResult.results.map((res: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border p-2 text-center font-bold">{idx + 1}</td>
                        <td className="border p-2 font-mono text-sm">
                          {JSON.stringify(res.calculatedValues)}
                        </td>
                        <td className="border p-2">
                          {res.triggeredActions && res.triggeredActions.length > 0 ? (
                            <span className="text-red-600 font-bold">{res.triggeredActions.join(', ')}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="border p-2 text-xs text-gray-600 max-w-xs truncate" title={res.logicTrace}>
                          {res.logicTrace}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
