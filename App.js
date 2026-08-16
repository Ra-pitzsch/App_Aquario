import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import ListScreen from './src/screens/ListScreen';

export default function App() {
  const [tela, setTela] = useState('Login');
 
  const navigation = {
    navigate: (nome) => setTela(nome),
  };
 
  if (tela === 'Lista') {
    return <ListScreen navigation={navigation} />;
  }
  return <LoginScreen navigation={navigation} />;
}