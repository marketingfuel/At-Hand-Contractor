import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import COLORS from '../config/COLORS';
import Font from '../config/Font';
const CustomForgotBtn = (props) => {
  return (
    <TouchableOpacity onPress={props.onPress} style={{ alignSelf: 'flex-end' }}>
      <Text style={styles.btnText}>{props.title}</Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  btnText: {
    fontSize: hp('2%'),
    fontFamily: Font.medium,
    color: COLORS.primary,
    alignSelf: 'flex-end',
    marginTop: hp('1.5%'),
    textAlign: 'right',
    marginRight: wp('7.5%'),
  },
});
export default CustomForgotBtn;
