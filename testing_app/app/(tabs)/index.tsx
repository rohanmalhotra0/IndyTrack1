import React, { useState } from 'react';
import { Image, TextInput, Text, StyleSheet, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import uuid from 'react-native-uuid';
const USER_ID_KEY = '@user_id';

export default function HomeScreen() {
  const [ticker, setTicker] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState('RSI');
  const [selectedEquality, setEquality] = useState('>');
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

  const handleSubmit = async () => {
    if (!ticker || !value) {
      Alert.alert("Missing Info", "Please fill in all fields before submitting.");
      return;
    }
  
    const notifierSummary = `${ticker} ${selectedEquality} ${value} (${selectedIndicator})`;
  
    try {
      const existingData = await AsyncStorage.getItem('@notifiers');
      const notifiers = existingData ? JSON.parse(existingData) : [];
  
      notifiers.push({
        ticker,
        selectedIndicator,
        selectedEquality,
        value,
        createdAt: new Date().toISOString(),
      });
  
      await AsyncStorage.setItem('@notifiers', JSON.stringify(notifiers));
      Alert.alert("Notifier Saved", notifierSummary);
      exportNotifiers();
    } catch (error) {
      Alert.alert("Error", "Failed to save notifier.");
      console.error("Storage error:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to IndyTrack!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Choose a ticker symbol</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="e.g., AAPL"
          value={ticker}
          onChangeText={setTicker}
        />
        <Text>You typed: {ticker}</Text>

        <ThemedText type="subtitle">Select Indicator</ThemedText>
        <Picker
          selectedValue={selectedIndicator}
          onValueChange={(itemValue) => setSelectedIndicator(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="RSI" value="RSI" />
          <Picker.Item label="MACD" value="MACD" />
          <Picker.Item label="SMA" value="SMA" />
        </Picker>
        <Text>Selected: {selectedIndicator}</Text>

        <ThemedText type="subtitle">Select realtionship</ThemedText>
        <Picker
          selectedValue={selectedEquality}
          onValueChange={(itemValue) => setEquality(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Greater Than (>)" value=">" />
          <Picker.Item label="Less Than (<)" value="<" />
        </Picker>
        <Text>Selected: {selectedEquality}</Text>

        <ThemedText type="subtitle">What value are you assessing</ThemedText>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
        />
        <Text>You typed: {value}</Text>

        <ThemedText>Current notifier: {ticker} {selectedEquality} {value} ({selectedIndicator})</ThemedText>
        <Button title="Submit Notifier" onPress={handleSubmit} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
});