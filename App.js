
import React, { useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { AuthContext } from './src/context/context';
import AppNavigation from './src/navigation/appNavigation';
import AuthNavigation from './src/navigation/authNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';

FontAwesome.loadFont();
Ionicons.loadFont();
MaterialCommunityIcons.loadFont();
MaterialIcons.loadFont();
Feather.loadFont();
AntDesign.loadFont();
const App = () => {

  const initialLoginState = {
    isLoading: true,
    email: null,
    userToken: null,
  }
  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGIN':
        return {
          ...prevState,
          email: action.id,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          email: null,
          userToken: null,
          isLoading: false,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);
  const authContext = useMemo(() => ({
    signIn: async (email, token) => {
      console.log('\n\n signIn', email, token, '\n \n')
      let userToken;
      try {
        await AsyncStorage.setItem('userToken', token)
        await AsyncStorage.setItem('userId', String(email))
      } catch (e) {
        console.log(e)
      }
      dispatch({ type: "LOGIN", id: email, token: token });
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');
      } catch (e) {
        console.log(e)
      }
      dispatch({ type: "LOGOUT" })
    }
  }), []);

  useEffect(() => {
    setTimeout(async () => {
      let userToken;
      userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.log(e)
      }
      console.log("userToken: ", userToken,);
      dispatch({ type: "RETRIEVE_TOKEN", token: userToken });
    }, 0);
  }, []);

  return (
    <AuthContext.Provider value={authContext}>
      {loginState.userToken === null ?
        <AuthNavigation /> :
        <AppNavigation />
      }
    </AuthContext.Provider>
  )
};

const styles = StyleSheet.create({
});

export default App;
