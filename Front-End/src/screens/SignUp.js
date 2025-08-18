import React, { useRef, useEffect } from 'react';
import { View, ImageBackground, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SignUp() {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500, // سرعة الحركة (أبطأ قليلاً ليكون أنعم)
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width] // التحريك من يسار الشاشة ليمينها
  });

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/bg.png')} // ضع صورتك هنا
        style={styles.image}
      >
        {/* طبقة اللمعان */}
        <Animated.View
          style={[
            styles.shimmerWrapper,
            { transform: [{ translateX }] }
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmer}
          />
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // لو فيه فراغات سوداء بالخلفية
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 454, // أبعاد الصورة اللي أرسلتها
    height: 957,
    resizeMode: 'cover',
  },
  shimmerWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%', // عرض اللمعة
  },
  shimmer: {
    flex: 1,
  }
});
