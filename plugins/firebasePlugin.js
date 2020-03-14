import Vue from 'vue'
import * as firebase from "firebase/app"
import 'firebase/storage'


const firebaseConfig = {
  apiKey: "AIzaSyAUAlMyo-FtgaGiC7EhFxlKIWVTzaQsFrc",
  authDomain: "edutainment-video.firebaseapp.com",
  databaseURL: "https://edutainment-video.firebaseio.com",
  projectId: "edutainment-video",
  storageBucket: "edutainment-video.appspot.com",
  messagingSenderId: "124685483724",
  appId: "1:124685483724:web:458bf28f5d58eee1aecc69",
}

firebase.initializeApp(firebaseConfig)

Vue.prototype.$storage = firebase.storage()
