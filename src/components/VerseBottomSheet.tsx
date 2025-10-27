import { Icons } from '@/src/assets/icons';
import { ThemedText } from '@/src/components/themed-text';
import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VerseBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    verseId: string;
    verseText: string;
    verseNumber: number;
    isLiked: boolean;
    onLike: (verseId: string) => void;
    storyTitle?: string;
    chapterTitle?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export const VerseBottomSheet: React.FC<VerseBottomSheetProps> = ({
    visible,
    onClose,
    verseId,
    verseText,
    verseNumber,
    isLiked,
    onLike,
    storyTitle,
    chapterTitle
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const insets = useSafeAreaInsets();

    const handleCopy = async () => {
        try {
            const { Clipboard } = require('react-native');

            // Create enhanced copy text with context information
            let copyText = verseText;

            if (storyTitle || chapterTitle) {
                copyText = '';

                if (storyTitle) {
                    copyText += `${storyTitle}`;
                }

                if (chapterTitle) {
                    copyText += storyTitle ? ` - ${chapterTitle}` : chapterTitle;
                }

                copyText += `\n\nVerse ${verseNumber}:\n${verseText}`;
            } else {
                copyText = `Verse ${verseNumber}:\n${verseText}`;
            }

            await Clipboard.setString(copyText);

            // Change button text to "Copied" for 2 seconds
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (error) {
            console.error('❌ Failed to copy verse:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.bottomSheet}>
                            {/* Handle Bar */}
                            <View style={styles.handleBar} />

                            {/* Header */}
                            <View style={styles.header}>
                                <ThemedText style={styles.verseNumber}>Verse {verseNumber}</ThemedText>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={onClose}
                                >
                                    <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                                </TouchableOpacity>
                            </View>

                            {/* Verse Content */}
                            <ScrollView
                                style={styles.content}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.contentContainer}
                                nestedScrollEnabled={true}
                            >
                                <ThemedText style={styles.verseText}>{verseText}</ThemedText>
                            </ScrollView>

                            {/* Action Buttons */}
                            <View style={[styles.actionsContainer, /* { paddingBottom: insets.bottom } */]}>
                                <TouchableOpacity
                                    style={[styles.actionButton, isLiked && styles.favoriteActive]}
                                    onPress={() => onLike(verseId)}
                                >
                                    <Image
                                        source={isLiked ? Icons.activeLike : Icons.inactiveLike}
                                        style={[styles.actionIcon, isLiked && styles.favoriteIconActive]}
                                    />
                                    <ThemedText style={[styles.actionText, isLiked && styles.favoriteTextActive]}>
                                        {isLiked ? 'Favorited' : 'Favorite'}
                                    </ThemedText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, isCopied && styles.copiedButton]}
                                    onPress={handleCopy}
                                >
                                    <Image
                                        source={Icons.copyIcon}
                                        style={[styles.actionIcon, isCopied && styles.copiedIcon]}
                                    />
                                    <ThemedText style={[styles.actionText, isCopied && styles.copiedText]}>
                                        {isCopied ? 'Copied' : 'Copy'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        maxHeight: screenHeight * 0.8,
        minHeight: screenHeight * 0.4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    handleBar: {
        width: scale(40),
        height: scale(4),
        backgroundColor: colors.textGrey,
        borderRadius: scale(2),
        alignSelf: 'center',
        marginTop: scale(12),
        marginBottom: scale(8),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingBottom: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.secondary,
    },
    verseNumber: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: colors.primary,
    },
    closeButton: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: scale(16),
        color: colors.textGrey,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(20),
    },
    contentContainer: {
        paddingVertical: scale(20),
        paddingBottom: scale(10),
    },
    verseText: {
        fontSize: scale(16),
        lineHeight: scale(24),
        color: colors.textGrey,
        textAlign: 'left',
        flexWrap: 'wrap',
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: scale(20),
        paddingVertical: scale(8),
        backgroundColor: 'transparent',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderRadius: scale(8),
        paddingVertical: scale(12),
        paddingHorizontal: scale(16),
        marginHorizontal: scale(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    favoriteActive: {
        backgroundColor: colors.primary,
    },
    copiedButton: {
        backgroundColor: colors.primary,
    },
    actionIcon: {
        width: scale(20),
        height: scale(20),
        resizeMode: 'contain',
        marginRight: scale(8),
        tintColor: colors.primary,
    },
    favoriteIconActive: {
        tintColor: colors.white,
    },
    copiedIcon: {
        tintColor: colors.white,
    },
    actionText: {
        fontSize: scale(14),
        fontWeight: '500',
        color: colors.primary,
    },
    favoriteTextActive: {
        color: colors.white,
    },
    copiedText: {
        color: colors.white,
    },
});
