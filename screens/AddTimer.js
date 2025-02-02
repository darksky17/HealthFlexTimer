import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addTimer } from '../redux/timersSlice';  // Import the addTimer action
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper'; // Import radio buttons

const AddTimer = ({ navigation }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState('');
    const [alertAtHalfway, setAlertAtHalfway] = useState(false);
  
    // Handle the "Add Timer" button press
    const handleAddTimer = async () => {
        if (!name || !duration || !category) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
      
        const parsedDuration = parseInt(duration, 10);
        if (isNaN(parsedDuration) || parsedDuration <= 0) {
          Alert.alert('Error', 'Please enter a valid positive number for the duration');
          return;
        }
      
        const newTimer = {
          id: new Date().getTime().toString(),
          name,
          duration: parsedDuration,
          category,
          status: 'Paused',
          remainingTime: parsedDuration,
          originalDuration: parsedDuration,
          alertAtHalfway,
          completed: false,
        };
      
        // Get current timers from AsyncStorage
        try {
          const storedTimers = await AsyncStorage.getItem('timers');
          const existingTimers = storedTimers ? JSON.parse(storedTimers) : [];
      
          // Update AsyncStorage
          const updatedTimers = [...existingTimers, newTimer];
          await AsyncStorage.setItem('timers', JSON.stringify(updatedTimers));
      
          // Dispatch action
          dispatch(addTimer(newTimer));
          navigation.goBack();
        } catch (error) {
          console.error('Error saving timer to AsyncStorage', error);
        }
      };
  
    return (
      <View style={styles.container}>
        <Text>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Timer Name"
        />
        
        <Text>Duration (seconds)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          keyboardType="numeric"
          onChangeText={setDuration}
          placeholder="Timer Duration"
        />
        
        <Text>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Category (e.g., Workout, Study)"
        />
          <Text>Alert at 50% Completion?</Text>
            <View style={styles.radioGroup}>
                <RadioButton.Group
                    onValueChange={value => setAlertAtHalfway(value === 'yes')}
                    value={alertAtHalfway ? 'yes' : 'no'}
                >
                    <View style={styles.radioOption}>
                        <RadioButton value="yes" />
                        <Text>Yes</Text>
                    </View>
                    <View style={styles.radioOption}>
                        <RadioButton value="no" />
                        <Text>No</Text>
                    </View>
                </RadioButton.Group>
            </View>

        
        <Button title="Add Timer" onPress={handleAddTimer} />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginVertical: 10,
      paddingLeft: 8,
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
  });
  
  export default AddTimer;