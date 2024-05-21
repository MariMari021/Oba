import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [produtosAdicionados, setProdutosAdicionados] = useState([]);

  useEffect(() => {
    const initializeAnonymousUser = async () => {
      let anonymousId = await AsyncStorage.getItem('anonymousId');
      if (!anonymousId) {
        anonymousId = uuidv4();
        await AsyncStorage.setItem('anonymousId', anonymousId);
      }
      setUserId(anonymousId);
    };

    if (!userId) {
      initializeAnonymousUser();
    }
  }, [userId]);

  const saveProdutos = async (produtos) => {
    try {
      await AsyncStorage.setItem(`produtos_${userId}`, JSON.stringify(produtos));
      setProdutosAdicionados(produtos);
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out from UserContext...');
      await saveProdutos([]); // Save empty products list
      setUserId(null);
      setIsAnonymous(true);
      setProdutosAdicionados([]); // Clear the products
      await AsyncStorage.removeItem('anonymousId');
      console.log('Logged out from UserContext successfully');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, isAnonymous, setIsAnonymous, logout, produtosAdicionados, setProdutosAdicionados }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

