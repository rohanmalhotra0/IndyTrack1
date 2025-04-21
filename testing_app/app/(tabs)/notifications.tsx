import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type Notifier = {
  ticker: string;
  selectedIndicator: string;
  selectedEquality: string;
  value: string;
  createdAt: string;
};

export default function TabTwoScreen() {
  const [notifiers, setNotifiers] = useState<Notifier[]>([]);

  const clearNotifiers = async () => {
    try {
      await AsyncStorage.removeItem('@notifiers');
      setNotifiers([]);
    } catch (e) {
      console.log('Error clearing AsyncStorage:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchNotifiers = async () => {
        try {
          const data = await AsyncStorage.getItem('@notifiers');
          if (data) {
            setNotifiers(JSON.parse(data));
          }
        } catch (e) {
          console.log('Error reading AsyncStorage:', e);
        }
      };
  
      fetchNotifiers();
    }, [])
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFD580', dark: '#3B2F2F' }}
      headerImage={<></>}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Saved Notifiers</ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {notifiers.length === 0 ? (
          <ThemedText>No notifiers saved yet.</ThemedText>
        ) : (
          notifiers.map((item, index) => (
            <View key={index} style={styles.notifierBox}>
              <Text style={styles.ticker}>{item.ticker}</Text>
              <Text>{item.selectedIndicator} {item.selectedEquality} {item.value}</Text>
              <Text style={styles.date}>Saved: {new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.clearButtonContainer}>
      <Text style={styles.clearButton} onPress={clearNotifiers}>
        Clear All Notifiers
      </Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginHorizontal: 12,
  },
  listContainer: {
    paddingHorizontal: 12,
    gap: 10,
  },
  notifierBox: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
  },
  ticker: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  clearButtonContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  clearButton: {
    color: '#d00',
    fontWeight: 'bold',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d00',
    textAlign: 'center',
  },
});