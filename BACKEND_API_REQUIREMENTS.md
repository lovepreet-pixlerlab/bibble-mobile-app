# Backend API Requirements for Stripe Integration

## Required API Endpoints

### 1. Create Payment Intent
**Endpoint**: `POST /api/stripe/create-payment-intent`

**Request Body**:
```json
{
  "amount": 700,
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

**Backend Implementation Example (Node.js/Express)**:
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create or get customer
    let customer;
    try {
      customer = await stripe.customers.create({
        email: req.user.email, // Get from auth
        name: req.user.name,
      });
    } catch (error) {
      // Customer might already exist
      customer = await stripe.customers.list({
        email: req.user.email,
        limit: 1
      });
      customer = customer.data[0];
    }

    // Create ephemeral key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' }
    );

    res.json({
      client_secret: paymentIntent.client_secret,
      customer: customer.id,
      ephemeralKey: ephemeralKey.secret
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
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

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Webhook Endpoints

Set up webhooks in Stripe Dashboard to handle:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Security Considerations

1. **Authentication**: Verify user authentication before processing payments
2. **Validation**: Validate all input data
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Logging**: Log all payment events for auditing
5. **Error Handling**: Proper error responses without exposing sensitive data

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient Funds: `4000 0000 0000 9995`

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhook endpoints
- [ ] Configure proper error handling
- [ ] Implement logging and monitoring
- [ ] Set up database to store payment records
- [ ] Configure proper CORS settings
- [ ] Implement rate limiting
- [ ] Set up SSL certificates
