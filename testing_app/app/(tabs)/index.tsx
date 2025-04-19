import React, { useState } from 'react';
import { Image, TextInput, Text, StyleSheet, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [ticker, setTicker] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState('RSI');
  const [selectedEquality, setEquality] = useState('>');
  const [value, setValue] = useState('');
  const handleSubmit = () => {
    if (!ticker || !value) {
      Alert.alert("Missing Info", "Please fill in all fields before submitting.");
      return;
    }
  
    const notifierSummary = `${ticker} ${selectedEquality} ${value} (${selectedIndicator})`;
  
    // For now, just alert it — you could also save it to state, AsyncStorage, or send it somewhere
    Alert.alert("Notifier Saved", notifierSummary);
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