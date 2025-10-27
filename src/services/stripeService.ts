import { STRIPE_CONFIG } from '@/src/config/stripe';
import { initStripe } from '@stripe/stripe-react-native';

// Initialize Stripe
export const initializeStripe = async () => {
    try {
        await initStripe({
            publishableKey: STRIPE_CONFIG.publishableKey,
            merchantIdentifier: STRIPE_CONFIG.applePay.merchantId,
            urlScheme: 'bibble-app', // Your app's URL scheme
        });
        console.log('Stripe initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Stripe:', error);
    }
};

// Payment intent creation
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
    try {
        // For now, return mock data since backend is not ready
        // TODO: Replace with actual API call when backend is implemented
        console.log('Creating payment intent for amount:', amount, currency);

        // Mock response for testing
        const mockResponse = {
            client_secret: 'pi_mock_client_secret_123',
            customer: 'cus_mock_customer_123',
            ephemeralKey: 'ek_mock_ephemeral_key_123'
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return mockResponse;

        /* 
        // Uncomment this when backend is ready:
        const response = await fetch(STRIPE_CONFIG.endpoints.createPaymentIntent, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your authorization header here
                // 'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                amount: amount * 100, // Convert to cents
                currency: currency,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
        */
    } catch (error) {
        console.error('Failed to create payment intent:', error);
        throw error;
    }
};

// Create customer
export const createCustomer = async (email: string, name: string) => {
    try {
        const response = await fetch(STRIPE_CONFIG.endpoints.createCustomer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your authorization header here
                // 'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                email,
                name,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to create customer:', error);
        throw error;
    }
};

// Create subscription
export const createSubscription = async (customerId: string, priceId: string) => {
    try {
        const response = await fetch(STRIPE_CONFIG.endpoints.createSubscription, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add your authorization header here
                // 'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({
                customerId,
                priceId,
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to create subscription:', error);
        throw error;
    }
};
