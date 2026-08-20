import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#8A8794"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#141218',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2733',
    marginBottom: 16,
    width: '100%',
  },
});
