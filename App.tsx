import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native'; 
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import TaskScreen from './screens/TaskScreen';
import ProfileIcon from './screens/ProfileIcon'; 


type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tasks: { user: any }; 
};

const Stack = createStackNavigator<RootStackParamList>(); 

const App = () => {
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
              <ProfileIcon
                user={route.params?.user} 
                onLogout={() => console.log('Logout logic goes here')}
                updateStatus={(status: string) => console.log(`Status updated to: ${status}`)} 
                navigation={navigation} 
              />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
