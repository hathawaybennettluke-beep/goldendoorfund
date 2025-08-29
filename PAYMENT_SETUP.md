# Payment System Setup Guide

This guide explains how to set up the Stripe payment system for the donation platform.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Convex project configured
3. Clerk authentication set up (optional but recommended)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
```

## Stripe Setup

### 1. Get Your API Keys

1. Go to your Stripe Dashboard
2. Navigate to Developers > API keys
3. Copy your Publishable key and Secret key
4. Add them to your environment variables

### 2. Set Up Webhooks

1. In your Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
4. Select the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the webhook signing secret and add it to `STRIPE_WEBHOOK_SECRET`

**Note**: The webhook endpoint forwards requests to Convex HTTP actions for better performance and reliability.

### 3. Test Mode vs Live Mode

- Use test keys for development (`sk_test_` and `pk_test_`)
- Use live keys for production (`sk_live_` and `pk_live_`)

## Database Schema

The payment system uses the following schema updates:

### Donations Table

```typescript
donations: defineTable({
  amount: v.number(), // Amount in cents
  donorId: v.id("users"),
  campaignId: v.id("campaigns"),
  message: v.optional(v.string()),
  isAnonymous: v.boolean(),
  stripePaymentIntentId: v.optional(v.string()),
  stripeCustomerId: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("succeeded"),
    v.literal("failed"),
    v.literal("canceled")
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
});
```

## Architecture

### 1. Convex HTTP Actions

- Webhook handling using Convex HTTP actions for better performance
- Internal mutations for database operations that shouldn't be exposed
- Proper separation of concerns between public and internal functions

### 2. Payment Processing

- Secure payment processing with Stripe
- Support for multiple payment methods
- Automatic payment confirmation
- Error handling and retry logic

### 3. Donation Management

- Anonymous donations support
- Donation messages
- Real-time donation tracking
- Campaign amount updates using internal mutations

### 4. User Experience

- Seamless checkout flow
- Payment status notifications
- Recent donations display
- Donation history

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** to prevent replay attacks
3. **Use HTTPS** in production
4. **Validate payment amounts** on the server side
5. **Handle payment failures** gracefully
6. **Log payment events** for debugging

## Testing

### Test Cards

Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`

### Test Amounts

- Minimum: $1.00 (100 cents)
- Maximum: $10,000.00 (1,000,000 cents)

## Error Handling

The system handles various error scenarios:

1. **Payment failures** - Automatically updates donation status
2. **Network errors** - Retry logic with user feedback
3. **Invalid amounts** - Client and server-side validation
4. **Webhook failures** - Logging and manual intervention

## Monitoring

Monitor your payments through:

1. **Stripe Dashboard** - Real-time payment status
2. **Convex Dashboard** - Database queries and mutations
3. **Application logs** - Error tracking and debugging

## Production Checklist

Before going live:

- [ ] Switch to live Stripe keys
- [ ] Set up production webhook endpoint
- [ ] Test payment flow end-to-end
- [ ] Verify error handling
- [ ] Set up monitoring and alerts
- [ ] Review security measures
- [ ] Test with real payment methods

## Support

For issues related to:

- **Stripe**: Contact Stripe Support
- **Convex**: Check Convex Documentation
- **Application**: Review logs and error messages
