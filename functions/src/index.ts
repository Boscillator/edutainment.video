import * as functions from 'firebase-functions'
import * as admin from "firebase-admin";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegPath from "ffmpeg-static";
import {path as ffprobePath} from "ffprobe-static";
import {AudioFile} from "./AudioFile";
import {search} from "./Media";
import {Video} from "./Video";

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

admin.initializeApp();

function notNull<T>(x : T | null): x is T {
  return x !== null;
}

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
  const timings = keyWords.map(w => w.time);

  const media = await Promise.all(keyWords.map(w => search(w.word, VIDEO_WIDTH, VIDEO_HEIGHT)));
  const notNullMedia = media.filter(notNull);
  await Promise.all(media.map(m => m && m.download())); // Download all media to tmp directory

  const video = new Video(notNullMedia, timings, audio);
  await video.save();
  await video.upload(object.bucket, object.name);
  console.log("Successfully proceed audio file");
});

