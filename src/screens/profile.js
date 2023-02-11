import React, { useState, useEffect,useContext } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
  Alert,
  Text,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { MultiSelect } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native-paper';
import { Formik } from 'formik';
import COLORS from '../config/COLORS';
import Font from '../config/Font';
import CustomInput from '../components/CustomInput';
import CustomErrorText from '../components/customErrorText';
import { ProfileValidation } from '../utils/validation';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../components/customButton';
import CustomLoadingBtn from '../components/customLoadingBtn';
import axios from 'axios';
import DocumentPicker from 'react-native-document-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import * as ImagePicker from 'react-native-image-picker';
import { AuthContext } from '../context/context';

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

const Profile = ({ navigation }) => {
  const baseURL = 'https://propertyupkeepmanagement.com';
  const [Loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [user_details, setUserDetails] = useState('');
  const [uId, setUId] = useState('');
  const [uToken, setUToken] = useState('');
  const [allData, setAllData] = useState([]);
  const [country, setCountry] = useState('');
  const [photo, setPhotoURI] = useState(
    `${baseURL}${user_details.profile_pic}`
  );
  const [photoID, setPhotoID] = useState(`${baseURL}${user_details.photo_id}`);
  const [singleFile, setSingleFile] = useState(
    `${baseURL}${user_details.certificate}`
  );
  const [InsuranceDocument, setInsuranceDocument] = useState(
    `${baseURL}${user_details.insurance_document}`
  );
  const [addressProof, setAddressProff] = useState(
    `${baseURL}${user_details.address_proof}`
  );
  const { signOut } = useContext(AuthContext)

  useEffect(() => {
    getAllJobs();
    getUserDetails();
  }, []);

  const selectOneFile = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('user cancel image picker');
      } else {
        setSingleFile(response.assets[0]);
      }
    });
  };

  const Insurance = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('user cancel image picker');
      } else {
        setInsuranceDocument(response.assets[0]);
      }
    });
  };

  const ProofOfAddress = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('user cancel image picker');
      } else {
        setAddressProff(response.assets[0]);
      }
    });
  };

  const openGallery = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('user cancel image picker');
      } else {
        setPhotoURI(response.assets[0]);
      }
    });
  };
  const userInfoData = (user_info) => {
    setUserDetails(user_info);
  };

  const getAllJobs = async () => {
    setDetailLoading(true);
    const res = await axios
      .get(`https://propertyupkeepmanagement.com/api/skills`)
      .then((res) => {
        if (res.status === 200) {
          setDetailLoading(false);
          setAllData(res.data.data);
        } else {
          setDetailLoading(false);
          Alert.alert('Network or server Error');
        }
      })
      .catch((err) => {
        Alert.alert('Network or server Error');
        setDetailLoading(false);
      });
  };

  const DeleteAccount= async ()=>{
    let userId = await AsyncStorage.getItem('userId');
    let userToken = await AsyncStorage.getItem('userToken');
    console.log(userId);
    const res = await axios.get(`https://propertyupkeepmanagement.com/api/delete_account/${userId}`,
        {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${userToken}`
            },
        })
        .then(res => {
            console.log(res);
            if (res.status === 200) {
                setLoading(false);
                signOut();
            } else {
                setLoading(false)
                Alert.alert("Network or server Error",)
            }
        }
        )
        .catch(err => {
            setLoading(false)
        }
        )
}
  const UploadPhotoID = async () => {
    const images = await ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('user cancel image picker');
      } else {
        setPhotoID(response.assets[0]);
      }
    });
  };

  const getUserDetails = async () => {
    let userToken = await AsyncStorage.getItem('userToken');
    let userId = await AsyncStorage.getItem('userId');
    setUId(userId);
    setUToken(userToken);
    setLoading(true);
    const res = await axios
      .get(
        `https://propertyupkeepmanagement.com/api/get-profile-detail?id=${userId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        }
      )
      .then((res) => {
        if (res.data.success === true) {
          setLoading(false);
          userInfoData(res.data.data);
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

  const UpdateProfile = async (values) => {
    if (!country) {
      return alert('Please Reselect skills that apply when changing');
    }
    setLoader(true);
    var myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${uToken}`);
    myHeaders.append('Content-Type', 'multipart/form-data');
    const formdata = new FormData();
    formdata.append('name', values.fullName);
    formdata.append('address', values.street);
    formdata.append('phone', values.number);
    formdata.append('postal_code', values.postalCode);
    formdata.append('skills', JSON.stringify(country));
    formdata.append('user_id', uId);
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

    fetch('https://propertyupkeepmanagement.com/api/update-profile', {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    })
      .then((response) => response.text())
      .then((result) => {
        setLoader(false);
        Alert.alert('Update user details Successfully'),
          navigation.navigate('Home');
      })
      .catch(
        (error) => console.log('saim', error),
        Alert.alert('Update user details Successfully'),
        navigation.navigate('Home'),
        setLoader(false)
      );
  };

  return (
    //<KeyboardAwareScrollView style={styles.main} showsVerticalScrollIndicator={false}>
    <SafeAreaView>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.primary} />
      <ScrollView keyboardShouldPersistTaps='handled'>
        <View style={styles.headerView}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Are your sure?",
                "Are you sure you want to remove this beautiful box?",
                [
                  {
                    text: "Yes",
                    onPress: () => {
                      DeleteAccount();
                    },
                  },
                  {
                    text: "No",
                  },
                ]
              );
            }}
            style={{ flex: 1 }}>
            <Text style={{ color: 'red' }}>
              Delete account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ flex:1 }}
          >
            <Text style={styles.logoutText}>Cancel</Text>
          </TouchableOpacity>
        </View>
       
        <Text style={styles.heading}>Profile</Text>
        {loading ? (
          <ActivityIndicator
            size='small'
            color={COLORS.primary}
            style={{
              height: hp('80%'),
              justifyContent: 'center',
              alignSelf: 'center',
            }}
          />
        ) : (
          <Formik
            initialValues={{
              fullName: user_details.name,
              number: user_details.phone,
              street: user_details.address,
              postalCode: user_details.postal_code,
            }}
            validateOnMount={true}
            onSubmit={UpdateProfile}
            validationSchema={ProfileValidation}
            enableReinitialize={true}
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
                {photo === `${baseURL}` ? (
                  <View style={styles.imgView}>
                    <TouchableOpacity onPress={openGallery}>
                      <Entypo
                        name='plus'
                        size={50}
                        color={COLORS.gray52}
                        style={{ alignSelf: 'center' }}
                      />
                    </TouchableOpacity>
                  </View>
                ) : photo === `${baseURL}${user_details.profile_pic}` ||
                  photo === `${baseURL}undefined` ? (
                  <View style={styles.imgView}>
                    <Image
                      source={{ uri: `${baseURL}${user_details.profile_pic}` }}
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
                )}
                <View>
                  <TouchableOpacity
                    style={styles.imgViewTwo}
                    onPress={UploadPhotoID}
                  >
                    {photoID === `${baseURL}${user_details.photo_id}` ||
                    photoID === `${baseURL}undefined` ? (
                      <Text
                        style={{
                          fontSize: hp('2%'),
                          fontFamily: Font.bold,
                          color: COLORS.primary,
                          textAlign: 'center',
                        }}
                      >
                        {'Update Photo ID'}
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
                        {photoID.fileName}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.container}>
                  <Text style={styles.headingText}>{'Trade'}</Text>
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
                {user_details.skills === null ? (
                  <Text style={styles.box}>{'No Selected Skills'}</Text>
                ) : (
                  <Text style={styles.box}>{user_details.skills}</Text>
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
                <View style={styles.emailInput}>
                  <CustomInput
                    title='Contact Number'
                    placeholder='Enter Contact number'
                    keyboardType='default'
                    onChangeText={handleChange('number')}
                    onBlur={handleBlur('number')}
                    defaultValue={values.number}
                  />
                  {errors.number && touched.number && (
                    <CustomErrorText title={errors.number} />
                  )}
                </View>
                <View style={styles.emailInput}>
                  <CustomInput
                    title='Address'
                    placeholder='12 street Avenue'
                    keyboardType='default'
                    onChangeText={handleChange('street')}
                    onBlur={handleBlur('street')}
                    defaultValue={values.street}
                  />
                  {errors.street && touched.street && (
                    <CustomErrorText title={errors.street} />
                  )}
                </View>
                <View style={styles.emailInput}>
                  <CustomInput
                    title='Post Code'
                    placeholder='Enter Postal Code'
                    keyboardType='default'
                    onChangeText={handleChange('postalCode')}
                    onBlur={handleBlur('postalCode')}
                    defaultValue={values.postalCode}
                  />
                  {errors.postalCode && touched.postalCode && (
                    <CustomErrorText title={errors.postalCode} />
                  )}
                </View>
                <View>
                  <TouchableOpacity
                    style={styles.imgViewTwo}
                    onPress={ProofOfAddress}
                  >
                    {addressProof ===
                      `${baseURL}${user_details.address_proof}` ||
                    addressProof === `${baseURL}undefined` ? (
                      <Text
                        style={{
                          fontSize: hp('2%'),
                          fontFamily: Font.bold,
                          color: COLORS.primary,
                          textAlign: 'center',
                        }}
                      >
                        {'Update Proof of Address'}
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
                        {addressProof.fileName}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity
                    style={styles.imgViewTwo}
                    onPress={selectOneFile}
                  >
                    {singleFile === `${baseURL}${user_details.certificate}` ||
                    singleFile === `${baseURL}undefined` ? (
                      <Text
                        style={{
                          fontSize: hp('2%'),
                          fontFamily: Font.bold,
                          color: COLORS.primary,
                          textAlign: 'center',
                        }}
                      >
                        {'Update Certificate'}
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
                        {singleFile.fileName}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity
                    style={styles.imgViewTwo}
                    onPress={Insurance}
                  >
                    {InsuranceDocument ===
                      `${baseURL}${user_details.insurance_document}` ||
                    InsuranceDocument === `${baseURL}undefined` ? (
                      <Text
                        style={{
                          fontSize: hp('2%'),
                          fontFamily: Font.bold,
                          color: COLORS.primary,
                          textAlign: 'center',
                        }}
                      >
                        {'Update Insurance document'}
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
                        {InsuranceDocument.fileName}
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
                    title='CONFIRM'
                    style={styles.btn}
                  />
                )}
              </View>
            )}
          </Formik>
        )}
        <View style={{paddingBottom:350}}></View>
      </ScrollView>
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
  headerView: {
    width: wp('100%'),
    height: hp('6%'),
    padding:5,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    borderBottomColor: COLORS.grayniteGray,
    borderBottomWidth: 0.5,
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
    fontFamily: Font.bold,
  },
  btn: {
    marginTop: hp('4%'),
    backgroundColor: COLORS.primary,
    marginBottom: hp('2%'),
  },
  emailInput: {
    marginTop: hp('1%'),
  },
  dropdown: {
    width: wp('85%'),
    height: hp('6%'),
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayniteGray,
    borderWidth: 0.5,
    marginTop: hp('0.5%'),
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
  headingText: {
    width: wp('85%'),
    alignSelf: 'center',
    fontSize: hp('2%'),
    fontFamily: Font.medium,
    color: COLORS.black,
    marginTop: hp('2%'),
  },
  box: {
    width: wp('85%'),
    alignSelf: 'center',
    fontFamily: Font.regular,
    color: COLORS.black,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayniteGray,
    borderWidth: 0.5,
    marginTop: hp('2%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('2.5%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    marginBottom: hp('2%'),
  },
  imgView: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.white,
    marginBottom: hp('1%'),
    marginTop: hp('2%'),
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
  imgViewTwo: {
    width: wp('85%'),
    height: hp('8%'),
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
});
export default Profile;
