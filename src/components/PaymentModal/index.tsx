import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { createPaymentIntent } from '@/src/services/stripeService';
// Stripe imports commented out for demo mode
// import { useStripe } from '@stripe/stripe-react-native';
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
    // const { presentPaymentSheet } = useStripe(); // Commented out for demo mode
    const [loading, setLoading] = useState(false);

    const initializePaymentSheet = async () => {
        try {
            setLoading(true);

            // Create payment intent (mock data for demo)
            const response = await createPaymentIntent(amount, currency);
            const { client_secret, customer, ephemeralKey } = response;
            console.log('client_secret', client_secret);
            console.log('customer', customer);
            console.log('ephemeralKey', ephemeralKey);
            // For demo purposes, show success message instead of actual Stripe payment
            Alert.alert(
                'Demo Payment',
                `Payment of $${amount} for ${planName} would be processed here.\n\nThis is a demo - no actual payment is charged.`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {
                            setLoading(false);
                        }
                    },
                    {
                        text: 'Complete Demo',
                        onPress: () => {
                            setLoading(false);
                            onSuccess({ amount, planName });
                            onClose();
                        }
                    }
                ]
            );

            /* 
            // Uncomment this when backend is ready:
            const { error } = await initPaymentSheet({
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: client_secret,
                merchantDisplayName: 'BibleNest',
                allowsDelayedPaymentMethods: true,
                defaultBillingDetails: {
                    name: 'Customer Name',
                },
            });

            if (error) {
                Alert.alert('Error', error.message);
                setLoading(false);
                return;
            }

            setPaymentSheetEnabled(true);
            setLoading(false);
            */
        } catch (error) {
            console.error('Payment sheet initialization failed:', error);
            Alert.alert('Error', 'Failed to initialize payment');
            setLoading(false);
        }
    };


    const handlePayment = async () => {
        await initializePaymentSheet();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Complete Payment</ThemedText>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                            • Demo mode - no actual payment will be charged
                        </ThemedText>
                        <ThemedText style={styles.infoText}>
                            • Secure payment processing by Stripe (when backend is ready)
                        </ThemedText>
                        <ThemedText style={styles.infoText}>
                            • Your payment information is encrypted
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
                                Setting up payment...
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
