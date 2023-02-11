import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as Animatable from 'react-native-animatable';
import COLORS from '../config/COLORS';
import animation from '../config/animation';
import Font from '../config/Font';
const CustomDropDown = (props) => {
    return (
        // <MultiSelect
        //     selectedTextStyle={styles.selectedTextStyle}
        //     style={styles.dropdown}
        //     containerStyle={styles.shadow}
        //     iconStyle={{ marginRight: wp('2%'), height: hp('3%') }}
        //     selectedTextStyle={styles.dropdownText}
        //     placeholderStyle={styles.dropdownText}
        //     inputSearchStyle={styles.dropdownSearchText}
        //     maxHeight={hp('40%')}
        //     dropdownPosition="auto"
        //     labelField="label"
        //     valueField="value"
        //     textError={props.textError}
        //     searchPlaceholder={props.searchPlaceholder}
        //     placeholder={props.placeholder}
        //     data={props.data}
        //     value={props.value}
        //     onChange={props.onChange}
        //     renderItem={props.renderItem}
        //     selectedStyle={styles.selectedStyle}
        // // renderLeftIcon={() => (
        // //     <Image style={styles.icon} source={require('../assets/images/logo.png')} />
        // // )}
        // />
        <View style={styles.container}>
            <MultiSelect
                style={styles.dropdown}
                placeholderStyle={styles.dropdownText}
                selectedTextStyle={styles.dropdownText}
                inputSearchStyle={styles.dropdownSearchText}
                iconStyle={{ marginRight: wp('2%'), height: hp('3%') }}
                search
                data={props.data}
                labelField="label"
                valueField="value"
                placeholder={props.placeholder}
                searchPlaceholder="Search..."
                value={props.value}
                onChange={props.onChange}
                renderLeftIcon={() => (
                    <AntDesign
                        style={styles.icon}
                        color="black"
                        name="Safety"
                        size={20}
                    />
                )}
                selectedStyle={styles.selectedStyle}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    dropdown: {
        width: wp('85%'),
        height: hp('6%'),
        alignSelf: "center",
        borderRadius: 8,
        backgroundColor: COLORS.white,
        borderColor: COLORS.grayniteGray,
        borderWidth: 0.5,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    shadow: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
    },
    dropdownText: {
        fontSize: hp('2%'),
        fontFamily: Font.regular,
        color: COLORS.black,
        paddingLeft: wp('5%')
    },
    dropdownSearchText: {
        fontSize: hp('2%'),
        fontFamily: Font.regular,
        color: COLORS.black,
    },
    icon: {
        marginLeft: wp('2%'),
    },
    selectedStyle: {
        borderRadius: 12,
        alignSelf: 'center',
        marginTop: hp('3%')
    },
    container: {
        width: wp('85%'),
        alignSelf: 'center',
    }
})
export default CustomDropDown;
