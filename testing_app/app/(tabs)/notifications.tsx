import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import axios from 'axios';
import uuid from 'react-native-uuid';
const USER_ID_KEY = '@user_id';

type Notifier = {
  ticker: string;
  selectedIndicator: string;
  selectedEquality: string;
  value: string;
  createdAt: string;
};

export default function TabTwoScreen() {
  const [notifiers, setNotifiers] = useState<Notifier[]>([]);
  const [value, setValue] = useState('');

  const getOrCreateUserId = async (): Promise<string> => {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = uuid.v4().toString();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  };
  
  
  const exportNotifiers = async () => {
    try {
      const existingData = await AsyncStorage.getItem('@notifiers');
      const userId = await getOrCreateUserId();
  
      const dataToSend = {
        userId,
        notifiers: existingData ? JSON.parse(existingData) : [],
      };
  
      const res = await axios.post(
        'http://localhost:5000/process-data',
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      setValue(res.data.status);
    } catch (error) {
      console.error('Error sending data', error);
      setValue('Error sending data');
    }
  };

  const clearNotifiers = async () => {
    try {
      await AsyncStorage.removeItem('@notifiers');
      setNotifiers([]);
    } catch (e) {
      console.log('Error clearing AsyncStorage:', e);
    }
    exportNotifiers();
  };

  const deleteNotifier = async (indexToDelete: number) => {
    try {
      const updatedNotifiers = [...notifiers];
      updatedNotifiers.splice(indexToDelete, 1);
      setNotifiers(updatedNotifiers);
      await AsyncStorage.setItem('@notifiers', JSON.stringify(updatedNotifiers));
    } catch (e) {
      console.log('Error deleting notifier:', e);
    }
    exportNotifiers();
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
              <Text style={styles.deleteButton} onPress={() => deleteNotifier(index)}>
                Delete
              </Text>
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
  deleteButton: {
    marginTop: 8,
    color: '#d00',
    fontWeight: 'bold',
  },
});