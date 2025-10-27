import { Tabs } from 'expo-router';
import React from 'react';

import { Icons } from '@/src/assets/icons';
import { HapticTab } from '@/src/components/haptic-tab';

import { colors } from '@/src/constants/Colors';
import { scale } from '@/src/constants/responsive';
import { Image, Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? scale(70) : scale(60),
          paddingTop: scale(10),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
              <Image
                source={focused ? Icons.activeHome : Icons.inactiveHome}
                style={styles.icon}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
              <Image
                source={focused ? Icons.activeSearch : Icons.inactiveSearch}
                style={styles.icon}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="like"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
              <Image
                source={focused ? Icons.activeLike : Icons.inactiveLike}
                style={styles.icon}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.inactiveIconContainer}>
              <Image
                source={focused ? Icons.activeSetting : Icons.inactiveSetting}
                style={styles.icon}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    width: scale(45),
    height: scale(45),
    padding: scale(10),
    borderRadius: scale(70),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveIconContainer: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: scale(18),
    height: scale(18),
    resizeMode: 'contain',
  },
});