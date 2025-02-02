import PushNotification from 'react-native-push-notification';

PushNotification.createChannel(
  {
    channelId: 'timer-alerts', // Unique channel ID
    channelName: 'Timer Alerts', 
    importance: 4, // High importance for notifications
    vibrate: true,
  },
  (created) => console.log(`Notification channel created: ${created}`)
);

export const sendNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'timer-alerts',
    title: title,
    message: message,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    vibrate: true,
  });
};