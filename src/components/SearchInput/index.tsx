import { Icons } from '@/src/assets/icons';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import React from 'react';
import {
    Image,
    StyleSheet,
    TextInput,
    View
} from 'react-native';

interface SearchInputProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    onSearch?: () => void;
}

export default function SearchInput({
    placeholder = "Search Bible verse...",
    value,
    onChangeText,
    onSearch
}: SearchInputProps) {

    return (
        <View style={[styles.container,]}>
            <Image source={Icons.activeSearch} style={styles.searchIcon} resizeMode='contain' />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChangeText}
                // onFocus={() => setIsFocused(true)}
                // onBlur={() => setIsFocused(false)}
                onSubmitEditing={onSearch}
                returnKeyType="search"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: scale(25),
        paddingHorizontal: scale(20),
        paddingVertical: scale(15),
        borderWidth: 1,
        borderColor: colors.lightGrey,
        marginHorizontal: scale(20),
        marginTop: scale(20),
        height: scale(50),
    },
    focusedContainer: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        width: scale(18),
        height: scale(18),
        marginRight: scale(12),
        tintColor: colors.lightGrey,
    },
    input: {
        flex: 1,
        fontSize: scale(16),
        color: '#333',
        height: '100%',
    },
});
