import * as firebase from "firebase/app"
import 'firebase/storage'
import {v4 as uuidv4} from 'uuid'

const UPLOAD_PREFIX = 'uploads/audio'
const RESULTS_PREFIX = 'processed/videos'

export const state = () => ({
  status: 'no-file',
  progress: 0,
  videoId: null,
  interval: null,
  videoURL: null
})

export const mutations = {
  setProgress(state, progress) {
    state.progress = progress
    state.status = 'uploading'
  },
  error(state) {
    state.status = 'error'
  },
  uploaded(state, {id}) {
    state.status = 'processing'
    state.videoId = id
  },
  setupInterval(state, {interval}) {
    state.interval = interval
  },
  done(state, {url}) {
    clearInterval(state.interval)
    state.status = 'done'
    state.videoURL = url
  }
}

export const actions = {
  upload(context, {file}) {
    const id = uuidv4()

    // get the extension from the file or empty string if it has none
    // see https://stackoverflow.com/a/680982
    const extention = /(?:\.([^.]+))?$/.exec(file.name)[1] || ""

    // create reference and upload
    const ref = firebase.storage().ref(`${UPLOAD_PREFIX}/${id}.${extention}`)
    const task = ref.put(file)
    console.log("Writing file to " + ref.fullPath)

    task.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        context.commit('setProgress', progress)
      }, (err) => {
        console.error(err)
        context.commit('error')
      }, () => {
        console.log('File uploaded successfully')
        context.commit('uploaded', {id})
        context.dispatch('waitForFinish')
      },
    )
  },
  waitForFinish(context) {
    const ref = firebase.storage().ref(`${RESULTS_PREFIX}/${context.state.videoId}.mp4`)
    const interval = setInterval(() => {
      ref.getDownloadURL().then((url) => {
        context.commit('done',{url})
      }).catch((error) => {
        console.log("Video not done processing")
      })
    }, 1000)
    context.commit('setupInterval', {interval})
  }
}
