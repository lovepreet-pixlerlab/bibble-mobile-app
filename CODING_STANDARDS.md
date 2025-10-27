# Bibble App - Coding Standards & Best Practices

## 📁 Project Structure

```
bibble_app/
├── app/                          # Expo Router pages
│   ├── (onBoardingStack)/        # Onboarding flow
│   ├── (tabs)/                   # Main app tabs
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   └── ui/                      # Base UI components
├── src/                         # Application source code
│   ├── components/              # Feature-specific components
│   ├── redux/                   # State management
│   │   ├── features/            # Redux slices
│   │   ├── services/            # API services
│   │   └── store.ts             # Store configuration
│   ├── utils/                   # Utility functions
│   └── helper/                  # Helper functions
├── constants/                   # App constants
├── hooks/                       # Custom React hooks
└── assets/                      # Static assets
```

## 🎯 File Naming Conventions

### **Files & Directories**

- **Components**: PascalCase (`UserProfile.tsx`, `LoginForm.tsx`)
- **Pages**: PascalCase (`HomeScreen.tsx`, `SettingsScreen.tsx`)
- **Hooks**: camelCase starting with 'use' (`useAuth.ts`, `useApi.ts`)
- **Utils/Helpers**: camelCase (`apiClient.ts`, `validations.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`, `STORAGE_KEYS.ts`)
- **Types**: PascalCase (`User.ts`, `ApiResponse.ts`)

### **File Extensions**

- **React Components**: `.tsx` (TypeScript + JSX)
- **TypeScript Files**: `.ts`
- **JavaScript Files**: `.js` (only for config files)
- **Style Files**: `.styles.ts` (TypeScript style objects)

## 📝 Code Style Guidelines

### **TypeScript Usage**

- **ALWAYS** use TypeScript for new files
- Define proper interfaces and types
- Use strict type checking
- Avoid `any` type - use proper typing

### **Import Organization**

```typescript
// 1. React and React Native imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import { useDispatch } from 'react-redux';
import { Stack } from 'expo-router';

// 3. Internal imports (absolute paths)
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

// 4. Relative imports (only when necessary)
import './styles';
```

### **Component Structure**

```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component
// 4. Styles
// 5. Export

interface Props {
  title: string;
  onPress: () => void;
}

export default function MyComponent({ title, onPress }: Props) {
  // Component logic
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## 🔧 Redux Best Practices

### **Slice Structure**

```typescript
// features/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
```

## 🎨 Styling Guidelines

### **StyleSheet Usage**

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

### **Theme Integration**

- Use theme colors from `@/constants/theme`
- Support dark/light mode
- Use consistent spacing and typography

## 🚀 Performance Best Practices

### **Component Optimization**

- Use `React.memo` for expensive components
- Implement proper `useCallback` and `useMemo`
- Avoid inline functions in render

### **State Management**

- Keep state as close to where it's used as possible
- Use Redux only for global state
- Implement proper loading and error states

## 📱 React Native Specific

### **Navigation**

- Use Expo Router for navigation
- Implement proper deep linking
- Handle navigation state properly

### **Platform Specific Code**

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
```

## 🧪 Testing Guidelines

### **Test Structure**

- Unit tests for utilities and helpers
- Component tests for UI components
- Integration tests for Redux slices
- E2E tests for critical user flows

## 📦 Dependencies

### **Package Management**

- Use exact versions for critical dependencies
- Regular dependency updates
- Remove unused dependencies
- Use TypeScript types for JavaScript packages

## 🔍 Code Quality

### **Linting & Formatting**

- ESLint for code quality
- Prettier for code formatting
- Pre-commit hooks for quality checks
- Consistent indentation (2 spaces)

### **Error Handling**

```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API Error:', error);
  throw new Error('Failed to fetch data');
}
```

## 📚 Documentation

### **Code Comments**

- Document complex logic
- Use JSDoc for functions
- Keep comments up-to-date
- Avoid obvious comments

### **README Updates**

- Keep README current
- Document setup instructions
- Include contribution guidelines
- Document API changes

## 🚫 Common Anti-Patterns to Avoid

1. **Don't** use `any` type in TypeScript
2. **Don't** mix `.js` and `.tsx` files unnecessarily
3. **Don't** use inline styles for complex styling
4. **Don't** ignore TypeScript errors
5. **Don't** use relative imports when absolute paths are available
6. **Don't** create deeply nested component structures
7. **Don't** ignore performance optimizations
8. **Don't** hardcode values - use constants

## ✅ Checklist for New Features

- [ ] Proper TypeScript types defined
- [ ] Component follows naming conventions
- [ ] Imports are organized correctly
- [ ] Styles are in StyleSheet
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Accessibility considerations
- [ ] Performance optimized
- [ ] Tests written (if applicable)
- [ ] Documentation updated

