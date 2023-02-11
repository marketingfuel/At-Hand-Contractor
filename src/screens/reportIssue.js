import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, View, ScrollView, Alert, NativeModules } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import * as Animatable from 'react-native-animatable';
import COLORS from '../config/COLORS';
import animation from '../config/animation';
import Font from '../config/Font';
import { Formik } from 'formik';
import CustomInput from '../components/CustomInput';
import CustomErrorText from '../components/customErrorText';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../components/customButton';
import { ReportIssueValidation } from '../utils/validation';
import CustomLoadingBtn from '../components/customLoadingBtn';

const ReportIssue = ({ navigation }) => {
    const [vid, setVid] = useState(null);
    const [Loader, setLoader] = useState(false)

    const selectVideo = async () => {
        ImagePicker.launchImageLibrary({ mediaType: 'video', includeBase64: true, }, (response) => {
            if (response.didCancel) {
                console.log("user cancel image picker")
            } else {
                console.log(response.assets[0]);
                setVid(response.assets[0])
            }
        })
    }

    const RecordVideo = async () => {
        ImagePicker.launchCamera({ mediaType: 'video', includeBase64: true }, (response) => {
            if (response.didCancel) {
                console.log("user cancel image picker")
            } else {
                setVid(response.assets[0])
            }
        })
    }

    var ReportIssue = async (values, { resetForm }) => {
        let userToken = await AsyncStorage.getItem('userToken');
        let userId = await AsyncStorage.getItem('userId');
        setLoader(true);
        var myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Authorization", `Bearer ${userToken}`);
        myHeaders.append('Content-Type', 'multipart/form-data');

        var formdata = new FormData();
        formdata.append('file',
            {
                uri: vid.uri,
                name: vid.fileName,
                type: vid.type,
            });
        formdata.append("title", values.title);
        formdata.append("user_id", userId);
        formdata.append("additional_note", values.additionalNote);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
            redirect: 'follow'
        };
        fetch("https://propertyunkeeptest.marketingfuel.org/api/save-report", requestOptions)
            .then(response => response.text())
            .then(result => {
                setLoader(false)
                navigation.navigate("Home")
            }
            )
            .catch(error => {
                setLoader(false)
                Alert.alert("Network or server Error",)
            }
            );
    }

    return (
        <KeyboardAwareScrollView>
            <SafeAreaView style={styles.main}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
                <ScrollView>
                    <View style={styles.headerView}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: wp('95%'), alignSelf: 'center' }}>
                            <Text style={styles.logoutText}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.heading}>
                        Report an Issue
                    </Text>
                    <Formik
                        initialValues={{ title: '', additionalNote: '' }}
                        validateOnMount={true}
                        onSubmit={ReportIssue}
                        validationSchema={ReportIssueValidation}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
                            <Animatable.View animation={animation.fade}>
                                <Animatable.View animation={animation.fade} style={styles.emailInput}>
                                    <CustomInput
                                        title="Title (required)"
                                        keyboardType="email-address"
                                        onChangeText={handleChange('title')}
                                        onBlur={handleBlur('title')}
                                        defaultValue={values.title}
                                    />
                                    {(errors.title && touched.title) &&
                                        <CustomErrorText title={errors.title} />
                                    }
                                </Animatable.View>
                                <Animatable.View style={styles.videoView}>
                                    <TouchableOpacity onPress={RecordVideo}>
                                        <Animatable.Text animation={animation.fade} style={styles.recordBtn}>
                                            Record Video
                                        </Animatable.Text>
                                    </TouchableOpacity>
                                    <Animatable.Text style={{ marginVertical: hp('1.5%'), color: COLORS.grayniteGray, textAlign: 'center', fontSize: hp('2%'), fontFamily: Font.medium }}>
                                        Or
                                    </Animatable.Text>
                                    <TouchableOpacity onPress={selectVideo}>
                                        <Animatable.Text animation={animation.fade} style={styles.recordBtn}>
                                            Upload Video
                                        </Animatable.Text>
                                    </TouchableOpacity>
                                    {
                                        vid === null ? (
                                            null
                                        ) : (
                                            <Animatable.Text style={{ width: wp('80%'), alignSelf: 'center', textAlign: 'center', color: COLORS.grayniteGray, fontSize: hp('1.7%'), fontFamily: Font.regular, alignSelf: 'center', marginTop: hp('1%') }}>
                                                {` ${vid.type}  duration  ${vid.duration} sec`}
                                            </Animatable.Text>
                                        )
                                    }
                                </Animatable.View>
                                <Animatable.View animation={animation.fade} style={styles.emailInput}>
                                    <CustomInput
                                        title="Additional Notes"
                                        numberOfLines={5}
                                        // multiline={true}
                                        keyboardType="email-address"
                                        onChangeText={handleChange('additionalNote')}
                                        onBlur={handleBlur('additionalNote')}
                                        defaultValue={values.additionalNote}
                                    />
                                    {(errors.additionalNote && touched.additionalNote) &&
                                        <CustomErrorText title={errors.additionalNote} />
                                    }
                                </Animatable.View>
                                {Loader ? (
                                    <CustomLoadingBtn
                                        color={COLORS.white}
                                        size="small"
                                        style={styles.postBTn}
                                    />
                                ) : (
                                    <CustomButton
                                        onPress={handleSubmit}
                                        title="POST REPORT"
                                        style={styles.postBTn}
                                    />
                                )}
                            </Animatable.View>
                        )}
                    </Formik>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAwareScrollView>
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
        fontSize: hp('2%'),
        fontFamily: Font.medium,
        color: COLORS.primary,
        textAlign: 'right',
        alignSelf: 'flex-end',
    },
    heading: {
        width: wp('85%'),
        alignSelf: 'center',
        fontSize: hp('2.5%'),
        marginTop: hp('2%'),
        color: COLORS.primary,
        fontFamily: Font.bold
    },
    emailInput: {
        marginTop: hp('2%')
    },
    videoView: {
        width: wp('85%'),
        height: hp('35%'),
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: COLORS.offBlue,
        marginTop: hp('4%'),
        borderRadius: 8,
    },
    postBTn: {
        backgroundColor: COLORS.primary
    },
    recordBtn: {
        fontSize: hp('2%'),
        fontFamily: Font.medium,
        color: COLORS.blue,
        alignSelf: 'center'
    }
})
export default ReportIssue;
