// App.js
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from './src/i18n';
import { loadSavedLanguage } from './src/utils/lang';

import FirstPage from './src/screens/FirstPage';
import SignUp from './src/screens/SignUp/SignUp';
import Email from './src/screens/SignUp/Email';
import Phone from './src/screens/SignUp/Phone';
import Extra from './src/screens/SignUp/Extra';
import Login from './src/screens/Login';
import Verification from './src/screens/Verification';
import ForgetPassword from './src/screens/SignUp/ForgetPassword';
import Home from './src/screens/Home';
import Profile from "./src/screens/Profile"; // your figma-style screen
import Menu from './src/screens/Menu';
import Notifications from './src/screens/Notifications';
const Stack = createNativeStackNavigator();

export default function App() {
  const [i18n, setI18n] = useState(initI18n('en'));

  useEffect(() => {
    (async () => {
      const lang = await loadSavedLanguage();   // applies RTL if needed
      setI18n(initI18n(lang));
    })();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="FirstPage"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="FirstPage" component={FirstPage} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Email" component={Email} />
          <Stack.Screen name="Phone" component={Phone} />
          <Stack.Screen name="Extra" component={Extra} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Verification" component={Verification} />
          <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Menu" component={Menu}/>
          <Stack.Screen name="Notifications" component={Notifications} />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}
