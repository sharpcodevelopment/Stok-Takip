import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase.js';

const TestConnection = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Testing Supabase connection...');
      
      // Test 1: Basic connection
      const { data, error } = await supabase.from('products').select('count').limit(1);
      
      if (error) {
        throw new Error(`Connection failed: ${error.message}`);
      }
      
      setStatus('✅ Supabase connection successful!');
      
      // Test 2: Check tables
      await checkTables();
      
    } catch (err) {
      setError(err.message);
      setStatus('❌ Connection failed');
    }
  };

  const checkTables = async () => {
    const tableNames = ['products', 'categories', 'stock_transactions', 'stock_requests', 'profiles'];
    const results = [];

    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase.from(tableName).select('*').limit(1);
        results.push({
          name: tableName,
          exists: !error,
          error: error?.message || null,
          count: data?.length || 0
        });
      } catch (err) {
        results.push({
          name: tableName,
          exists: false,
          error: err.message,
          count: 0
        });
      }
    }

    setTables(results);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Supabase Connection Test</h2>
      
      <div style={{ 
        padding: '15px', 
        margin: '10px 0', 
        borderRadius: '5px',
        backgroundColor: error ? '#ffebee' : '#e8f5e8',
        border: `1px solid ${error ? '#f44336' : '#4caf50'}`
      }}>
        <strong>Status:</strong> {status}
        {error && <div style={{ color: '#f44336', marginTop: '10px' }}>Error: {error}</div>}
      </div>

      {tables.length > 0 && (
        <div>
          <h3>Database Tables:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Table</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Count</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{table.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {table.exists ? '✅ Exists' : '❌ Missing'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{table.count}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: '#f44336' }}>
                    {table.error || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button 
        onClick={testConnection}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Again
      </button>
    </div>
  );
};

export default TestConnection;
