import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import HomeScreen from './screens/HomeScreen';
import AddTimer from './screens/AddTimer';
import HistoryScreen from './screens/HistoryScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTimers } from './redux/timersSlice';
const Stack = createNativeStackNavigator();

const AppContent = () => {
  const dispatch = useDispatch();

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage has been cleared!');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  // Load timers from AsyncStorage on app startup
  const loadTimersFromAsyncStorage = async () => {
    try {
      const storedTimers = await AsyncStorage.getItem('timers');
      const parsedTimers = storedTimers ? JSON.parse(storedTimers) : [];

      // Ensure that timers are an array
      if (!Array.isArray(parsedTimers)) {
        console.warn('AsyncStorage data is corrupted, resetting timers');
        await AsyncStorage.setItem('timers', JSON.stringify([])); // Reset to empty array
        dispatch(setTimers([]));
      } else {
        dispatch(setTimers(parsedTimers));
      }
    } catch (error) {
      console.error('Failed to load timers from AsyncStorage', error);
      dispatch(setTimers([])); // Initialize as empty array if there's an error
    }
  };

  // Load timers when the app starts
  useEffect(() => {
    
    loadTimersFromAsyncStorage();
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTimer" component={AddTimer} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;