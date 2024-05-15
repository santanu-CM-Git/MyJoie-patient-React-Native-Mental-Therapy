import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { chatImg, forwordImg } from '../utils/Images';

export default function CustomButton({ label, onPress, buttonIcon, buttonColor }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonColor == 'red' ? styles.buttonViewRed : buttonColor == 'gray' ? styles.buttonViewGray : buttonColor == 'small' ? styles.buttonViewSmall : styles.buttonView}>

      <Text
        style={buttonColor == 'red' ? styles.buttonTextRed : styles.buttonText}>
        {label}
      </Text>
      {buttonIcon ? <Image source={forwordImg} style={styles.iconImage} tintColor={'#FFF'} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonView: {
    backgroundColor: '#ECFCFA',
    borderColor: '#87ADA8',
    borderWidth: 1,
    padding: 17,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewSmall: {
    backgroundColor: '#ECFCFA',
    borderColor: '#87ADA8',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewRed: {
    backgroundColor: '#FFF',
    borderColor: '#E3E3E3',
    borderWidth: 1,
    padding: 17,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewGray: {
    backgroundColor: '#FFF',
    borderColor: '#E3E3E3',
    borderWidth: 1,
    padding: 17,
    borderRadius: 8,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: {
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#2D2D2D',
  },
  buttonTextRed: {
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    color: '#2D2D2D',
  },
  iconImage: {
    width: 23,
    height: 23,
    marginLeft: 5
  }
})
