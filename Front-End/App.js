import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FirstPage from './src/screens/FirstPage';
import SignUp from './src/screens/SignUp';
import SignUpEmail from './src/screens/SignUpEmail';
import SignUpPhone from './src/screens/SignUpPhone';
import SignUpEmailExtra from './src/screens/SignUpEmailExtra';
import SignUpPhoneExtra from './src/screens/SignUpPhoneExtra';
import Login from './src/screens/Login';
import Verification from './src/screens/Verification';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="FirstPage" component={FirstPage} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="SignUpEmail" component={SignUpEmail} />
        <Stack.Screen name="SignUpPhone" component={SignUpPhone} />
        <Stack.Screen name="SignUpEmailExtra" component={SignUpEmailExtra} />
        <Stack.Screen name="SignUpPhoneExtra" component={SignUpPhoneExtra} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
