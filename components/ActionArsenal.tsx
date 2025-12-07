'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  required: boolean;
  defaultValue?: any;
}

interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  parameters?: ActionParameter[];
}

export default function ActionArsenal() {
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionDefinition | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const res = await api.get('/actions');
      if (res.actions) {
        setActions(res.actions);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: ActionDefinition) => {
    setSelectedAction(action);
    setFormValues({});
    setExecutionResult(null);
  };

  const handleInputChange = (name: string, value: any) => {
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    if (!selectedAction) return;

    try {
      const res = await api.post('/actions/execute', {
        id: selectedAction.id,
        params: formValues
      });
      setExecutionResult(res);
    } catch (error: any) {
      setExecutionResult({ error: error.message });
    }
  };

  if (loading) return <div>Loading Arsenal...</div>;

  return (
    <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Arsenal of Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 border-r pr-4">
          <h3 className="font-semibold mb-2 text-gray-600">Available Actions</h3>
          <div className="space-y-2">
            {actions.map(action => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`w-full text-left p-2 rounded hover:bg-blue-50 transition-colors ${selectedAction?.id === action.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50'}`}
              >
                <div className="font-medium">{action.name}</div>
                <div className="text-xs text-gray-500 truncate">{action.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 pl-4">
          {selectedAction ? (
            <div>
              <h3 className="font-bold text-lg mb-2">{selectedAction.name}</h3>
              <p className="text-gray-600 mb-4">{selectedAction.description}</p>

              <div className="space-y-4 mb-6">
                {selectedAction.parameters?.map(param => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {param.name} {param.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder={param.description}
                      onChange={(e) => handleInputChange(param.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleExecute}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Execute Action
              </button>

              {executionResult && (
                <div className={`mt-4 p-3 rounded ${executionResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select an action to configure
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
