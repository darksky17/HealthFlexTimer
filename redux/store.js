import { configureStore } from '@reduxjs/toolkit';
import timersReducer from './timersSlice';

const store = configureStore({
  reducer: {
    timers: timersReducer,
  },
});

export default store;