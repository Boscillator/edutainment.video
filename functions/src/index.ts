import * as functions from 'firebase-functions'
import * as admin from "firebase-admin";
import {AudioFile} from "./AudioFile";
import {search} from "./Media";
// import * as speech from '@google-cloud/speech'

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

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
  const transcript = await audio.transcribe();
  const keyWords = transcript.pickKeyWords();
  const media = await Promise.all(keyWords.map(w => search(w.word, VIDEO_WIDTH, VIDEO_HEIGHT)));
  await Promise.all(media.map(m => m && m.download()));
});

