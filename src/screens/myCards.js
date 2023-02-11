import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity, Alert, View, ImageBackground, I18nManager } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import QRCode from 'react-native-qrcode-svg';
import RBSheet from "react-native-raw-bottom-sheet";
import Modal from "react-native-modal";
import Share from 'react-native-share';
import VCard from 'vcard-creator';
import rnfs from 'react-native-fs';
import { Formik } from 'formik';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import COLORS from '../config/COLORS';
import animation from '../config/animation';
import Font from '../config/Font';
import CustomHeading from '../components/customHeading';
import CustomEmptyCard from '../components/customEmptyCard';
import CustomIndicator from '../components/customIndicator';
import CustomScreenIndicator from '../components/customScreenIndicator';
import CustomErrorText from '../components/customErrorText';
import CustomInputEmail from '../components/customInputEmail';
import CustomButtonWithoutGradient from '../components/customButtonWithoutGradient';
import { longHeader, appLogo } from '../utils/Constants';
import authApi from '../utils/authApi/authApi';
import { MailValidationSchema } from '../utils/validation';
import I18n from '../I18n';
import { baseURL } from '../utils/authApi/baseURL';

const MyCard = ({ navigation }) => {
    const [Loader, setLoader] = useState(false);
    const [loading, setloading] = useState(false);
    const [mailLoading, setMailLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [allCardsData, setAllCardsData] = useState("");
    const [userNotification, setUserNotification] = useState("");
    const [vcard, setVCard] = useState('');
    const [dltApiVal, setDeleteApiVal] = useState("");
    const [val, setVal] = useState();
    const refRBSheet = useRef();
    let myQRCode = useRef();
    const [isModalVisible, setModalVisible] = useState(false);
    const toggleModal = (item) => {
        setModalVisible(!isModalVisible);
    };
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const deleteToggleModal = (item) => {
        setDeleteModalVisible(!isDeleteModalVisible);
        setDeleteApiVal(item)
    };
    // const admin = require('firebase-admin');

    useFocusEffect(
        React.useCallback(() => {
            allCards()
        }, [deleteCard])
    )

    useEffect(() => {
        getNotification()
        const interval = setInterval(() => getNotification(), 2000)
        return () => {
            clearInterval(interval);
        }
    }, [])

    var myVCard
    const showBottomSheet = (item) => {
        myVCard = new VCard(item);
        refRBSheet.current.open()
        setVal(item)
        console.log('discover', item)
        let name = item.first_name + " " + item.last_name
        let email = item.email
        let mobile_number = item.mobile_number
        let office_address = item.office_address
        let company_name = item.company_name
        let designation = item.designation
        let image = `${baseURL}uploads/${item.img}`
        myVCard.addName(name)
            .addEmail(email)
            .addPhoneNumber(mobile_number)
            .addAddress(office_address)
            .addCompany(company_name)
            .addJobtitle(designation)
            .addPhoto(image)
        console.log(myVCard.toString())
        setVCard(myVCard)
    }

    const ShareVCF = () => {
        Share.open({
            url: `file://${rnfs.ExternalStorageDirectoryPath}/vCard.vcf`,
            message: `${vcard}`,
            subject: `${vcard}`,
            type: 'text/x-vcard',
        });
    };

    const shareQRCode = () => {
        myQRCode.toDataURL((dataURL) => {
            let shareImageBase64 = {
                url: `data:image/png;base64,${dataURL}`,
                title: "React native",
                subject: 'Share Link',
            };
            Share.open(shareImageBase64).catch((error) => console.log(error));
        });
    };
    const url = `file://${rnfs.ExternalStorageDirectoryPath}/vcard.vcf`;
    const message = `${vcard}`;

    const myallCardsData = (allcard_info) => {
        setAllCardsData(allcard_info)
    }

    const deleteCard = async (item) => {
        let userToken = await AsyncStorage.getItem('userToken');
        let id = item.card_id
        setDeleteLoading(true)
        const res = await authApi.get(`api/delete_card/${id}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            },
        }).then(res => {
            if (res.data.status === '200') {
                console.log(res.data)
                setAllCardsData('')
                allCards()
                setDeleteLoading(false)
                setDeleteModalVisible(false)
            } else {
                setDeleteLoading(false)
                setDeleteModalVisible(false)
                Alert.alert("Server or network Error")
            }
        })
    }

    const getNotification = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let user_id = await AsyncStorage.getItem('userId')
        const res = await authApi.get(`api/notification/${user_id}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            },
        }).then(res => {
            if (res.data.status === '200') {
                setUserNotification(res.data)
            } else {
                console.log("Server or network error")
            }
        })
    }

    const allCards = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let userId = await AsyncStorage.getItem('userId')
        setLoader(true);
        const res = await authApi.get(`api/show_card/${userId}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            },
        }).then(res => {
            if (res.data.status === '200') {
                setLoader(false);
                myallCardsData(res.data.card_detail)
            } else {
                setLoader(false)
            }
        })
    }

    const ShareCardToGroup = async () => {
        let userToken = await AsyncStorage.getItem('userToken');
        let sender_id = await AsyncStorage.getItem('userId')
        console.log(userToken, sender_id)
        setloading(true);
        const card_id = val.card_id
        const group_name = val.group_name
        const abc = `api/send_received_cards/${card_id}/${group_name}/${sender_id}`
        console.log(abc)
        let title = "EVCard"
        let body = "You have received card"
        const res = await authApi.get(`api/send_received_cards/${card_id}/${group_name}/${sender_id}/${title}/${body}`,
            {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                },
            }).then(res => {
                if (res.data.status === '404') {
                    setloading(false)
                    Alert.alert("Your card have not any group")
                }
                else if (res.data.status === '201') {
                    setloading(false)
                    Alert.alert("You already share this card with all available users")
                }
                else if (res.data.status === '200') {
                    setloading(false)
                    Alert.alert("Card shared successfully")
                    refRBSheet.current.close()
                }
                else {
                    setloading(false)
                    Alert.alert("Network or server Error",)
                }
            })
    }

    const ShareCardToMail = async (values) => {
        let userToken = await AsyncStorage.getItem('userToken');
        let sender_id = await AsyncStorage.getItem('userId')
        setMailLoading(true)
        const res = await authApi.post(`api/share_by_email`, {
            email: values.email,
            sender_id: sender_id,
            card_id: val.card_id,
            body: "You have received card",
            title: "EVCard"

        }, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            },
        }).then(res => {
            if (res.data.status === '200') {
                console.log(res.data.response.fcm_token)
                setMailLoading(false)
                setModalVisible(!isModalVisible)
                Alert.alert("Send Successfully")
                // const message = {
                //     notification: {
                //         title: "EVCard",
                //         body: "You have received a card"
                //     },
                //     tokens: res.data.response.fcm_token
                // }
                // messaging().sendMulticast(message).then(res => {
                //     console.log("send success")
                // }).catch(err => {
                //     console.log(err)
                // })
            } else if (res.data.status === '201') {
                setMailLoading(false)
                setModalVisible(!isModalVisible)
                Alert.alert("User not found")
            }
            else {
                setMailLoading(false)
                Alert.alert("Network or server Error",)
            }
        })
    }

    return (
        <>
            <SafeAreaView style={styles.main}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
                <ImageBackground style={styles.icon}
                    source={longHeader}
                    resizeMode={FastImage.resizeMode.cover}
                >
                    <Animatable.View style={styles.heading}>
                        {
                            I18nManager.isRTL ? (
                                <Animatable.Text style={styles.headingTextArabic}>
                                    {I18n.t('myCardsH')}
                                </Animatable.Text>
                            ) : (
                                <Animatable.Text style={styles.headingText}>
                                    {I18n.t('myCardsH')}
                                </Animatable.Text>
                            )
                        }
                        <TouchableOpacity style={{ justifyContent: 'center', }} onPress={() => navigation.navigate("Notification Screen", { type: userNotification })}>
                            <FontAwesome
                                name='bell'
                                size={26}
                                color={COLORS.white}
                                style={{ alignSelf: "center", marginRight: wp('8%') }}
                            />
                            {
                                userNotification === "" ? (
                                    null
                                ) : userNotification.count === 0 ? (null) : (
                                    <Animatable.View style={{ position: 'absolute', top: hp('-0.5%'), right: wp('6%'), justifyContent: 'center', width: wp('5%'), height: hp('2.5%'), borderRadius: 100, backgroundColor: 'red', }}>
                                        <Animatable.Text style={{ fontSize: hp('1.2%'), fontFamily: Font.medium, color: COLORS.white, textAlign: 'center', paddingTop: hp('0.3%') }}>
                                            {userNotification.count}
                                        </Animatable.Text>
                                    </Animatable.View>
                                )
                            }
                        </TouchableOpacity>
                    </Animatable.View>
                    {
                        Loader ?
                            (
                                <CustomScreenIndicator />
                            ) : (
                                <Animatable.View animation={animation.fade}>
                                    <FlatList
                                        contentContainerStyle={styles.flatView}
                                        data={allCardsData}
                                        keyExtractor={(item) => item.card_id.toString()}
                                        showsVerticalScrollIndicator={false}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate("Card Details", { type: item })} >
                                                <TouchableOpacity style={styles.dltIcon} onPress={() => deleteToggleModal(item)}>
                                                    <MaterialIcons
                                                        name="delete"
                                                        size={20}
                                                        color={COLORS.white}
                                                        style={{ alignSelf: 'center' }}
                                                    />
                                                </TouchableOpacity>
                                                {item.img === null ? (
                                                    <Animatable.View style={styles.imgView}>
                                                        <Animatable.Image
                                                            source={appLogo}
                                                            resizeMode='contain'
                                                            style={styles.imageOne}
                                                        />
                                                    </Animatable.View>
                                                ) : (
                                                    <Animatable.View style={styles.imgView}>
                                                        <Animatable.Image
                                                            source={{ uri: `${baseURL}uploads/${item.img}` }}
                                                            resizeMode='cover'
                                                            style={styles.image}
                                                        />
                                                    </Animatable.View>
                                                )}
                                                {item.first_name && item.last_name ? (
                                                    <Animatable.Text animation={animation.fade} style={styles.nameText}>
                                                        {item.first_name + " " + item.last_name}
                                                    </Animatable.Text>
                                                ) : item.first_name ? (
                                                    <Animatable.Text animation={animation.fade} style={styles.nameText}>
                                                        {item.first_name}
                                                    </Animatable.Text>
                                                )
                                                    : null}
                                                {item.designation === null ? (
                                                    null
                                                ) : (
                                                    <Animatable.Text animation={animation.fade} style={styles.designationText}>
                                                        {item.designation}
                                                    </Animatable.Text>
                                                )}
                                                {item.company_name === null ? (
                                                    null
                                                ) : (<Animatable.Text animation={animation.fade} style={styles.companyText}>
                                                    {item.company_name}
                                                </Animatable.Text>)}
                                                {I18nManager.isRTL ? (
                                                    <Animatable.View animation={animation.fade} style={styles.shareView}>
                                                        <TouchableOpacity style={styles.subRowArabic} onPress={() => navigation.navigate("Edit Card", { type: item })}>
                                                            <Feather
                                                                name="edit"
                                                                size={14}
                                                                color={COLORS.grayniteGray}
                                                                style={{ alignSelf: 'center' }}
                                                            />
                                                            <Animatable.Text animation={animation.fade} style={styles.editBtn}>
                                                                {I18n.t('edit')}
                                                            </Animatable.Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={styles.subRowOneArabic} onPress={() => showBottomSheet(item)}>
                                                            <Ionicons
                                                                name="ios-paper-plane-outline"
                                                                size={14}
                                                                color={COLORS.grayniteGray}
                                                                style={{ alignSelf: 'center' }}
                                                            />
                                                            <Animatable.Text animation={animation.fade} style={styles.editBtn}>
                                                                {I18n.t('share')}
                                                            </Animatable.Text>
                                                        </TouchableOpacity>
                                                    </Animatable.View>
                                                ) : (
                                                    <Animatable.View animation={animation.fade} style={styles.shareView}>
                                                        <TouchableOpacity style={styles.subRow} onPress={() => navigation.navigate("Edit Card", { type: item })}>
                                                            <Feather
                                                                name="edit"
                                                                size={14}
                                                                color={COLORS.grayniteGray}
                                                                style={{ alignSelf: 'center' }}
                                                            />
                                                            <Animatable.Text animation={animation.fade} style={styles.editBtn}>
                                                                {I18n.t('edit')}
                                                            </Animatable.Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={styles.subRowOne} onPress={() => showBottomSheet(item)}>
                                                            <Ionicons
                                                                name="ios-paper-plane-outline"
                                                                size={14}
                                                                color={COLORS.grayniteGray}
                                                                style={{ alignSelf: 'center' }}
                                                            />
                                                            <Animatable.Text animation={animation.fade} style={styles.editBtn}>
                                                                {I18n.t('share')}
                                                            </Animatable.Text>
                                                        </TouchableOpacity>
                                                    </Animatable.View>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                        ListEmptyComponent={<CustomEmptyCard onPress={() => navigation.navigate('Add Card')} />}
                                    />
                                </Animatable.View>
                            )
                    }
                </ImageBackground>
                <RBSheet
                    height={hp('52%')}
                    ref={refRBSheet}
                    closeOnDragDown={true}
                    closeOnPressMask={true}
                    closeOnPressBack={true}
                    customStyles={{
                        container: { borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: COLORS.primary },
                        wrapper: {
                            backgroundColor: "transparent"
                        },
                        draggableIcon: {
                            width: wp('20%'),
                            backgroundColor: COLORS.white
                        }
                    }}
                >
                    <Animatable.View animation={animation.fade}>
                        <TouchableOpacity style={styles.btnView} onPress={shareQRCode}>
                            <Animatable.View animation={animation.fade} style={styles.radioBtn}>
                                <FontAwesome5
                                    name="qrcode"
                                    size={30}
                                    color={COLORS.white}
                                />
                            </Animatable.View>
                            <Animatable.Text animation={animation.fade} style={styles.btnText} >
                                {I18n.t('shareQRCode')}
                            </Animatable.Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnViewTop} onPress={ShareVCF}>
                            <Animatable.View animation={animation.fade} style={styles.radioBtn}>
                                <Ionicons
                                    name="apps"
                                    size={30}
                                    color={COLORS.white}
                                />
                            </Animatable.View>
                            <Animatable.Text animation={animation.fade} style={styles.btnText} >
                                {I18n.t('shareVCFCard')}
                            </Animatable.Text>
                        </TouchableOpacity>
                        {loading ? (
                            <View style={styles.btnViewOne} >
                                <CustomIndicator color={COLORS.white} />
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.btnViewTop} onPress={ShareCardToGroup}>
                                <Animatable.View animation={animation.fade} style={styles.radioBtn}>
                                    <MaterialCommunityIcons
                                        name="account-group"
                                        size={30}
                                        color={COLORS.white}
                                    />
                                </Animatable.View>
                                <Animatable.Text animation={animation.fade} style={styles.btnText} >
                                    {I18n.t('shareToGroup')}
                                </Animatable.Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.btnViewTop} onPress={() => toggleModal(val)} >
                            <Animatable.View animation={animation.fade} style={styles.radioBtn}>
                                <MaterialCommunityIcons
                                    name="email"
                                    size={30}
                                    color={COLORS.white}
                                />
                            </Animatable.View>
                            <Animatable.Text animation={animation.fade} style={styles.btnText} >
                                {I18n.t('shareOnMail')}
                            </Animatable.Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnViewTop} onPress={() => navigation.navigate("Share On Map", { type: val }) & refRBSheet.current.close()}>
                            <Animatable.View animation={animation.fade} style={styles.radioBtn}>
                                <FontAwesome
                                    name="map"
                                    size={30}
                                    color={COLORS.white}
                                />
                            </Animatable.View>
                            <Animatable.Text animation={animation.fade} style={styles.btnText} >
                                {I18n.t('shareOnMap')}
                            </Animatable.Text>
                        </TouchableOpacity>
                    </Animatable.View>
                </RBSheet>
                <Modal
                    isVisible={isModalVisible}
                    onBackButtonPress={() => setModalVisible(false)}
                    onBackdropPress={() => setModalVisible(false)}
                >
                    <Formik
                        initialValues={{ email: '' }}
                        validateOnMount={true}
                        onSubmit={ShareCardToMail}
                        validationSchema={MailValidationSchema}
                        enableReinitialize={true}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isValid }) => (
                            <Animatable.View animation={animation.fade} style={styles.modalView} >
                                <CustomHeading
                                    title={I18n.t('enterEmail')}
                                    style={{ color: COLORS.white, fontSize: hp('2.5%'), }}
                                />
                                <CustomInputEmail
                                    placeholder={I18n.t('emailtitle')}
                                    keyboardType="email-address"
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    defaultValue={values.email}
                                />
                                {(errors.email && touched.email) &&
                                    <CustomErrorText title={errors.email} style={{ color: COLORS.white }} />
                                }
                                {
                                    mailLoading ? (
                                        <View style={styles.loadingBtn}>
                                            <CustomIndicator color={COLORS.white} />
                                        </View>
                                    ) : (
                                        <CustomButtonWithoutGradient
                                            onPress={handleSubmit}
                                            style={styles.sendBtn}
                                            title={I18n.t('send')}
                                        />
                                    )
                                }
                            </Animatable.View>
                        )}
                    </Formik>
                </Modal>
                <Modal
                    isVisible={isDeleteModalVisible}
                    onBackButtonPress={() => setDeleteModalVisible(false)}
                >
                    <Animatable.View animation={animation.fade} style={styles.deleteModalView}>
                        <Animatable.Text animation={animation.fade} style={styles.dltText}>
                            {I18n.t('dltMessage')}
                        </Animatable.Text>
                        <Animatable.View animation={animation.fade} style={styles.rowView}>
                            {
                                deleteLoading ? (
                                    <View style={styles.dltLoadingBtn}>
                                        <CustomIndicator color={COLORS.white} />
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.btn} onPress={() => deleteCard(dltApiVal)} >
                                        <Animatable.Text animation={animation.fade} style={styles.dltBtnText}>
                                            {I18n.t('dlt')}
                                        </Animatable.Text>
                                    </TouchableOpacity>
                                )
                            }
                            <TouchableOpacity style={styles.btn} onPress={() => setDeleteModalVisible(false)}>
                                <Animatable.Text animation={animation.fade} style={styles.dltBtnText}>
                                    {I18n.t('cancel')}
                                </Animatable.Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    </Animatable.View>
                </Modal>
            </SafeAreaView >
            <QRCode
                getRef={(ref) => (myQRCode = ref)}
                value={message ? message : 'NA'}
                size={300}
                color={COLORS.white}
                backgroundColor={COLORS.black}
            />
        </>
    );
};
const styles = StyleSheet.create({
    main: {
        width: wp("100%"),
        height: hp('100%'),
        backgroundColor: COLORS.white,
    },
    icon: {
        width: wp('100%'),
        height: hp('100%'),
    },
    heading: {
        width: wp('100%'),
        marginTop: hp('2%'),
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headingText: {
        width: wp('80%'),
        fontSize: hp('3%'),
        fontFamily: Font.bold,
        alignSelf: "center",
        color: COLORS.white,
        textAlign: 'center',
        paddingLeft: wp('20%'),
    },
    headingTextArabic: {
        width: wp('80%'),
        fontSize: hp('3%'),
        fontFamily: Font.bold,
        alignSelf: "center",
        color: COLORS.white,
        textAlign: 'center',
        paddingRight: wp('12%'),
    },
    flatView: {
        paddingBottom: hp('20%'),
        paddingTop: hp('1%'),
    },
    card: {
        width: wp('90%'),
        alignSelf: 'center',
        marginVertical: hp('1.5%'),
        backgroundColor: COLORS.white,
        borderRadius: 16,
        shadowColor: "#636363",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 10,
    },
    dltIcon: {
        width: wp('8%'),
        height: hp('4'),
        borderRadius: 100,
        backgroundColor: COLORS.gray52,
        position: 'absolute',
        right: wp('4%'),
        top: hp('2%'),
        justifyContent: 'center'
    },
    imgView: {
        width: wp("33%"),
        height: hp('16%'),
        marginTop: hp('2%'),
        marginBottom: hp('1%'),
        alignSelf: 'center',
        borderRadius: 100,
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        shadowColor: "#636363",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        alignSelf: 'center',
        borderRadius: 100,
    },
    imageOne: {
        width: '80%',
        height: '80%',
        alignSelf: 'center',
        borderRadius: 100,
    },
    nameText: {
        fontSize: hp('2.5%'),
        fontFamily: Font.semiBold,
        color: COLORS.primary,
        alignSelf: "center",
    },
    companyText: {
        fontSize: hp('2%'),
        fontFamily: Font.regular,
        color: COLORS.gray52,
        alignSelf: "center",
    },
    designationText: {
        fontSize: hp('2%'),
        fontFamily: Font.regular,
        color: COLORS.primary,
        alignSelf: "center",
    },
    shareView: {
        width: wp('80%'),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp('2%'),
        marginBottom: hp('2%'),
    },
    subRow: {
        width: wp('15%'),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    subRowOne: {
        width: wp('18%'),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    subRowArabic: {
        width: wp('18%'),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    subRowOneArabic: {
        width: wp('16%'),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    editBtn: {
        fontSize: hp('1.6%'),
        fontFamily: Font.regular,
        color: COLORS.grayniteGray,
        alignSelf: "center",
        marginTop: hp('0.5%')
    },
    btnView: {
        width: wp('80%'),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: "flex-start",
        borderRadius: 50,
        backgroundColor: COLORS.dodgerBlue,
        marginVertical: hp('1%'),
        marginTop: hp('4%'),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    btnViewTop: {
        width: wp('80%'),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: "flex-start",
        borderRadius: 50,
        backgroundColor: COLORS.dodgerBlue,
        marginVertical: hp('1%'),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    btnViewOne: {
        width: wp('80%'),
        height: hp('6%'),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: "center",
        borderRadius: 50,
        backgroundColor: COLORS.dodgerBlue,
        marginVertical: hp('1%'),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    radioBtn: {
        paddingLeft: wp('5%'),
        alignSelf: 'center'
    },
    btnText: {
        fontSize: hp('2%'),
        fontFamily: Font.regular,
        color: COLORS.white,
        textAlign: 'center',
        alignSelf: 'center',
        paddingVertical: hp('1.5%'),
        paddingLeft: wp('5%'),
        paddingRight: wp('5%')
    },
    modalView: {
        height: hp('30%'),
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        justifyContent: 'center'
    },
    sendBtn: {
        width: wp('80%'),
        backgroundColor: COLORS.dodgerBlue,
        marginTop: hp('3%'),
        marginBottom: hp('2%')
    },
    loadingBtn: {
        width: wp('80%'),
        height: hp('7%'),
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        backgroundColor: COLORS.dodgerBlue,
        marginTop: hp('3%')
    },
    deleteModalView: {
        height: hp('20%'),
        backgroundColor: COLORS.white,
        borderRadius: 16,
        justifyContent: 'center'
    },
    dltText: {
        fontSize: hp('2%'),
        fontFamily: Font.bold,
        color: COLORS.grayniteGray,
        alignSelf: 'center',
        marginTop: hp('2%')
    },
    rowView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp('2%'),
        width: wp('66%'),
        alignSelf: 'center'
    },
    btn: {
        width: wp('30%'),
        height: hp('6%'),
        backgroundColor: COLORS.primary,
        borderRadius: 100,
        justifyContent: 'center'
    },
    dltBtnText: {
        fontSize: hp('2.5%'),
        fontFamily: Font.bold,
        color: COLORS.white,
        textAlign: 'center'
    },
    dltLoadingBtn: {
        width: wp('30%'),
        height: hp('6%'),
        backgroundColor: COLORS.primary,
        borderRadius: 100,
        justifyContent: 'center'
    }
})
export default MyCard;