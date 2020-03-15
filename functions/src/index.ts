import * as functions from 'firebase-functions'
import * as admin from "firebase-admin";
import {AudioFile} from "./AudioFile";
// import * as speech from '@google-cloud/speech'

admin.initializeApp();

export const generateVideo = functions.storage.object().onFinalize(async (object) => {
  if(!object.name || !object.name.startsWith('uploads/audio')) {
    console.log("Not a user uploaded file. Exiting");
    return;
  }
  if(!object.contentType || !object.contentType.startsWith('audio/')) {
    console.error(`Expected audio file, got "${object.contentType}"`);
    return;
  }

  const audio = new AudioFile(object.bucket, object.name);
  await audio.download();
  await audio.normalize();
  await audio.transcribe();
});

