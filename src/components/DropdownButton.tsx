import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import React, { useRef, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Icons } from '../assets/icons';

interface DropdownOption {
    id: string;
    label: string;
    value: string;
}

interface DropdownButtonProps {
    options: DropdownOption[];
    selectedValue?: string | undefined;
    onSelect: (option: DropdownOption) => void;
    placeholder?: string;
    displayText?: string;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
    options,
    selectedValue,
    onSelect,
    placeholder = 'Select an option',
    displayText
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<View>(null);

    const selectedOption = options.find(option => option.value === selectedValue);
    const buttonText = displayText || (selectedOption ? selectedOption.label : placeholder);

    // Debug logging
    console.log('🔍 DropdownButton Debug:', {
        displayText,
        selectedValue,
        selectedOption: selectedOption?.label,
        placeholder,
        buttonText,
        optionsLength: options.length,
        buttonTextType: typeof buttonText,
        buttonTextLength: buttonText?.length
    });

    const handleSelect = (option: DropdownOption) => {
        onSelect(option);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        console.log('🔍 Toggling dropdown:', !isOpen);
        setIsOpen(!isOpen);
    };
    console.log('buttonText', buttonText);

    return (
        <View style={styles.dropdownWrapper}>
            <TouchableOpacity
                ref={buttonRef}
                style={styles.buttonField}
                onPress={toggleDropdown}
            >
                <Text style={styles.buttonFieldText}>{buttonText || 'No Text'}</Text>
                <Image
                    source={Icons.arrowIcon}
                    style={[
                        styles.buttonFieldIcon,
                        { transform: [{ rotate: isOpen ? '270deg' : '90deg' }] }
                    ]}
                    resizeMode='contain'
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.dropdownContainer}>
                    <ScrollView
                        style={styles.optionsContainer}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionItem,
                                    selectedValue === option.value && styles.selectedOption
                                ]}
                                onPress={() => handleSelect(option)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    selectedValue === option.value && styles.selectedOptionText
                                ]}>
                                    {option.label}
                                </Text>
                                {selectedValue === option.value && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownWrapper: {
        flex: 1,
        zIndex: 1000,
    },
    buttonField: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGrey2,
        borderRadius: scale(8),
        paddingHorizontal: scale(12),
        paddingVertical: scale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        minHeight: scale(40), // Ensure minimum height
    },
    buttonFieldText: {
        fontSize: scale(14),
        color: colors.primary, // Changed to primary color for better visibility
        fontWeight: '600',
    },
    buttonFieldIcon: {
        width: scale(12),
        height: scale(12),
        tintColor: colors.textGrey,
    },
    dropdownContainer: {
        position: 'absolute',
        top: scale(45), // Moved lower - more space from button
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: colors.lightGrey2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1001,
        maxHeight: scale(200),
        marginTop: scale(2), // Increased gap
    },
    optionsContainer: {
        // maxHeight is now handled by dropdownContainer
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingVertical: scale(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey2,
    },
    selectedOption: {
        backgroundColor: colors.primary + '10',
    },
    optionText: {
        fontSize: scale(14),
        color: colors.textGrey,
        fontWeight: '500',
    },
    selectedOptionText: {
        color: colors.primary,
        fontWeight: '600',
    },
    checkmark: {
        fontSize: scale(16),
        color: colors.primary,
        fontWeight: 'bold',
    },
});
