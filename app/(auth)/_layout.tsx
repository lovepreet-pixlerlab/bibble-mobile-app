import { Stack } from 'expo-router';

const AuthStackLayout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
            <Stack.Screen name="emailVerification" options={{ headerShown: false }} />
            <Stack.Screen name="changePassword" options={{ headerShown: false }} />
            <Stack.Screen name="passwordResetSuccess" options={{ headerShown: false }} />
        </Stack>
    );
};

export default AuthStackLayout;
