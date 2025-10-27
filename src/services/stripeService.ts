import { STRIPE_CONFIG } from '@/src/config/stripe';
import { getSession, STORAGE_KEYS } from '@/src/utils/localStorage';
import { initStripe } from '@stripe/stripe-react-native';

const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.10:4041';

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

// Create order with backend
export const createOrder = async (amount: number, currency: string = 'usd', productId: string = 'bible_access') => {
    try {
        console.log('Creating order for amount:', amount, currency, productId);

        const token = await getSession(STORAGE_KEYS.TOKEN);

        const response = await fetch(`${baseUrl}/api/user/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                amount: amount,
                currency: currency,
                productId: productId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Order created successfully:', data);

        // Handle the API response structure
        if (data.success && data.data) {
            console.log('API Response Data:', data.data);
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to create order');
        }
    } catch (error) {
        console.error('Failed to create order:', error);
        throw error;
    }
};

// Payment intent creation (updated to use backend)
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
    try {
        console.log('Creating payment intent for amount:', amount, currency);

        // Use the backend create-order endpoint
        const orderData = await createOrder(amount, currency, 'bible_access');

        // Map the API response to the format expected by PaymentModal
        return {
            client_secret: orderData.client_secret,
            customer: orderData.customer_id,
            ephemeralKey: null, // Your API doesn't return ephemeral key, will need to handle this
            orderId: orderData.payment_intent_id,
            paymentIntentId: orderData.payment_intent_id,
            amount: orderData.amount,
            currency: orderData.currency,
        };
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

// Verify payment with backend
export const verifyPayment = async (
    paymentIntentId: string,
    paymentMethodId: string,
    customerId: string,
    email: string,
    amount: number
) => {
    try {
        console.log('Verifying payment:', {
            paymentIntentId,
            paymentMethodId,
            customerId,
            email,
            amount
        });

        const token = await getSession(STORAGE_KEYS.TOKEN);

        const response = await fetch(`${baseUrl}/api/user/verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                payment_intent_id: paymentIntentId,
                payment_method_id: paymentMethodId,
                customer_id: customerId,
                email: email,
                amount: amount,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Payment verified successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to verify payment:', error);
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
