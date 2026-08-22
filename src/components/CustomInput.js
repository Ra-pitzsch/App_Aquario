import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  style,
  ...rest
}) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.multilineInput, style]}
      placeholder={placeholder}
      placeholderTextColor="#8A8794"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
      {...rest}
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
  multilineInput: {
    minHeight: 110,
    paddingTop: 14,
  },
});

