import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface OrderPayload {
  orderId: string;
  customerName: string;
  purchaseDate: string;
  amount: number;
  isFinalSale: boolean;
  items: string[];
  riskScore: string;
}

interface AIDecisionResponse {
  status: 'Approved' | 'Denied' | 'Escalated';
  reasoning: string;
}

export const evaluateRefundWithAI = async (
  order: OrderPayload,
  customerReason: string
): Promise<AIDecisionResponse> => {
  
  if (!process.env.GEMINI_API_KEY) {
    return {
      status: 'Escalated',
      reasoning: 'System Safeguard: GEMINI_API_KEY environment variable is missing.'
    };
  }

  const systemInstruction = `
    You are an automated AI E-commerce Customer Support Refund Evaluator for WORKNOON.
    Your goal is to safely evaluate refund claims against order details and corporate policies.

    Refund Policy Criteria:
    - Damaged or incorrect items qualifying for approval must have descriptive customer claims.
    - Suspicious accounts (riskScore: high) or conflicting logic must be Escalated for human analysis.
    - If a case doesn't clearly map to a deterministic rejection or approval, choose Escalated.

    Analyze the provided Order Record and Customer Claim details carefully. Explain your exact reasoning.
  `;

  const userPrompt = `
    Order Record: ${JSON.stringify(order)}
    Customer Claim: "${customerReason}"
  `;

  const requestConfig = {
    systemInstruction: systemInstruction,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        status: { 
          type: Type.STRING, 
          enum: ['Approved', 'Denied', 'Escalated'] 
        },
        reasoning: { type: Type.STRING }
      },
      required: ['status', 'reasoning']
    }
  };

  try {
    console.log('Attempting primary classification using gemini-3.8-flash...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: requestConfig
    });

    // Property access access format (.text) matches SDK standards perfectly
    return JSON.parse(response.text || '{}') as AIDecisionResponse;

  } catch (primaryError: any) {
    console.warn('Primary model issue encountered. Status:', primaryError?.status);
    
    try {
      console.log('Attempting fallback classification using gemini-3.5-flash-lite...');
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: userPrompt,
        config: requestConfig
      });
      
      // FIX: Cleaned property access access format (.text) removes execution crashes completely
      return JSON.parse(fallbackResponse.text || '{}') as AIDecisionResponse;
    } catch (fallbackError) {
      console.error('All alternative model configurations exhausted:', fallbackError);
    }

    return {
      status: 'Escalated',
      reasoning: 'System Safeguard: Request gracefully escalated to human support due to internal capacity constraints on the AI provider infrastructure.'
    };
  }
};
