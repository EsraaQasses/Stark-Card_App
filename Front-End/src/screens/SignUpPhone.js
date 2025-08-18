import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, I18nManager, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SignUpPhone() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const isRTL = I18nManager.isRTL;

  const handleContinue = () => {
    console.log('Phone entered:', phone);
    // لاحقاً منضيف التحقق OTP أو الربط مع الباك إند
  };

  return (
    <ImageBackground
      source={require('../assets/bg.png')} // الخلفية تبع Stark
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>
          {isRTL ? 'إنشاء حساب برقم الهاتف' : 'Sign Up with Phone'}
        </Text>
        
        <TextInput
                  style={styles.input}
                  placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                  value={name}
                  onChangeText={setName}
                />

        <TextInput
          style={styles.input}
          placeholder={isRTL ? 'رقم الهاتف' : 'Phone Number'}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
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
             onPress={() => navigation.navigate('ContinuedSignUpPhone')}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
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
    backgroundColor: '#28A745',
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
