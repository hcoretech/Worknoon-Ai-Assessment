"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("API error:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:5000/api/refunds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder, customerReason: reason })
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ status: 'Error', reasoning: 'Network or system failure communication fault.' });
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Worknoon AI Customer Support Hub</h2>
      <a href="/admin" style={{ display: 'inline-block', marginBottom: '20px' }}>Go to Admin Dashboard →</a>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <label>Select Product Order Profile:</label>
        <select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">-- Choose Account Scenario --</option>
          {orders.map((o: any) => (
            <option key={o.orderId} value={o.orderId}>
              {o.customerName} -{o.items} {o.orderId} (${o.amount}) {o.isFinalSale ? '[Final Sale]' : ''}
            </option>
          ))}
        </select>

        <label>Describe the Refund Issue:</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={4} style={{ padding: '8px' }} placeholder="Explain the problem..."></textarea>

        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Processing Automated Review...' : 'File Claim'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '6px', backgroundColor: result.status === 'Approved' ? '#e6f4ea' : result.status === 'Denied' ? '#fce8e6' : '#ffeab6', border: '1px solid' }}>
          <h3>Status Outcome: {result.status}</h3>
          <p><strong>Worknoon-Ai:</strong> {result.reasoning}</p>
        </div>
      )}
    </main>
  );
}
