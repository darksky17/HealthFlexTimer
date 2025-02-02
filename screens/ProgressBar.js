import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ progress }) => {
  return (
    <View style={styles.progressBar}>
      <View style={[styles.progress, { width: `${progress}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#ddd',
  },
  progress: {
    height: '100%',
    backgroundColor: 'green',
  },
});

export default ProgressBar;