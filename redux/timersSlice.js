import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  timers: [],
  history: [],
};

export const timersSlice = createSlice({
  name: 'timers',
  initialState,
  reducers: {
    setTimers: (state, action) => {
      state.timers = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;  // Load history from AsyncStorage
    },
    addTimer: (state, action) => {
      state.timers.push(action.payload);
    },
    updateTimerStatus: (state, action) => {
      const { id, status } = action.payload;
      const timer = state.timers.find((timer) => timer.id === id);
      if (timer) {
        timer.status = status;
      }
    },
    updateRemainingTime: (state, action) => {
      const { id, remainingTime } = action.payload;
      const timer = state.timers.find((timer) => timer.id === id);
      if (timer) {
        timer.remainingTime = remainingTime;
     
      }
    },
    markTimerAsCompleted: (state, action) => {
      const { id } = action.payload;
      const timer = state.timers.find((timer) => timer.id === id);
      if (timer) {
        timer.status = 'Completed';
        timer.remainingTime = 0;
        state.history.push({ ...timer, completedAt: Date.now() }); // Use timestamp
      }
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const {
  setTimers,
  setHistory,
  addTimer,
  updateTimerStatus,
  updateRemainingTime,
  resetTimer,
  markTimerAsCompleted,
  clearHistory,
} = timersSlice.actions;

export default timersSlice.reducer;