import React, { useEffect } from 'react';
import { View, StyleSheet, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function FirstPage({ navigation }) {

  useEffect(() => {
    const checkUser = async () => {
      const timer = setTimeout(async () => {
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          if (userToken) {
            navigation.replace('Login'); // أو 'Home'
          } else {
            navigation.replace('SignUp');
          }
        } catch (e) {
          console.log('Error reading token', e);
          navigation.replace('SignUp');
        }
      }, 10000);

      return () => clearTimeout(timer);
    };

    checkUser();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/bg.png')} // خلفية ستارك
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Image
          source={require('../assets/Logo.png')} // لوغو ستارك
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  logo: {
    width: 1000,  // حجم اللوغو
    height: 250
  }
});
