import { scale } from '@/src/constants/responsive';
import { useSelector } from 'react-redux';

/**
 * Custom hook for managing verse font size across different screens
 * This hook provides easy access to font size settings and utilities
 */
export const useFontSize = () => {
    const { verseFontSize } = useSelector((state: any) => state.fontSize);

    /**
     * Get the scaled font size for verses
     * @returns {number} Scaled font size for current device
     */
    const getVerseFontSize = (): number => {
        return scale(verseFontSize);
    };

    /**
     * Get the raw font size value (without scaling)
     * @returns {number} Raw font size value
     */
    const getRawFontSize = (): number => {
        return verseFontSize;
    };

    /**
     * Check if font size is at minimum (12px)
     * @returns {boolean} True if at minimum size
     */
    const isMinFontSize = (): boolean => {
        return verseFontSize <= 12;
    };

    /**
     * Check if font size is at maximum (24px)
     * @returns {boolean} True if at maximum size
     */
    const isMaxFontSize = (): boolean => {
        return verseFontSize >= 24;
    };

    /**
     * Get font size percentage (relative to default 16px)
     * @returns {number} Percentage (e.g., 100 for default, 150 for 24px)
     */
    const getFontSizePercentage = (): number => {
        return Math.round((verseFontSize / 16) * 100);
    };

    /**
     * Get font size label for display
     * @returns {string} Human-readable font size label
     */
    const getFontSizeLabel = (): string => {
        if (verseFontSize <= 12) return 'Small';
        if (verseFontSize <= 16) return 'Medium';
        if (verseFontSize <= 20) return 'Large';
        return 'Extra Large';
    };

    return {
        verseFontSize,
        getVerseFontSize,
        getRawFontSize,
        isMinFontSize,
        isMaxFontSize,
        getFontSizePercentage,
        getFontSizeLabel,
    };
};
