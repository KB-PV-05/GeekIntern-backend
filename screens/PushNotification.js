import { 
  getMessaging, 
  getToken, 
  onMessage, 
  setBackgroundMessageHandler, 
  requestPermission 
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// Request notification permission
export async function requestUserPermission() {
  try {
    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging);
    
    const enabled = authStatus === 1 || authStatus === 2; 

    if (enabled) {
      console.log('Notification permission granted.');
      await getFCMToken();
    } else {
      console.log('Notification permission denied.');
    }
  } catch (error) {
    console.log('Error requesting permission:', error);
  }
}

// Get FCM token for the device
export async function getFCMToken() {
  try {
    const messaging = getMessaging();
    const token = await getToken(messaging);
    console.log('FCM Token:', token);
  } catch (error) {
    console.log('Error fetching FCM token:', error);
  }
}

// Handle notifications when the app is in foreground
export async function handleForegroundNotifications() {
  const messaging = getMessaging();
  onMessage(messaging, async remoteMessage => {
    console.log('Foreground Notification:', remoteMessage);
    await displayNotification(remoteMessage.notification);
  });
}

// Display notification
async function displayNotification(notification) {
  if (!notification) return;

  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: notification.title,
    body: notification.body,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
}

// Background and Quit state notification handling
export function setupNotificationListeners() {
  const messaging = getMessaging();
  
  // Handle background messages
  setBackgroundMessageHandler(messaging, async remoteMessage => {
    console.log('Message received in background:', remoteMessage);
    await displayNotification(remoteMessage.notification);
  });
}

// Fix: Handle Notifee background events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Handling background event:', type, detail);

  if (type === EventType.DISMISSED) {
    console.log('Notification dismissed:', detail.notification);
  } else if (type === EventType.PRESS) {
    console.log('Notification pressed:', detail.notification);
  }
});

// Initialize notifications
export function initializeNotifications() {
  requestUserPermission();
  handleForegroundNotifications();
  setupNotificationListeners();
}
