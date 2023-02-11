import React, { useState, useContext, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, SafeAreaView, FlatList, StatusBar, TouchableOpacity, View, Alert, Text, RefreshControl } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Moment from 'moment';
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
import COLORS from '../config/COLORS';
import Font from '../config/Font';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AuthContext } from '../context/context';
import axios from 'axios';
import { Formik } from 'formik';
import CustomEmptyCard from '../components/customEmptyCard';
import CustomButton from '../components/customButton';
import { QuotevalidationSchema } from '../utils/validation';
import CustomInput from '../components/CustomInput';
import CustomHeading from '../components/CustomHeading';
import DatePicker from 'react-native-date-picker';
import CustomErrorText from '../components/customErrorText'
import CustomLoadingBtn from '../components/customLoadingBtn';

const Home = ({ navigation }) => {
    const [val, setVal] = useState();
    const [Loader, setLoader] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(true);
    const [quoteData, setQuoteData] = useState('');
    var [price, setPrice] = useState('');
    var [note, setNote] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const toggleModal = (item) => {
        setModalVisible(!isModalVisible);
        setVal(item)
    };
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const dateVal = Moment(date).format('DD-MM-YYYY , h:mm:ss a');
    const { signOut } = useContext(AuthContext)
    const [loading, setLoaing] = useState(false);
    const [allData, setAllData] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    // useFocusEffect(
    //     React.useCallback(() => {
    //         getAllReports()
    //     }, [])
    // )
    useEffect(() => {
        getAllReports()
    }, [])

    const getAllReports = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let userId = await AsyncStorage.getItem('userId');
        setLoaing(true)
        setRefreshing(true)
        const res = await axios.get(`https://propertyupkeepmanagement.com/api/reports?user_id=${userId}&user_type=${2}`,
            {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${userToken}`
                },
            })
            .then(res => {
                if (res.status === 200) {
                    setLoaing(false);
                    let data =res?.data?.data;
                    data.sort((a, b) => a.id - b.id);
                    setAllData(data.reverse())
                    console.log(res.data.data)
                    setRefreshing(false)
                } else {
                    setLoaing(false)
                    setRefreshing(false)
                    Alert.alert("Network or server Error",)
                }
            }
            )
            .catch(err => {
                signOut();
                setRefreshing(false)
                setLoaing(false)
            }
            )
    }

    const AddQuote = async (values) => {
        let userToken = await AsyncStorage.getItem('userToken');
        let userId = await AsyncStorage.getItem('userId');
        setLoader(true);
        var myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Authorization", `Bearer ${userToken}`);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`https://propertyupkeepmanagement.com/api/save-quote?price=${values.price}&additional_note=${values.additionalNote}&date=${dateVal}&report_id=${val.id}&user_id=${userId}`, requestOptions)
            .then(res => {
                if (res.status === 404) {
                    Alert.alert("You have already added a quote against this report."),
                        setLoader(false)
                } else {
                    setLoader(false),
                        Alert.alert('Your Quote has Successfully been submitted'),
                        setModalVisible(false)
                }
            })
            .catch(error => console.log('error'));
    }


    const getQuoteData = async (item) => {
        let userToken = await AsyncStorage.getItem('userToken');
        let userId = await AsyncStorage.getItem('userId');
        setQuoteLoading(true)
        const res = await axios.get(`https://propertyupkeepmanagement.com/api/quotes?user_id=${userId}&report_id=${item.id}`,
            {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${userToken}`
                },
            })
            .then(res => {
                if (res.status === 200) {
                    setQuoteLoading(false);
                    setQuoteData(res.data.data)
                    if (res.data.data.length > 0) {
                        setPrice(res.data.data[0].price)
                        setNote(res.data.data[0].additional_note)
                    } else {
                        setPrice('')
                        setNote('')
                    }
                    toggleModal(item)
                } else {
                    setQuoteLoading(false)
                    Alert.alert("Network or server Error",)
                }
            }
            )
            .catch(err => {
                Alert.alert('Network or server Error')
                setQuoteLoading(false)
            }
            )
    }

    return (
        <SafeAreaView style={styles.main}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.headerView}>
                <TouchableOpacity style={{ alignSelf: 'center' }}
                    onPress={signOut}
                >
                    <Text style={styles.logoutText}>
                        Log Out
                    </Text>
                </TouchableOpacity>
                <Text style={styles.propertyText}>
                    Contractors
                </Text>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Profile')}>
                    <FontAwesome
                        name="user-circle-o"
                        size={24}
                        color={COLORS.primary}
                        style={{ alignSelf: 'flex-end', paddingRight: wp('2.5%') }}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.rowView}>
                <Text style={styles.heading}>
                    Reported issues
                </Text>
                <TouchableOpacity onPress={getAllReports}>
                    <FontAwesome
                        name="refresh"
                        size={24}
                        style={{ alignSelf: 'center' }}
                        color={COLORS.primary}
                    />
                </TouchableOpacity>
            </View>
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
                            showsVerticalScrollIndicator={false}
                            style={{ marginBottom: hp('24%'), }}
                            data={allData}
                            keyExtractor={(item) => item.id.toString()}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={getAllReports} />}
                            renderItem={({ item, index }) => (
                                <View style={styles.card} >
                                    <View style={styles.rowView}>
                                        <Text style={styles.titleText}>
                                            {item.title}
                                        </Text>
                                        <TouchableOpacity style={styles.quoteBtn} onPress={() => getQuoteData(item)} >
                                            <Text style={styles.quoteBtnText}>
                                                {'Quote'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.text}>
                                        {`Reported on: ${Moment(item.date).format('DD-MM-YYYY , h:mm:ss a')}`}
                                    </Text>
                                    <TouchableOpacity style={styles.playVideoView}
                                        onPress={() => navigation.navigate("MediaOne", { type: item })}
                                    >
                                        <FontAwesome
                                            name='play-circle-o'
                                            size={24}
                                            color={COLORS.blue}
                                        />
                                        <Text style={styles.playBtn}>
                                            Play Video
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.additionalHeading}>
                                        Additional Notes:
                                    </Text>
                                    <Text style={styles.notesText}>
                                        {item.additional_note}
                                    </Text>
                                </View>
                            )}
                            ListEmptyComponent={<CustomEmptyCard title={"Sorry No reported issue found"} />}
                        />
                    )
                }
                <Modal
                    isVisible={isModalVisible}
                    onBackButtonPress={() => setModalVisible(false)}
                    onBackdropPress={() => setModalVisible(false)}
                >
                    <Formik
                        initialValues={{ price: price, additionalNote: note }}
                        validateOnMount={true}
                        onSubmit={AddQuote}
                        validationSchema={QuotevalidationSchema}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
                            <View style={styles.modalView}>
                                <CustomHeading
                                    title={"Enter Quote"}
                                    style={{ color: COLORS.primary, marginTop: hp('2%') }}
                                />
                                <View style={styles.emailInput}>
                                    <CustomInput
                                        title="Enter price"
                                        placeholder="Enter price"
                                        keyboardType="numeric"
                                        onChangeText={handleChange('price')}
                                        onBlur={handleBlur('price')}
                                        defaultValue={values.price}
                                    />
                                    {(errors.price && touched.price) &&
                                        <CustomErrorText title={errors.price} />
                                    }
                                </View>
                                <View >
                                    <Text style={styles.headingText}>
                                        {"Select Date Time"}
                                    </Text>
                                    <TouchableOpacity style={styles.dateView} onPress={() => setOpen(true)}>
                                        <View style={{ width: wp('40%'), alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginLeft: wp('2%') }}>
                                            <FontAwesome
                                                name="calendar"
                                                size={24}
                                                color={COLORS.primary}
                                                style={{ alignSelf: 'center', }}
                                            />
                                            <Text style={styles.dateText}>
                                                Select Date Time
                                            </Text>
                                        </View>
                                        
                                    </TouchableOpacity>
                                    <Text style={styles.dateTextOne}>
                                            {dateVal}
                                        </Text>
                                    <DatePicker
                                        modal
                                        mode='datetime'
                                        open={open}
                                        date={date}
                                        onConfirm={(date) => {
                                            setOpen(false)
                                            setDate(date)
                                        }}
                                        onCancel={() => {
                                            setOpen(false)
                                        }}
                                    />
                                </View>
                                <View style={styles.passwordInput}>
                                    <CustomInput
                                        style={{ height: hp('20%') }}
                                        title="Additional Notes"
                                        multiline={true}
                                        placeholder="Enter Additional Notes"
                                        keyboardType="default"
                                        onChangeText={handleChange('additionalNote')}
                                        onBlur={handleBlur('additionalNote')}
                                        defaultValue={values.additionalNote}
                                        numberOfLines={5}
                                    />
                                </View>
                                {
                                    Loader ? (
                                        <CustomLoadingBtn
                                            color={COLORS.white}
                                            style={styles.btn}
                                        />
                                    ) : (
                                        <CustomButton
                                            onPress={handleSubmit}
                                            title="Send"
                                            style={styles.btn}
                                        />
                                    )
                                }
                            </View>
                        )}
                    </Formik>
                </Modal>
            </View>
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
        alignItems: 'center'
    },
    heading: {
        fontSize: hp('2%'),
        fontFamily: Font.bold,
        color: COLORS.primary,
        alignSelf: 'center',
        textAlign: 'left',
        marginVertical: hp('2%')
    },
    btn: {
        width: wp('45%'),
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        height: hp('6%'),
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
        marginTop: hp('1.5%')
    },
    titleText: {
        width: wp('68%'),
        alignSelf: 'center',
        fontSize: hp('2%'),
        fontFamily: Font.bold,
        color: COLORS.black,
        textAlign: 'left'
    },
    playVideoView: {
        width: wp('30%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    playBtn: {
        fontSize: hp('2%'),
        fontFamily: Font.medium,
        color: COLORS.blue,
        alignSelf: 'center'
    },
    additionalHeading: {
        fontFamily: Font.medium,
        fontSize: hp('1.8%'),
        color: COLORS.grayniteGray,
        marginTop: hp('1%')
    },
    notesText: {
        width: wp('90%'),
        textAlign: 'justify',
        fontFamily: Font.regular,
        fontSize: hp('1.6%'),
        color: COLORS.grayniteGray,
        marginBottom: hp('1%')
    },
    text: {
        fontFamily: Font.regular,
        fontSize: hp('1.8%'),
        color: COLORS.grayniteGray,
        width: wp('90%'),
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
    quoteBtnText: {
        fontSize: hp('1.8%'),
        alignSelf: 'center',
        fontFamily: Font.bold,
        color: COLORS.white
    },
    quoteBtn: {
        width: wp('20%'),
        height: hp('4%'),
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        borderRadius: 100
    },
    modalView: {
        height: hp('70%'),
        backgroundColor: COLORS.white,
        borderRadius: 16,
    },
    emailInput: {
        marginTop: hp('1%')
    },
    passwordInput: {
        marginTop: hp('1%')
    },
    dateView: {
        width: wp('85%'),
        height: hp('6%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 8,
        backgroundColor: COLORS.white,
        borderColor: COLORS.grayniteGray,
        borderWidth: 0.5,
        marginTop: hp('1%'),
        marginLeft: wp('2.5%'),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    dateText: {
        fontSize: hp('2%'),
        alignSelf: 'center',
        fontFamily: Font.bold,
        color: COLORS.grayniteGray,
        paddingTop: hp('0.4%'),
    },
    dateTextOne: {
        fontSize: hp('2%'),
        alignSelf: 'flex-end',
        fontFamily: Font.regular,
        color: COLORS.grayniteGray,
        paddingTop: hp('0.4%'),
        paddingRight: wp('5%'),
    },
    headingText: {
        width: wp('85%'),
        alignSelf: 'center',
        fontSize: hp('2%'),
        fontFamily: Font.medium,
        color: COLORS.black,
        marginTop: hp('1%'),
    }
})
export default Home;
