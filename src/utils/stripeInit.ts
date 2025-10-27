import { initializeStripe } from '@/src/services/stripeService';

// Initialize Stripe when the app starts
export const initStripePayment = async () => {
    try {
        await initializeStripe();
        console.log('Stripe payment system initialized');
    } catch (error) {
        console.error('Failed to initialize Stripe payment system:', error);
    }
};
