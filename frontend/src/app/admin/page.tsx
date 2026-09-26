"use client";
import { useState, useEffect } from 'react';

export default function Admin() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/logs')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>Workflow Admin Decision Ledger</h2>
      <a href="/" style={{ display: 'inline-block', marginBottom: '20px' }}>← Back to Chat Interface</a>
      
      <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th>Timestamp</th>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Reason Stated</th>
            <th>System Status</th>
            <th>System Audit Notes</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center' }}>No interaction trace data generated yet.</td></tr>
          ) : (
            logs.map((l: any) => (
              <tr key={l.id}>
                <td>{new Date(l.timestamp).toLocaleTimeString()}</td>
                <td>{l.orderId}</td>
                <td>{l.customerName}</td>
                <td>${l.amount}</td>
                <td>{l.reason}</td>
                <td style={{ fontWeight: 'bold' }}>{l.outcome}</td>
                <td>{l.notes}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}
