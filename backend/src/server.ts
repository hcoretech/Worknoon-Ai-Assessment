import express, { type Request, type Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { evaluateRefundWithAI } from './services/aiService.js';
import { fileURLToPath } from 'url';

// 1. Manually recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Your database path logic will now work flawlessly




const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'data', 'mockDb.json');

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDb = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

app.get('/api/orders', (req: Request, res: Response) => {
  res.json(readDb().orders);
});

app.get('/api/logs', (req: Request, res: Response) => {
  res.json(readDb().auditLogs || []);
});

app.post('/api/refunds/request', async (req: Request, res: Response): Promise<any> => {
  const { orderId, customerReason } = req.body;
  if (!orderId || !customerReason) return res.status(400).json({ error: 'Missing parameters.' });

  const injectionPatterns = [/ignore previous instructions/i, /system override/i, /approve this automatically/i];
  if (injectionPatterns.some(p => p.test(customerReason))) {
    return res.json({ status: 'Escalated', reasoning: 'Guardrail: Cyber-security policy violation / prompt injection signature detected.' });
  }

  const db = readDb();
  const order = db.orders.find((o: any) => o.orderId === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  let decision = { status: '', reasoning: '' };

  if (order.isFinalSale) {
    decision = { status: 'Denied', reasoning: 'Hard Policy: Final sale items cannot be returned.' };
  } else if (order.amount > 500) {
    decision = { status: 'Escalated', reasoning: 'Hard Policy: Order totals exceeding $500 demand manual supervisor audit.' };
  } else {
    try {
      decision = await evaluateRefundWithAI(order, customerReason);
    } catch {
      return res.status(500).json({ error: 'AI processing failure.' });
    }
  }

  // Save trace log
  db.auditLogs = db.auditLogs || [];
  db.auditLogs.push({
    id: `LOG-${Date.now()}`,
    orderId,
    customerName: order.customerName,
    amount: order.amount,
    reason: customerReason,
    outcome: decision.status,
    notes: decision.reasoning,
    timestamp: new Date().toISOString()
  });
  writeDb(db);

  res.json(decision);
});

app.listen(5000, () => console.log('Backend active on port 5000'));
