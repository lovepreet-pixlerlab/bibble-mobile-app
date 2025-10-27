# Stripe Payment Integration Setup

This document provides instructions for setting up Stripe payment integration in the BibleNest app.

## Prerequisites

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **API Keys**: Get your publishable and secret keys from Stripe Dashboard
3. **Backend Setup**: Set up your backend to handle Stripe webhooks and payment intents

## Configuration

### 1. Update Stripe Configuration

Edit `src/config/stripe.ts`:

```typescript
export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  publishableKey: 'pk_test_your_actual_publishable_key_here',
  
  // Update your API endpoints
  endpoints: {
    createPaymentIntent: '/api/stripe/create-payment-intent',
    confirmPayment: '/api/stripe/confirm-payment',
    createCustomer: '/api/stripe/create-customer',
    createSubscription: '/api/stripe/create-subscription',
  },
  
  // Update merchant IDs for Apple Pay/Google Pay
  applePay: {
    merchantId: 'merchant.com.yourapp.bibble',
    merchantCountryCode: 'US',
  },
  
  googlePay: {
    merchantId: 'merchant.com.yourapp.bibble',
    merchantCountryCode: 'US',
  },
};
```

### 2. Update Plan Screen

Edit `app/(onBoardingStack)/plan.tsx`:

```typescript
// Replace with your actual publishable key
<StripeProvider publishableKey="pk_test_your_actual_publishable_key_here">
```

## Backend API Endpoints

You need to implement these endpoints on your backend:

### 1. Create Payment Intent

**Endpoint**: `POST /api/stripe/create-payment-intent`

**Request Body**:
```json
{
  "amount": 700,  // Amount in cents ($7.00)
  "currency": "usd"
}
```

**Response**:
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "customer": "cus_xxx",
  "ephemeralKey": "ek_xxx"
}
```

### 2. Create Customer

**Endpoint**: `POST /api/stripe/create-customer`

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "User Name"
}
```

**Response**:
```json
{
  "customerId": "cus_xxx"
}
```

### 3. Create Subscription

**Endpoint**: `POST /api/stripe/create-subscription`

**Request Body**:
```json
{
  "customerId": "cus_xxx",
  "priceId": "price_premium_lifetime"
}
```

**Response**:
```json
{
  "subscriptionId": "sub_xxx",
  "clientSecret": "seti_xxx"
}
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Stripe Keys
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# App Configuration
APP_URL_SCHEME=bibble-app
MERCHANT_ID=merchant.com.yourapp.bibble
```

## Testing

### Test Cards

Use these test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

### Test Flow

1. Select a premium plan
2. Click "Continue"
3. Payment modal opens
4. Enter test card details
5. Complete payment
6. Verify success callback

## Production Setup

### 1. Update Keys

Replace test keys with live keys:

```typescript
// In src/config/stripe.ts
publishableKey: 'pk_live_your_live_publishable_key_here',

// In app/(onBoardingStack)/plan.tsx
<StripeProvider publishableKey="pk_live_your_live_publishable_key_here">
```

### 2. App Store Configuration

For iOS:
- Configure Apple Pay in your Apple Developer account
- Update merchant ID in Stripe configuration

For Android:
- Configure Google Pay in your Google Play Console
- Update merchant ID in Stripe configuration

### 3. Webhook Setup

Set up webhooks in your Stripe Dashboard to handle:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Validate webhooks** using Stripe's webhook signatures
3. **Use HTTPS** in production
4. **Implement proper authentication** for API endpoints
5. **Log payment events** for debugging and auditing

## Troubleshooting

### Common Issues

1. **"Invalid publishable key"**: Check that you're using the correct key format
2. **"Payment sheet failed to initialize"**: Verify backend endpoints are working
3. **"Apple Pay not available"**: Check merchant ID configuration
4. **"Google Pay not available"**: Verify Google Play Console setup

### Debug Mode

Enable debug logging:

```typescript
// In src/services/stripeService.ts
console.log('Stripe initialized successfully');
console.log('Payment intent created:', data);
```

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Native Guide](https://stripe.com/docs/stripe-react-native)
- [Stripe Support](https://support.stripe.com)

For app-specific issues:
- Check console logs for error messages
- Verify API endpoints are accessible
- Test with different payment methods
