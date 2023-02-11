import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { MultiSelect } from 'react-native-element-dropdown';
import { Formik } from 'formik';
import COLORS from '../config/COLORS';
import Font from '../config/Font';
import * as ImagePicker from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomInput from '../components/CustomInput';
import CustomErrorText from '../components/customErrorText';
import { SignUpValidationSchema } from '../utils/validation';
import CustomButton from '../components/customButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import CustomLoadingBtn from '../components/customLoadingBtn';
import DocumentPicker from 'react-native-document-picker';

const options = {
  title: 'Select Image',
  type: 'library',
  options: {
    maxHeight: 200,
    maxWidth: 200,
    selectionLimit: 1,
    mediaType: 'photo',
    includeBase64: false,
  },
};
const SignUp = ({ navigation }) => {
  const [country, setCountry] = useState([]);
  const [Loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [photo, setPhotoURI] = useState([]);
  const [photoID, setPhotoID] = useState('');
  const [singleFile, setSingleFile] = useState('');
  const [InsuranceDocument, setInsuranceDocument] = useState('');
  const [addressProof, setAddressProff] = useState('');
  console.log(photo);

  useFocusEffect(
    React.useCallback(() => {
      getAllJobs();
    }, [])
  );
  const getAllJobs = async () => {
    setLoading(true);
    const res = await axios
      .get(`https://propertyupkeepmanagement.com/api/skills`)
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
          setAllData(res.data.data);
        } else {
          setLoading(false);
          Alert.alert('Network or server Error');
        }
      })
      .catch((err) => {
        Alert.alert('Network or server Error');
        setLoading(false);
      });
  };
  const signUpApi = async (values) => {
    if (
      photoID === [] ||
      addressProof === [] ||
      singleFile === [] ||
      InsuranceDocument === [] ||
      photo === []
    ) {
      alert('Kindly provide all documents');
    } else {
      setLoader(true);
      var formdata = new FormData();
      formdata.append('name', values.fullName);
      formdata.append('phone', values.telephone);
      formdata.append('address', values.address);
      formdata.append('email', values.email);
      formdata.append('password', values.password);
      formdata.append('skills', JSON.stringify(country));
      formdata.append('user_type', 2);
      formdata.append(
        'profile_pic',
        photo === null
          ? 'null'
          : {
              uri: photo.uri,
              name: photo.fileName,
              type: photo.type,
            }
      );
      formdata.append(
        'photo_id',
        photoID === null
          ? 'null'
          : {
              uri: photoID.uri,
              name: photoID.fileName,
              type: photoID.type,
            }
      );
      formdata.append(
        'insurance_document',
        InsuranceDocument === null
          ? 'null'
          : {
              uri: InsuranceDocument.uri,
              name: InsuranceDocument.fileName,
              type: InsuranceDocument.type,
            }
      );
      formdata.append(
        'address_proof',
        addressProof === null
          ? 'null'
          : {
              uri: addressProof.uri,
              name: addressProof.fileName,
              type: addressProof.type,
            }
      );
      formdata.append(
        'certificate',
        singleFile === null
          ? 'null'
          : {
              uri: singleFile.uri,
              name: singleFile.fileName,
              type: singleFile.type,
            }
      );

      var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow',
      };

      fetch('https://propertyupkeepmanagement.com/api/register', requestOptions)
        .then((response) => response.text())
        .then((result) => {
          console.log(result, 'saim');
          const res = JSON.parse(result);
          if (res.success === true) {
            Alert.alert('Your account has been created successfully');
            navigation.navigate('Sign In');
            setLoader(false);
          } else {
            alert('User Already registered');
            setLoader(false);
          }
        });
      // .catch(
      //   (error) => console.log(error, 'ali'),
      //   setLoader(false),
      //   alert('Server Error')
      // );
    }
  };

  const selectOneFile = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('cancel');
      } else {
        setSingleFile(response.assets[0]);
      }
    });
  };

  const Insurance = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('cancel');
      } else {
        setInsuranceDocument(response.assets[0]);
      }
    });
  };

  const ProofOfAddress = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('cancel');
      } else {
        setAddressProff(response.assets[0]);
      }
    });
  };

  const UploadPhotoID = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('cancel');
      } else {
        setPhotoID(response.assets[0]);
      }
    });
  };

  const openGallery = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('cancel');
      } else {
        setPhotoURI(response.assets[0]);
      }
    });
  };
  return (
    // <KeyboardAwareScrollView style={styles.main} showsVerticalScrollIndicator={false}>
    <SafeAreaView>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />
      {/* {loading ? (
                    <ActivityIndicator
                        size="large"
                        color={COLORS.primary}
                        style={{ height: hp('100%'), justifyContent: 'center', alignSelf: 'center' }}
                    />
                ) : ( */}
      <View style={styles.headerView}>
        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={() => navigation.navigate('Sign In')}>
          <Text style={styles.loginText}>
            Log In
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView keyboardShouldPersistTaps='handled'>
        <Formik
          initialValues={{
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            address: '',
            telephone: '',
          }}
          validateOnMount={true}
          onSubmit={signUpApi}
          validationSchema={SignUpValidationSchema}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            errors,
          }) => (
            <View>
              {photo ? (
                <View style={styles.imgView}>
                  <Image
                    source={{ uri: photo.uri }}
                    resizeMode='cover'
                    style={styles.image}
                  />
                  <View style={styles.cameraIcon}>
                    <TouchableOpacity onPress={openGallery}>
                      <FontAwesome
                        name='camera'
                        size={22}
                        color={COLORS.primary}
                        style={{ alignSelf: 'center' }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.imgView}>
                  <TouchableOpacity onPress={openGallery}>
                    <Entypo
                      name='plus'
                      size={50}
                      color={COLORS.black}
                      style={{ alignSelf: 'center' }}
                    />
                  </TouchableOpacity>
                </View>
              )}
              {photoID ? (
                <TouchableOpacity
                  style={styles.imgViewTwo}
                  onPress={UploadPhotoID}
                >
                  <Text
                    style={{
                      fontSize: hp('2%'),
                      fontFamily: Font.bold,
                      color: COLORS.primary,
                      textAlign: 'center',
                    }}
                    numberOfLines={2}
                  >
                    {photoID.fileName}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.imgViewTwo}
                  onPress={UploadPhotoID}
                >
                  <Text
                    style={{
                      fontSize: hp('2%'),
                      fontFamily: Font.bold,
                      color: COLORS.primary,
                      textAlign: 'center',
                    }}
                  >
                    {'Photo ID '}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.emailInput}>
                <CustomInput
                  title='Full Name'
                  placeholder='Enter Full Name'
                  keyboardType='default'
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  defaultValue={values.fullName}
                />
                {errors.fullName && touched.fullName && (
                  <CustomErrorText title={errors.fullName} />
                )}
              </View>
              <View style={styles.inputOne}>
                <Text style={styles.headingText}>{'Trade'}</Text>
                <View style={styles.container}>
                  <MultiSelect
                    style={styles.dropdown}
                    placeholderStyle={styles.dropdownText}
                    selectedTextStyle={styles.dropdownText}
                    inputSearchStyle={styles.dropdownSearchText}
                    iconStyle={{ marginRight: wp('2%'), height: hp('3%') }}
                    search
                    data={allData}
                    labelField='label'
                    valueField='value'
                    placeholder='Trade'
                    searchPlaceholder='Search...'
                    value={country}
                    onChange={(item) => {
                      setCountry(item);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.iconOk}
                        color='black'
                        name='Safety'
                        size={20}
                      />
                    )}
                    selectedStyle={styles.selectedStyle}
                  />
                </View>
              </View>
              <View style={styles.passwordInput}>
                <CustomInput
                  title='Address'
                  placeholder='Enter Address'
                  keyboardType='default'
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                  defaultValue={values.address}
                />
                {errors.address && touched.address && (
                  <CustomErrorText title={errors.address} />
                )}
              </View>
              <View style={styles.passwordInput}>
                <CustomInput
                  title='Contact Number'
                  placeholder='Enter contact number'
                  keyboardType='phone-pad'
                  onChangeText={handleChange('telephone')}
                  onBlur={handleBlur('telephone')}
                  defaultValue={values.telephone}
                />
                {errors.telephone && touched.telephone && (
                  <CustomErrorText title={errors.telephone} />
                )}
              </View>
              <View style={styles.passwordInput}>
                <CustomInput
                  title='Email'
                  placeholder='Enter Email'
                  keyboardType='default'
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  defaultValue={values.email}
                />
                {errors.email && touched.email && (
                  <CustomErrorText title={errors.email} />
                )}
              </View>
              <View style={styles.passwordInput}>
                <CustomInput
                  title='Password'
                  placeholder='Enter Password'
                  keyboardType='default'
                  secureTextEntry={true}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  defaultValue={values.password}
                />
                {errors.password && touched.password && (
                  <CustomErrorText title={errors.password} />
                )}
              </View>
              <View style={styles.passwordInput}>
                <CustomInput
                  title='Confirm Password'
                  placeholder='Retype Password'
                  keyboardType='default'
                  secureTextEntry={true}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  defaultValue={values.confirmPassword}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <CustomErrorText title={errors.confirmPassword} />
                )}
              </View>
              <View>
                <TouchableOpacity
                  style={styles.imgViewTwo}
                  onPress={ProofOfAddress}
                >
                  {addressProof ? (
                    <Text
                      style={{
                        fontSize: hp('2%'),
                        fontFamily: Font.bold,
                        color: COLORS.primary,
                        textAlign: 'center',
                      }}
                    >
                      {addressProof.fileName}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: hp('2%'),
                        fontFamily: Font.bold,
                        color: COLORS.primary,
                        textAlign: 'center',
                      }}
                    >
                      {'Proof of Address '}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  style={styles.imgViewTwo}
                  onPress={selectOneFile}
                >
                  {singleFile ? (
                    <Text
                      style={{
                        fontSize: hp('2%'),
                        fontFamily: Font.bold,
                        color: COLORS.primary,
                        textAlign: 'center',
                      }}
                    >
                      {singleFile.fileName}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: hp('2%'),
                        fontFamily: Font.bold,
                        color: COLORS.primary,
                        textAlign: 'center',
                      }}
                    >
                      {'Upload Certificates '}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity style={styles.imgViewTwo} onPress={Insurance}>
                  {InsuranceDocument ? (
                    <Text
                      style={{
                        fontSize: hp('2%'),
                        fontFamily: Font.bold,
                        color: COLORS.primary,
                        textAlign: 'center',
                      }}
                    >
                      {InsuranceDocument.fileName}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: hp('2%'),
                        fontFamily: Font.bold,
                        color: COLORS.primary,
                        textAlign: 'center',
                      }}
                    >
                      {'Insurance Document '}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {Loader ? (
                <CustomLoadingBtn
                  color={COLORS.white}
                  size='small'
                  style={styles.btn}
                />
              ) : (
                <CustomButton
                  onPress={handleSubmit}
                  title='SIGNUP'
                  style={styles.btn}
                />
              )}
            </View>
          )}
        </Formik>
        <View style={{paddingBottom:350}}></View>
      </ScrollView>
      {/* )} */}
    </SafeAreaView>
    //</KeyboardAwareScrollView>
  );
};
const styles = StyleSheet.create({
  main: {
    width: wp('100%'),
    height: hp('100%'),
    backgroundColor: COLORS.white,
  },
  icon: {
    alignSelf: 'center',
    marginTop: hp('4%'),
  },
  heading: {
    marginTop: hp('2%'),
    color: COLORS.primary,
  },
  inputOne: {
    marginTop: hp('1.5%'),
  },
  emailInput: {
    marginTop: hp('2%'),
  },
  passwordInput: {
    marginTop: hp('1%'),
  },
  btn: {
    marginTop: hp('4%'),
    backgroundColor: COLORS.primary,
    marginBottom: hp('4%'),
  },
  item: {
    width: wp('70%'),
    alignSelf: 'center',
    height: hp('6%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    fontSize: Font.medium,
    fontSize: hp('2%'),
    color: COLORS.dimgray,
  },
  shadow: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  dropdownText: {
    fontSize: hp('2%'),
    fontFamily: Font.regular,
    color: COLORS.dimgray,
    paddingLeft: wp('5%'),
  },
  // icon: {
  //     marginRight: 20,
  //     backgroundColor: 'red',
  //     width: 18,
  //     height: 18,
  // },
  dropdown: {
    width: wp('85%'),
    height: hp('6%'),
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayniteGray,
    borderWidth: 0.5,
    marginTop: hp('0.5%'),
    marginBottom: hp('1%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  shadow: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  dropdownText: {
    fontSize: hp('2%'),
    fontFamily: Font.regular,
    color: COLORS.black,
    paddingLeft: wp('5%'),
  },
  dropdownSearchText: {
    fontSize: hp('2%'),
    fontFamily: Font.regular,
    color: COLORS.black,
  },
  iconOk: {
    marginLeft: wp('2%'),
  },
  selectedStyle: {
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: hp('1%'),
  },
  container: {
    width: wp('85%'),
    alignSelf: 'center',
  },
  imgView: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.white,
    marginBottom: hp('1%'),
    marginTop: hp('4%'),
    alignSelf: 'center',
    borderRadius: 100,
    justifyContent: 'center',
    shadowColor: '#636363',
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
  cameraIcon: {
    position: 'absolute',
    bottom: hp('0%'),
    right: wp('0%'),
    backgroundColor: COLORS.white,
    height: hp('5%'),
    width: wp('10%'),
    borderRadius: 100,
    justifyContent: 'center',
  },
  imgViewOne: {
    width: wp('85%'),
    height: hp('20%'),
    backgroundColor: COLORS.white,
    marginTop: hp('1%'),
    alignSelf: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    shadowColor: '#636363',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 10,
  },
  imgViewTwo: {
    width: wp('85%'),
    height: hp('8%'),
    backgroundColor: COLORS.white,
    marginTop: hp('1.5%'),
    alignSelf: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    shadowColor: '#636363',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 10,
  },
  imageOne: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    borderRadius: 16,
  },
  cameraIconOne: {
    position: 'absolute',
    bottom: hp('-0.3%'),
    right: wp('0%'),
    backgroundColor: COLORS.white,
    height: hp('5%'),
    width: wp('10%'),
    borderRadius: 100,
    justifyContent: 'center',
  },
  headingText: {
    width: wp('85%'),
    alignSelf: 'center',
    fontSize: hp('2%'),
    fontFamily: Font.medium,
    color: COLORS.black,
  },
  headerView: {
    width: wp('100%'),
    height: hp('6%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: COLORS.grayniteGray,
    borderBottomWidth: 0.5
},
loginText: {
    width: wp('25%'),
    paddingLeft: hp('2.5%'),
    fontSize: hp('2%'),
    fontFamily: Font.medium,
    color: COLORS.primary,
},
});
export default SignUp;
