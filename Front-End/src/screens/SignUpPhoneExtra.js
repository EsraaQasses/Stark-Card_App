import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, I18nManager, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';

export default function SignUpPhoneExtra() {
  const navigation = useNavigation();
  const isRTL = I18nManager.isRTL;

  const [country, setCountry] = useState(null);
  const [currency, setCurrency] = useState(null);

  const countries = [
    { label: isRTL ? 'سوريا' : 'Syria', value: 'SY' },
    { label: isRTL ? 'لبنان' : 'Lebanon', value: 'LB' },
    { label: isRTL ? 'الأردن' : 'Jordan', value: 'JO' },
    { label: isRTL ? 'تركيا' : 'Turkey', value: 'TR' },
  ];

  const currencies = [
    { label: isRTL ? 'دولار أمريكي' : 'US Dollar', value: 'USD' },
    { label: isRTL ? 'ليرة سورية' : 'Syrian Pound', value: 'SYP' }
  ];

  return (
    <ImageBackground source={require('../assets/bg.png')} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>
          {isRTL ? 'إكمال التسجيل' : 'Continue Sign Up'}
        </Text>

        {/* Country */}
        <Dropdown
          style={styles.dropdown}
          data={countries}
          labelField="label"
          valueField="value"
          placeholder={isRTL ? 'اختر البلد' : 'Select Country'}
          value={country}
          onChange={item => setCountry(item)}
        />

        {/* Currency */}
        <Dropdown
          style={styles.dropdown}
          data={currencies}
          labelField="label"
          valueField="value"
          placeholder={isRTL ? 'اختر العملة' : 'Select Currency'}
          value={currency}
          onChange={item => setCurrency(item)}
        />

        <TouchableOpacity style={styles.button} onPress={() => console.log({ country, currency })}>
          <Text style={styles.buttonText}>{isRTL ? 'متابعة' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, color: '#fff', textAlign: 'center', marginBottom: 20 },
  dropdown: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, paddingHorizontal: 10 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 }
});
