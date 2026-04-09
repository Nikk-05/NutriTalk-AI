import Stripe from 'stripe';
import {User} from '../models/User.model.js';
import { success, error, serverError } from '../utils/response.utils.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plan config
const PLANS = [
  { id: 'plan_starter', name: 'Starter', price: 0,    period: null,      features: ['5 AI meal plan generations/month', 'Basic calorie tracking', 'Recipe suggestions', 'Community access'] },
  { id: 'plan_pro',     name: 'Pro',     price: 1200, period: 'monthly', stripePriceId: process.env.STRIPE_PRO_PRICE_ID,   features: ['Unlimited AI meal plans', 'Advanced macro tracking', 'Wearable integrations', 'Priority AI responses', 'Personalized weekly reports', 'Custom dietary profiles'] },
  { id: 'plan_elite',   name: 'Elite',   price: 2900, period: 'monthly', stripePriceId: process.env.STRIPE_ELITE_PRICE_ID, features: ['Everything in Pro', '1-on-1 dietitian consultation/month', 'Lab result analysis', 'Supplement recommendations', 'Advanced biometric tracking', 'White-glove onboarding'] },
];

// ── GET /subscription/plans ────────────────────────────────
const getPlans = (req, res) => success(res, { plans: PLANS });

// ── GET /subscription/current ──────────────────────────────
const getCurrent = async (req, res, next) => {
  try {
    const user = req.user;
    const plan = PLANS.find(p => p.id === `plan_${user.plan}`) || PLANS[0];
    return success(res, { plan, currentPlan: user.plan, since: user.createdAt });
  } catch (err) { next(err); }
};

// ── POST /subscription/checkout ────────────────────────────
const createCheckout = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan || !plan.stripePriceId) return error(res, 'INVALID_PLAN', 'Invalid plan selected.', 400);

    // Ensure Stripe customer exists
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: req.user.email, name: req.user.name });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success`,
      cancel_url:  `${process.env.FRONTEND_URL}/upgrade`,
    });

    return success(res, { checkoutUrl: session.url });
  } catch (err) { next(err); }
};

// ── POST /subscription/cancel ──────────────────────────────
const cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+stripeSubscriptionId');
    if (!user.stripeSubscriptionId) return error(res, 'NO_SUBSCRIPTION', 'No active subscription found.', 400);

    await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true });
    return success(res, { message: 'Subscription will be cancelled at the end of the billing period.' });
  } catch (err) { next(err); }
};

// ── POST /subscription/portal ──────────────────────────────
const createPortalSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+stripeCustomerId');
    if (!user.stripeCustomerId) return error(res, 'NO_CUSTOMER', 'No billing account found.', 400);

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });
    return success(res, { portalUrl: session.url });
  } catch (err) { next(err); }
};

// ── POST /subscription/webhook ─────────────────────────────
// Called by Stripe — must verify signature, no auth middleware
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const sub = event.data.object;
    const planMap = { [process.env.STRIPE_PRO_PRICE_ID]: 'pro', [process.env.STRIPE_ELITE_PRICE_ID]: 'elite' };
    const newPlan = planMap[sub.items.data[0]?.price?.id] || 'free';
    await User.findOneAndUpdate(
      { stripeCustomerId: sub.customer },
      { plan: newPlan, stripeSubscriptionId: sub.id }
    );
  }
  if (event.type === 'customer.subscription.deleted') {
    await User.findOneAndUpdate({ stripeCustomerId: event.data.object.customer }, { plan: 'free' });
  }

  res.json({ received: true });
};

export default { getPlans, getCurrent, createCheckout, cancelSubscription, createPortalSession, handleWebhook };
