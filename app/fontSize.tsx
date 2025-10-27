import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { useFontSize } from '@/src/hooks/useFontSize';
import { setVerseFontSize } from '@/src/redux/features/fontSize';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

const FontSizeScreen = () => {
    const dispatch = useDispatch();
    const { verseFontSize, getFontSizeLabel } = useFontSize();
    const [currentFontSize, setCurrentFontSize] = useState(verseFontSize);

    const handleBackPress = () => {
        router.back();
    };

    const handleFontSizeChange = (value: number) => {
        setCurrentFontSize(value);
    };

    const handleSave = () => {
        dispatch(setVerseFontSize(currentFontSize));
        router.back();
    };

    const handleReset = () => {
        setCurrentFontSize(16);
        dispatch(setVerseFontSize(16));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Image source={Icons.backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <ThemedText style={styles.headerTitle}>Font Size</ThemedText>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Verse Font Size</ThemedText>
                    <ThemedText style={styles.sectionDescription}>
                        Adjust the font size for verses to improve readability
                    </ThemedText>
                </View>

                {/* Font Size Slider */}
                <View style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                        <ThemedText style={styles.sliderLabel}>Font Size</ThemedText>
                        <View style={styles.sliderValueContainer}>
                            <ThemedText style={styles.sliderValue}>{Math.round(currentFontSize)}px</ThemedText>
                            <ThemedText style={styles.sliderLabel}>{getFontSizeLabel()}</ThemedText>
                        </View>
                    </View>

                    <Slider
                        style={styles.slider}
                        minimumValue={12}
                        maximumValue={24}
                        value={currentFontSize}
                        onValueChange={handleFontSizeChange}
                        step={1}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.lightGrey2}
                    />

                    <View style={styles.sliderLabels}>
                        <ThemedText style={styles.sliderLabelText}>Small</ThemedText>
                        <ThemedText style={styles.sliderLabelText}>Large</ThemedText>
                    </View>
                </View>

                {/* Preview */}
                <View style={styles.previewContainer}>
                    <ThemedText style={styles.previewTitle}>Preview</ThemedText>
                    <View style={styles.previewBox}>
                        <ThemedText style={[styles.previewText, { fontSize: scale(currentFontSize) }]}>
                            A Mighty Fortress is Our God
                        </ThemedText>
                        <ThemedText style={[styles.previewText, { fontSize: scale(currentFontSize) }]}>
                            A bulwark never failing
                        </ThemedText>
                        <ThemedText style={[styles.previewText, { fontSize: scale(currentFontSize) }]}>
                            Our helper He, amid the flood
                        </ThemedText>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
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
        paddingHorizontal: scale(20),
        paddingVertical: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey2,
        minHeight: scale(60),
    },
    backButton: {
        padding: scale(8),
        marginRight: scale(12),
        width: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        width: scale(24),
        height: scale(24),
        resizeMode: 'contain',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(8),
    },
    headerTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.darkGrey,
        textAlign: 'center',
        lineHeight: scale(22),
    },
    headerSpacer: {
        width: scale(40),
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(20),
        paddingVertical: scale(24),
    },
    section: {
        marginBottom: scale(32),
    },
    sectionTitle: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: colors.darkGrey,
        marginBottom: scale(8),
    },
    sectionDescription: {
        fontSize: scale(16),
        color: colors.mediumGrey,
        lineHeight: scale(24),
    },
    sliderContainer: {
        marginBottom: scale(32),
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(16),
    },
    sliderLabel: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.darkGrey,
    },
    sliderValueContainer: {
        alignItems: 'flex-end',
    },
    sliderValue: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: colors.primary,
    },
    slider: {
        width: '100%',
        height: scale(40),
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: scale(8),
    },
    sliderLabelText: {
        fontSize: scale(14),
        color: colors.mediumGrey,
    },
    previewContainer: {
        marginBottom: scale(32),
    },
    previewTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.darkGrey,
        marginBottom: scale(12),
    },
    previewBox: {
        backgroundColor: colors.lightGrey2,
        borderRadius: scale(8),
        padding: scale(16),
        borderWidth: 1,
        borderColor: colors.lightGrey,
    },
    previewText: {
        color: colors.darkGrey,
        lineHeight: scale(24),
        marginBottom: scale(8),
        textAlign: 'left',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    resetButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: scale(8),
        paddingVertical: scale(12),
        marginRight: scale(8),
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.primary,
    },
    saveButton: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: scale(8),
        paddingVertical: scale(12),
        marginLeft: scale(8),
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: colors.white,
    },
});

export default FontSizeScreen;
