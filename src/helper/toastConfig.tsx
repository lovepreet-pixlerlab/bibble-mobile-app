// src/toastConfig.ts
import { ViewStyle } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

const baseStyle: ViewStyle = {
  borderLeftWidth: 6,
  borderRadius: 8,
  paddingHorizontal: 10,
};

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: 'green',
        backgroundColor: '#e6ffed',
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#276749',
      }}
      text2Style={{
        fontSize: 14,
        color: '#276749',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: 'red',
        backgroundColor: '#ffe6e6',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#9b1c1c',
      }}
      text2Style={{
        fontSize: 14,
        color: '#9b1c1c',
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: '#2b6cb0',
        backgroundColor: '#ebf8ff',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2b6cb0',
      }}
      text2Style={{
        fontSize: 14,
        color: '#2b6cb0',
      }}
    />
  ),
};
