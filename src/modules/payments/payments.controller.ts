import type { Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../../config/env';
import { AppError } from '../../common/errors/AppError';

export async function initPayment(req: Request, res: Response) {
  const { amount, email } = req.body as { amount: number; email: string };
  // Placeholder: frontend should call server to create Paystack transaction via secret
  res.json({ gateway: 'paystack', amount, email, status: 'initialized' });
}

export async function paystackWebhook(req: Request, res: Response) {
  const signature = req.headers['x-paystack-signature'] as string;
  const payload = JSON.stringify(req.body);
  const hash = crypto.createHmac('sha512', env.PAYSTACK_WEBHOOK_SECRET || '').update(payload).digest('hex');
  if (hash !== signature) return res.status(401).json({ message: 'Invalid signature' });
  // TODO: update order status based on event
  res.json({ received: true });
}

export async function verifyPaystack(req: Request, res: Response) {
  try {
    const { reference } = req.params as { reference: string };
    if (!reference) return res.status(400).json({ message: 'Missing reference' });

    const secret = env.PAYSTACK_SECRET_KEY;
    if (!secret) throw AppError.internal('PAYSTACK_SECRET_KEY not configured');

    const resp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ message: data?.message || 'Verification failed', data });
    }
    // Return normalized result
    res.json({
      status: data?.data?.status === 'success' ? 'success' : data?.data?.status,
      reference: data?.data?.reference,
      amount: data?.data?.amount,
      currency: data?.data?.currency,
      raw: data?.data,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to verify payment', error);
  }
}

// Mobile Money: initiate payment (server contacts provider or triggers STK push via PSP)
export async function initiateMomo(req: Request, res: Response) {
  const { phone, email, amount, currency, reference } = req.body as {
    phone: string; email?: string; amount: number; currency?: string; reference: string;
  };
  if (!phone || !amount || !reference) return res.status(400).json({ message: 'Missing required fields' });
  // Stub: Integrate with your PSP here (Hubtel, MTN MoMo, Vodafone, Flutterwave, etc.)
  // For now, we acknowledge initiation so frontend can start polling
  res.json({ status: 'pending', reference, amount, currency: currency || 'GHS', phone, email });
}

// Mobile Money: verify payment status by reference
export async function verifyMomo(req: Request, res: Response) {
  try {
    const { reference } = req.params as { reference: string };
    if (!reference) return res.status(400).json({ message: 'Missing reference' });
    // Stub: Query your PSP for transaction status and normalize it
    // Return 'success' when provider confirms payment
    res.json({ status: 'pending', reference });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw AppError.internal('Failed to verify MoMo payment', error);
  }
}

