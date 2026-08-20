import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AuthLink({ text, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  text: {
    color: '#E63950',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
