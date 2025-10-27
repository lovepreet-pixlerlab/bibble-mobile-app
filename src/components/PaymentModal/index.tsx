import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useUser } from '@/src/hooks/useUser';
import { createPaymentIntent, verifyPayment } from '@/src/services/stripeService';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (paymentIntent: any) => void;
    amount: number;
    planName: string;
    currency?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    visible,
    onClose,
    onSuccess,
    amount,
    planName,
    currency = 'usd',
}) => {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const { userEmail } = useUser();

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Step 1: Create payment intent using backend
            console.log('Creating payment intent...');
            const response = await createPaymentIntent(amount, currency);
            const { client_secret, customer, ephemeralKey } = response;

            console.log('Payment intent created:', {
                client_secret: client_secret ? 'Present' : 'Missing',
                customer: customer ? 'Present' : 'Missing',
                ephemeralKey: ephemeralKey ? 'Present' : 'Missing'
            });

            if (!client_secret) {
                throw new Error('Missing client_secret from backend');
            }

            // Step 2: Initialize payment sheet
            console.log('Initializing payment sheet...');
            const { error: initError } = await initPaymentSheet({
                paymentIntentClientSecret: client_secret,
                merchantDisplayName: 'BibleNest',
                allowsDelayedPaymentMethods: true,
                defaultBillingDetails: {
                    name: 'Customer Name',
                },
            } as any);

            if (initError) {
                console.error('Payment sheet initialization error:', initError);
                Alert.alert('Initialization Error', initError.message);
                setLoading(false);
                return;
            }

            // Step 3: Present the payment sheet
            console.log('Presenting payment sheet...');
            const { error } = await presentPaymentSheet();

            if (error) {
                console.error('Payment sheet error:', error);
                Alert.alert('Payment Error', error.message);
                setLoading(false);
                return;
            }

            // Payment successful
            console.log('Payment completed successfully!');

            // Step 4: Verify payment with backend
            try {
                console.log('Verifying payment with backend...');

                // Get user email from Redux state
                const email = userEmail || 'user@example.com'; // Fallback email

                // Call verify payment API
                const verificationResult = await verifyPayment(
                    response.paymentIntentId, // payment_intent_id
                    response.orderId,         // payment_method_id (using orderId as per your requirement)
                    response.customer,         // customer_id
                    email,                     // email
                    amount                    // amount
                );

                console.log('Payment verification successful:', verificationResult);

                // Payment and verification both successful
                setLoading(false);
                onSuccess({
                    amount,
                    planName,
                    paymentIntent: response,
                    verification: verificationResult
                });
                onClose();

            } catch (verificationError) {
                console.error('Payment verification failed:', verificationError);
                // Even if verification fails, the payment was successful
                // You might want to handle this differently based on your business logic
                Alert.alert(
                    'Payment Successful',
                    'Payment completed but verification failed. Please contact support.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setLoading(false);
                                onSuccess({
                                    amount,
                                    planName,
                                    paymentIntent: response,
                                    verification: null
                                });
                                onClose();
                            }
                        }
                    ]
                );
            }

        } catch (error) {
            console.error('Payment failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment failed';
            Alert.alert('Error', errorMessage);
            setLoading(false);
        }
    };

    const handleClose = () => {
        setLoading(false);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Complete Payment</ThemedText>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <ThemedText style={styles.closeText}>✕</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.planInfo}>
                        <ThemedText style={styles.planName}>{planName}</ThemedText>
                        <ThemedText style={styles.amount}>
                            ${amount.toFixed(2)} {currency.toUpperCase()}
                        </ThemedText>
                    </View>

                    <View style={styles.paymentInfo}>
                        <ThemedText style={styles.infoTitle}>Payment Information</ThemedText>
                        <ThemedText style={styles.infoText}>
                            • Secure payment processing by Stripe
                        </ThemedText>
                        <ThemedText style={styles.infoText}>
                            • Your payment information is encrypted
                        </ThemedText>
                        <ThemedText style={styles.infoText}>
                            • Supports cards, Apple Pay, and Google Pay
                        </ThemedText>
                        <ThemedText style={styles.infoText}>
                            • You can cancel anytime
                        </ThemedText>
                    </View>

                    <ThemedButton
                        title={loading ? 'Processing...' : 'Pay Now'}
                        variant="primary"
                        size="large"
                        onPress={handlePayment}
                        disabled={loading}
                        style={styles.payButton}
                    />

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <ThemedText style={styles.loadingText}>
                                Processing payment...
                            </ThemedText>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey2,
    },
    title: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: colors.darkGrey,
    },
    closeButton: {
        padding: scale(8),
    },
    closeText: {
        fontSize: scale(18),
        color: colors.mediumGrey,
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(20),
        paddingTop: scale(20),
    },
    planInfo: {
        backgroundColor: colors.lightGrey2,
        borderRadius: scale(12),
        padding: scale(20),
        marginBottom: scale(30),
        alignItems: 'center',
    },
    planName: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.darkGrey,
        marginBottom: scale(8),
    },
    amount: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: colors.primary,
    },
    paymentInfo: {
        marginBottom: scale(40),
    },
    infoTitle: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: colors.darkGrey,
        marginBottom: scale(12),
    },
    infoText: {
        fontSize: scale(14),
        color: colors.mediumGrey,
        marginBottom: scale(8),
        lineHeight: scale(20),
    },
    payButton: {
        marginBottom: scale(20),
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: scale(14),
        color: colors.mediumGrey,
        marginLeft: scale(8),
    },
});

export default PaymentModal;
