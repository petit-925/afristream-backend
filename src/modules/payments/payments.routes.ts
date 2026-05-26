import { Router } from 'express';
import { initPayment, paystackWebhook, verifyPaystack, initiateMomo, verifyMomo } from './payments.controller';

export const router = Router();

router.post('/init', initPayment);
router.post('/webhook', paystackWebhook);
router.get('/verify/:reference', verifyPaystack);
// Mobile Money
router.post('/momo/initiate', initiateMomo);
router.get('/momo/verify/:reference', verifyMomo);

