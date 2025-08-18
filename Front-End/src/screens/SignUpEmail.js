import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, I18nManager, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SignUpEmail() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isRTL = I18nManager.isRTL;

  const handleSignUp = () => {
    console.log('Sign up with:', { name, email, password });
    // لاحقاً منربط مع الباك إند
  };

  return (
    <ImageBackground
      source={require('../assets/bg.png')} // حط صورة الخلفية تبع Stark هون
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>{isRTL ? 'إنشاء حساب' : 'Sign Up With Email'}</Text>

        <TextInput
          style={styles.input}
          placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder={isRTL ? 'كلمة المرور' : 'Password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SignUpEmailExtra')}
        >
         <Text style={styles.buttonText}>
            {isRTL ? 'متابعة' : 'Continue'}
         </Text>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>{isRTL ? 'رجوع' : 'Back'}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // شفافية خفيفة فوق الخلفية
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  back: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 15,
  },
});
