// Stripe configuration
export const STRIPE_CONFIG = {
    // Replace with your actual Stripe publishable key
    publishableKey: 'pk_test_51SLeDl2NZRBSRrz2uq4MXuAf45qEhVN6gRForxqybEdLDT0I6otAG17MY2UvEDjl5tCPrI4tybo52hi6NGPjgH0R00d1c4gJfG',

    // Stripe API endpoints
    endpoints: {
        createPaymentIntent: '/api/stripe/create-payment-intent',
        confirmPayment: '/api/stripe/confirm-payment',
        createCustomer: '/api/stripe/create-customer',
        createSubscription: '/api/stripe/create-subscription',
    },

    // Currency configuration
    currency: 'usd',

    // Payment methods
    paymentMethods: ['card'],

    // Apple Pay configuration (iOS)
    applePay: {
        merchantId: 'merchant.com.yourapp.bibble',
        merchantCountryCode: 'US',
    },

    // Google Pay configuration (Android)
    googlePay: {
        merchantId: 'merchant.com.yourapp.bibble',
        merchantCountryCode: 'US',
    },
};
