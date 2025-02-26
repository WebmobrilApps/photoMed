import {createSlice,} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading:false,
  userAccountDetails:null,
  welcomeScreen:true,
  accessToken:null,
  cloudType:null,
  refreshToken:null,
  patientId:null,
  patientName:null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state, action) => {
      state.userAccountDetails = null
      state.user = null
      state.accessToken=null
      state.patientId=null
      state.patientName=null
      state.cloudType=null
    },
    saveUserData: (state, action) => {       
      state.user = action.payload;
     },
    savePatientInfo: (state, action) => {       
      state.patientId = action.payload;
      state.patientName=action.payload
     },
    setWelcomeScreen: (state, action) => {       
      state.welcomeScreen = action.payload;
     },
    setAccessToken: (state, action) => {       
      state.accessToken = action.payload;
     },
    setRefreshToken: (state, action) => {       
      state.refreshToken = action.payload;
     },
    setCloudType: (state, action) => {       
      state.cloudType = action.payload;
     },
    setLoading: (state, action) => {       
      state.loading = action.payload;      
     },
  },
});
export default authSlice.reducer;
export const {logout,saveUserData,setLoading,setWelcomeScreen,setAccessToken,setCloudType,setRefreshToken,savePatientInfo} = authSlice.actions;