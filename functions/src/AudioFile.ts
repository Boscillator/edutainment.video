import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as admin from "firebase-admin";
import * as ffmpegPath from 'ffmpeg-static'
import * as ffmpeg from 'fluent-ffmpeg'
import * as speech from '@google-cloud/speech';
import {Transcript} from "./Transcript";

const AUDIO_CODEC = 'pcm_s16le';
const SAMPLE_RATE = 48000;
const ENCODING: "LINEAR16" = "LINEAR16";
const LANGUAGE = 'en-US';

ffmpeg.setFfmpegPath(ffmpegPath);
const speechClient = new speech.SpeechClient();

export class FFMPEGError extends Error {}

export class AudioFile {
  private path: string | null = null;

  constructor(private bucket: string, private name: string) {
  }

  async download() {
    if (this.path) {
      throw Error(`Attempted to re-download audio file.`);
    }

    console.log(`Downloading ${this.name}`);
    this.path = path.join(os.tmpdir(), path.basename(this.name));
    await admin.storage()
      .bucket(this.bucket)
      .file(this.name)
      .download({destination: this.path})
  }

  normalize() {
    return new Promise((resolve, reject) => {
      console.log(`Starting normalize on ${this.name}`);

      if(!this.path) {
        throw Error("Cannot normalize file that isn't downloaded.");
      }

      const oldPath = this.path;
      const newPath = path.join(os.tmpdir(), path.basename(this.name, path.extname(this.name)) + '.conv.wav');
      ffmpeg()
        .input(this.path)
        .audioCodec(AUDIO_CODEC)
        .audioFrequency(SAMPLE_RATE)
        .audioChannels(1)
        .save(newPath)
        .on('error', (err) =>{
          console.error("Normalization Failed");
          reject(new FFMPEGError(err.message));
        })
        .on('end',() => {
          console.log("Normalization Completed");
          fs.unlinkSync(oldPath);
          this.path = newPath;
          console.log(this.path);
          resolve();
      });
    });
  }

  async transcribe() {
    console.log(`Transcribing ${this.name}`);
    if(!this.path) {
      throw Error("Cannot transcribe file that isn't downloaded.");
    }

    const config = {
      encoding: ENCODING,
      languageCode: LANGUAGE,
      sampleRateHertz: SAMPLE_RATE,
      enableWordTimeOffsets: true
    };

    const audio = {
      content: fs.readFileSync(this.path).toString('base64')
    };

    const request = { config, audio};

    // Start transcription
    const [operation] = await speechClient.longRunningRecognize(request);

    // Wait for response
    const [response] = await operation.promise();

    if(typeof response.results === 'undefined' || response.results === null) {
      console.error("Bad response from speech to text.");
      throw Error("Bad response from speech to text");
    }

    const transcript = new Transcript(response.results);
    return transcript;
  }
}
