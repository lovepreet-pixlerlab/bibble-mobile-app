import { Icons } from '@/src/assets/icons';
import PaymentModal from '@/src/components/PaymentModal';
import { ThemedText } from '@/src/components/themed-text';
import ThemedButton from '@/src/components/ThemedButton';
import { STRIPE_CONFIG } from '@/src/config/stripe';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { setSelectedPlan as setSelectedPlanAction } from '@/src/redux/features/userPreferences';
import { StripeProvider } from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const plans = [
    {
        id: 'free',
        title: 'Bible & Hymns',
        subtitle: 'Start Your 1-Week Free Trial.',
        buttonText: 'Free',
        price: 0,
        priceId: null,
    },
    {
        id: 'premium',
        title: 'Upgrade to Premium',
        subtitle: 'Only $7 for lifetime access.',
        buttonText: 'Pro',
        hasCrown: true,
        price: 7,
        priceId: 'price_premium_lifetime',
    },
];

const PlanScreen = () => {
    const dispatch = useDispatch();
    const { selectedPlan: savedPlan } = useSelector((state: any) => state.userPreferences);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(savedPlan);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
        dispatch(setSelectedPlanAction(planId));
    };

    const handleContinue = () => {
        if (selectedPlan) {
            const plan = plans.find(p => p.id === selectedPlan);

            if (plan?.price === 0) {
                // Free plan - no payment required
                console.log('Selected free plan:', selectedPlan);
                router.replace('/(tabs)');
            } else {
                // Paid plan - show payment modal
                setShowPaymentModal(true);
            }
        }
    };

    const handlePaymentSuccess = (paymentData: any) => {
        console.log('Payment successful:', paymentData);
        setShowPaymentModal(false);
        router.replace('/(tabs)');
    };

    const handleBack = () => {
        router.back();
    };

    const selectedPlanData = plans.find(p => p.id === selectedPlan);

    return (
        <StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Image source={Icons.backIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Choose Your Plan</ThemedText>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Plan Cards */}
                    <View style={styles.plansContainer}>
                        {plans.map((plan) => (
                            <TouchableOpacity
                                key={plan.id}
                                style={[
                                    styles.planCard,
                                    selectedPlan === plan.id && styles.selectedPlanCard
                                ]}
                                onPress={() => handlePlanSelect(plan.id)}
                            >
                                <View style={styles.planContent}>
                                    <View style={styles.planTextContainer}>
                                        <ThemedText style={styles.planTitle}>
                                            {plan.title}
                                        </ThemedText>
                                        <ThemedText style={styles.planSubtitle}>
                                            {plan.subtitle}
                                        </ThemedText>
                                    </View>

                                    <View style={styles.planButton}>
                                        {plan.hasCrown && (
                                            <Image source={Icons.crownIcon} style={styles.crownIcon} />
                                        )}
                                        <ThemedText style={styles.planButtonText}>
                                            {plan.buttonText}
                                        </ThemedText>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Continue Button */}
                    <ThemedButton
                        title="Continue"
                        variant="primary"
                        size="large"
                        disabled={!selectedPlan}
                        onPress={handleContinue}
                        style={styles.continueButton}
                    />
                </View>

                {/* Payment Modal */}
                {selectedPlanData && (
                    <PaymentModal
                        visible={showPaymentModal}
                        onClose={() => setShowPaymentModal(false)}
                        onSuccess={handlePaymentSuccess}
                        amount={selectedPlanData.price}
                        planName={selectedPlanData.title}
                    />
                )}
            </SafeAreaView>
        </StripeProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: scale(8),
    },
    backIcon: {
        width: scale(24),
        height: scale(24),
        resizeMode: 'contain',
    },
    title: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#333333',
    },
    headerSpacer: {
        width: scale(40),
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(20),
        paddingTop: scale(30),
    },
    plansContainer: {
        flex: 1,
        gap: scale(16),
    },
    planCard: {
        backgroundColor: colors.lightRed,
        borderRadius: scale(12),
        padding: scale(20),
        // borderWidth: 1,
        // borderColor: colors.primary,
    },
    selectedPlanCard: {
        borderWidth: scale(2),
        borderColor: colors.primary,
        backgroundColor: colors.lightRed,
    },
    planContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planTextContainer: {
        flex: 1,
        marginRight: scale(16),
    },
    planTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: scale(4),
    },
    planSubtitle: {
        fontSize: scale(14),
        color: '#666666',
    },
    planButton: {
        backgroundColor: colors.primary,
        borderRadius: scale(20),
        paddingVertical: scale(8),
        paddingHorizontal: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: scale(80),
    },
    planButtonText: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.white,
    },
    crownIcon: {
        width: scale(16),
        height: scale(16),
        resizeMode: 'contain',
        marginRight: scale(4),
    },
    continueButton: {
        marginTop: scale(20),
        marginBottom: scale(30),
    },
});

export default PlanScreen;
