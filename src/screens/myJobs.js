import React, { useState, useEffect,useContext } from 'react';
import { StyleSheet, SafeAreaView, FlatList, StatusBar, TouchableOpacity, View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomEmptyCard from '../components/customEmptyCard';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../config/COLORS';
import Font from '../config/Font';
import Modal from "react-native-modal";
import axios from 'axios';
import Moment from 'moment';
import { AuthContext } from '../context/context';

const MyJobs = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [allData, setAllData] = useState('');
    const { signOut } = useContext(AuthContext)
    const [isModalVisible, setModalVisible] = useState(false);
    const [val, setVal] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const toggleModal = (item) => {
        setModalVisible(!isModalVisible);
        setVal(item)
    };

    useEffect(() => {
        getUserDetails();
    }, [])

    const getUserDetails = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let userId = await AsyncStorage.getItem('userId');
        setLoading(true)
        setRefreshing(true)
        const res = await axios.get(`https://propertyupkeepmanagement.com/api/job_status/${userId}`,
            {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${userToken}`
                },
            })
            .then(res => {
                if (res.data) {
                    setLoading(false);
                    setAllData(res.data.job_status);
                    setRefreshing(false)
                } else {
                    alert("Server Error")
                    setLoading(false)
                    setRefreshing(false)
                }
            }
            ).catch(err => {
                signOut();
                setRefreshing(false)
                setLoaing(false)
            }
            )
    }

    return (
        <SafeAreaView style={styles.main}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View >
                {
                    loading ? (
                        <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                            style={{ height: hp('80%'), justifyContent: 'center', alignSelf: 'center' }}
                        />
                    ) : (
                        <FlatList
                            contentContainerStyle={styles.flatView}
                            data={allData}
                            keyExtractor={(item) => item.report_id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getUserDetails} />}
                            renderItem={({ item }) => (
                                <View style={styles.card} >
                                    <View>
                                        <Text style={styles.titleText}>
                                            {item.report_title}
                                        </Text>
                                        {item.video === null ? (
                                            null
                                        ) : (
                                            <TouchableOpacity style={styles.playVideoView} onPress={() => navigation.navigate("Media", { type: item.video })}>
                                                <FontAwesome
                                                    name='play-circle-o'
                                                    size={24}
                                                    color={COLORS.blue}
                                                />
                                                <Text style={styles.playBtn}>
                                                    Play Video
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TouchableOpacity onPress={() => toggleModal(item)}>
                                        <Text style={styles.titleTextOne}>
                                            View Details
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={<CustomEmptyCard title={"No Outstanding Jobs"} />}
                        />
                    )
                }
            </View>
            <Modal
                isVisible={isModalVisible}
                onBackButtonPress={() => setModalVisible(false)}
                onBackdropPress={() => setModalVisible(false)}
            >
                <View style={styles.modalView} >
                    <Text style={styles.titleTextTwo}>
                        {val.report_title}
                    </Text>
                    <View style={styles.rowViewOne}>
                        <Text style={{ width: wp('40%'), fontSize: hp('2%'), fontFamily: Font.bold, color: COLORS.white, marginLeft: wp('2.5%') }}>
                            Contractor Name
                        </Text>
                        <Text style={{ width: wp('44%'), textAlign: 'right', fontSize: hp('1.8%'), fontFamily: Font.medium, color: COLORS.white, marginRight: wp('2.5%') }}>
                            {val.constructor_name}
                        </Text>
                    </View>
                    <View style={styles.rowViewOne}>
                        <Text style={{ width: wp('40%'), fontSize: hp('2%'), fontFamily: Font.bold, color: COLORS.white, marginLeft: wp('2.5%') }}>
                            Date and Time
                        </Text>
                        <Text style={{ width: wp('44%'), textAlign: 'right', fontSize: hp('1.8%'), fontFamily: Font.medium, color: COLORS.white, marginRight: wp('2.5%') }}>
                            {Moment(val.quote_date).format('DD-MM-YYYY')}
                        </Text>
                    </View>
                    <View style={styles.rowViewOne}>
                        <Text style={{ width: wp('40%'), fontSize: hp('2%'), fontFamily: Font.bold, color: COLORS.white, marginLeft: wp('2.5%') }}>
                            Status
                        </Text>
                        <Text style={{ width: wp('44%'), textAlign: 'right', fontSize: hp('1.8%'), fontFamily: Font.medium, color: COLORS.white, marginRight: wp('2.5%') }}>
                            {val.report_status}
                        </Text>
                    </View>
                    <View style={styles.rowViewOne}>
                        <Text style={{ width: wp('40%'), fontSize: hp('2%'), fontFamily: Font.bold, color: COLORS.white, marginLeft: wp('2.5%') }}>
                            Earning
                        </Text>
                        <Text style={{ width: wp('44%'), textAlign: 'right', fontSize: hp('1.8%'), fontFamily: Font.medium, color: COLORS.white, marginRight: wp('2.5%') }}>
                            {val.earning}
                        </Text>
                    </View>
                    <View style={styles.rowViewOne}>
                        <Text style={{ width: wp('40%'), fontSize: hp('2%'), fontFamily: Font.bold, color: COLORS.white, marginLeft: wp('2.5%') }}>
                            Address
                        </Text>
                        <Text style={{ width: wp('44%'), textAlign: 'right', fontSize: hp('1.8%'), fontFamily: Font.medium, color: COLORS.white, marginRight: wp('2.5%') }}>
                            {val.address}
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    main: {
        width: wp('100%'),
        height: hp('100%'),
        backgroundColor: COLORS.white
    },
    headerView: {
        width: wp('100%'),
        height: hp('6%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: COLORS.grayniteGray,
        borderBottomWidth: 0.5
    },
    logoutText: {
        width: wp('25%'),
        paddingLeft: hp('2.5%'),
        fontSize: hp('2%'),
        fontFamily: Font.medium,
        color: COLORS.primary,
    },
    propertyText: {
        width: wp('55%'),
        fontSize: hp('2%'),
        fontFamily: Font.bold,
        color: COLORS.black,
        alignSelf: 'center',
        textAlign: 'center',
        paddingRight: wp('5%'),
    },
    icon: {
        width: wp('10%'),
        alignSelf: 'center',
    },
    rowView: {
        width: wp('90%'),
        alignSelf: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: hp('2%'),
        marginBottom: hp('2%')
    },
    heading: {
        fontSize: hp('2%'),
        fontFamily: Font.bold,
        color: COLORS.primary,
        alignSelf: 'center'
    },
    btn: {
        width: wp('45%'),
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        height: hp('5%'),
        justifyContent: 'center'
    },
    btnText: {
        fontSize: hp('2%'),
        fontFamily: Font.medium,
        color: COLORS.white,
        alignSelf: 'center'
    },
    card: {
        width: wp('90%'),
        alignSelf: 'center',
        borderBottomColor: COLORS.grayniteGray,
        borderBottomWidth: 0.5,
        marginTop: hp('1.5%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    titleText: {
        width: wp('60%'),
        fontSize: hp('2%'),
        fontFamily: Font.bold,
        color: COLORS.black,
        textAlign: 'left',
    },
    titleTextTwo: {
        width: wp('90%'),
        fontSize: hp('2.5%'),
        fontFamily: Font.bold,
        color: COLORS.white,
        textAlign: 'center',
        marginVertical: hp('2%')
    },
    titleTextOne: {
        width: wp('30%'),
        fontSize: hp('2%'),
        fontFamily: Font.medium,
        color: COLORS.primary,
    },
    playVideoView: {
        width: wp('30%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hp('0.5%')
    },
    playBtn: {
        fontSize: hp('2%'),
        fontFamily: Font.medium,
        color: COLORS.blue,
        alignSelf: 'center',
        width: wp('50%'),
        marginLeft: wp('2%')
    },
    additionalHeading: {
        fontFamily: Font.medium,
        fontSize: hp('1.8%'),
        color: COLORS.grayniteGray,
        marginTop: hp('1%'),
        width: wp('60%'),
    },
    notesText: {
        width: wp('60%'),
        textAlign: 'justify',
        fontFamily: Font.regular,
        fontSize: hp('1.6%'),
        color: COLORS.grayniteGray,
        marginBottom: hp('1%'),
    },
    container: {
        flex: 1,
    },
    toolbar: {
        marginTop: 30,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
    },
    mediaPlayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    modalView: {
        height: hp('36%'),
        backgroundColor: COLORS.primary,
        borderRadius: 16,
    },
    rowViewOne: {
        width: wp('90%'),
        alignSelf: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: hp('1%'),
    },
})
export default MyJobs;
