import React from 'react';
import { StyleSheet, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import COLORS from '../config/COLORS';
import Font from '../config/Font';
import Home from '../screens/home';
import MyJobs from '../screens/myJobs';
const Tab = createBottomTabNavigator();

const BottomNavigation = () => {
    return (

        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                tabBarHideOnKeyboard: true,
                backgroundColor: 'transparent',
                tabBarActiveTintColor: COLORS.white,
                tabBarInactiveTintColor: COLORS.black,
                tabBarStyle: { backgroundColor: COLORS.white },
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontSize: hp('3.5%'),
                    fontFamily: Font.medium,
                    color: COLORS.white,
                },
                headerBackgroundContainerStyle: { backgroundColor: COLORS.background },
                headerStyle: {
                    backgroundColor: COLORS.primary, height: hp('8%'),
                },
                tabBarStyle: { backgroundColor: COLORS.primary, height: hp('9%'), overflow: 'hidden', position: 'absolute', left: 0, bottom: 0, right: 0, padding: 5, },
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <MaterialCommunityIcons name="home" color={color} size={32} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="My Jobs"
                component={MyJobs}
                options={{
                    headerShown: true,
                    headerStyle:{height:100,backgroundColor: COLORS.primary},
                    tabBarShowLabel: false,
                    tabBarLabel: 'My Jobs',
                    tabBarIcon: ({ color, size }) => (
                        <View >
                            <MaterialIcons name="work" color={color} size={32} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
const styles = StyleSheet.create({
    img: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        height: hp('6%'),
        width: wp('12.5%'),
        backgroundColor: COLORS.white,
        borderRadius: 100,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 10,
    },
})
export default BottomNavigation