"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPayment = initPayment;
exports.paystackWebhook = paystackWebhook;
exports.verifyPaystack = verifyPaystack;
exports.initiateMomo = initiateMomo;
exports.verifyMomo = verifyMomo;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const AppError_1 = require("../../common/errors/AppError");
async function initPayment(req, res) {
    const { amount, email } = req.body;
    // Placeholder: frontend should call server to create Paystack transaction via secret
    res.json({ gateway: 'paystack', amount, email, status: 'initialized' });
}
async function paystackWebhook(req, res) {
    const signature = req.headers['x-paystack-signature'];
    const payload = JSON.stringify(req.body);
    const hash = crypto_1.default.createHmac('sha512', env_1.env.PAYSTACK_WEBHOOK_SECRET || '').update(payload).digest('hex');
    if (hash !== signature)
        return res.status(401).json({ message: 'Invalid signature' });
    // TODO: update order status based on event
    res.json({ received: true });
}
async function verifyPaystack(req, res) {
    try {
        const { reference } = req.params;
        if (!reference)
            return res.status(400).json({ message: 'Missing reference' });
        const secret = env_1.env.PAYSTACK_SECRET;
        if (!secret)
            throw AppError_1.AppError.internal('PAYSTACK_SECRET_KEY not configured');
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
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Failed to verify payment', error);
    }
}
// Mobile Money: initiate payment (server contacts provider or triggers STK push via PSP)
async function initiateMomo(req, res) {
    const { phone, email, amount, currency, reference } = req.body;
    if (!phone || !amount || !reference)
        return res.status(400).json({ message: 'Missing required fields' });
    // Stub: Integrate with your PSP here (Hubtel, MTN MoMo, Vodafone, Flutterwave, etc.)
    // For now, we acknowledge initiation so frontend can start polling
    res.json({ status: 'pending', reference, amount, currency: currency || 'GHS', phone, email });
}
// Mobile Money: verify payment status by reference
async function verifyMomo(req, res) {
    try {
        const { reference } = req.params;
        if (!reference)
            return res.status(400).json({ message: 'Missing reference' });
        // Stub: Query your PSP for transaction status and normalize it
        // Return 'success' when provider confirms payment
        res.json({ status: 'pending', reference });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Failed to verify MoMo payment', error);
    }
}
