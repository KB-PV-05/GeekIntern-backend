import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import Toast from 'react-native-toast-message';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import TaskScreen from './screens/TaskScreen';
import ProfileIcon from './screens/ProfileIcon';
import AlertNotification from './screens/AlertNotification';
import {initializeNotifications } from './screens/PushNotification';



// Define types for navigation parameters
type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tasks: { user: any };
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  useEffect(() => {
    initializeNotifications();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen
          name="Tasks"
          component={TaskScreen}
          options={({ route, navigation }) => ({
            title: 'Tasks',
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                <AlertNotification user={route.params?.user} />
                <ProfileIcon
                  user={route.params?.user}
                  onLogout={() => console.log('Logout logic goes here')}
                  updateStatus={(status: string) => console.log(`Status updated to: ${status}`)}
                  navigation={navigation}
                />
              </View>
            ),
          })}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

export default App;
