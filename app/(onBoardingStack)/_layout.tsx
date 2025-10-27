import { Stack } from 'expo-router';

const OnBoardingStackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="language" options={{ headerShown: false }} />
      <Stack.Screen name="plan" options={{ headerShown: false }} />
    </Stack>
  );
};

export default OnBoardingStackLayout;
