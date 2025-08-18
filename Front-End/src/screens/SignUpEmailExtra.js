import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, I18nManager, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';

export default function SignUpEmailExtra() {
  const navigation = useNavigation();
  const isRTL = I18nManager.isRTL;

  const [country, setCountry] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [phone, setPhone] = useState('');

  const countries = [
    { label: isRTL ? 'سوريا' : 'Syria', value: 'SY', code: '+963' },
    { label: isRTL ? 'لبنان' : 'Lebanon', value: 'LB', code: '+961' },
    { label: isRTL ? 'الأردن' : 'Jordan', value: 'JO', code: '+962' },
    { label: isRTL ? 'تركيا' : 'Turkey', value: 'TR', code: '+90' },
    // ممكن تضيف باقي الـ 50 دولة
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

        {/* Phone */}
        <View style={styles.phoneContainer}>
          <Text style={styles.code}>{country?.code || '+---'}</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder={isRTL ? 'رقم الهاتف' : 'Phone Number'}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => console.log({ country, currency, phone })}>
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
  phoneContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', paddingHorizontal: 10 },
  code: { fontSize: 16, marginRight: 8 },
  phoneInput: { flex: 1, height: 50 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 }
});
