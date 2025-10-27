import { colors } from '@/src/constants/Colors';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';

interface RootState {
    global: {
        isLoading: boolean;
    };
}

export default function GlobalLoader() {
    const { isLoading } = useSelector((data: RootState) => data?.global);
    // const dispatch = useDispatch();

    // useEffect(() => {
    //     setDispatch(dispatch);
    // }, [dispatch]);

    return (
        <Modal visible={isLoading} transparent animationType="fade">
            <View style={styles.overlay}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
