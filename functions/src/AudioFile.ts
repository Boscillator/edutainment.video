import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as admin from "firebase-admin";
import * as ffmpeg from 'fluent-ffmpeg'
import * as speech from '@google-cloud/speech';
import {Transcript} from "./Transcript";

const AUDIO_CODEC = 'pcm_s16le';
const SAMPLE_RATE = 48000;
const ENCODING: "LINEAR16" = "LINEAR16";
const LANGUAGE = 'en-US';

const speechClient = new speech.SpeechClient();

export class FFMPEGError extends Error {}

export class AudioFile {
  private _path: string | null = null;

  constructor(private bucket: string, private name: string) {
  }

  async download() {
    if (this._path) {
      throw Error(`Attempted to re-download audio file.`);
    }

    console.log(`Downloading ${this.name}`);
    this._path = path.join(os.tmpdir(), path.basename(this.name));
    await admin.storage()
      .bucket(this.bucket)
      .file(this.name)
      .download({destination: this._path})
  }

  normalize() {
    return new Promise((resolve, reject) => {
      console.log(`Starting normalize on ${this.name}`);

      if(!this._path) {
        throw Error("Cannot normalize file that isn't downloaded.");
      }

      const oldPath = this._path;
      const newPath = path.join(os.tmpdir(), path.basename(this.name, path.extname(this.name)) + '.conv.wav');
      ffmpeg()
        .input(this._path)
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
          this._path = newPath;
          console.log(this._path);
          resolve();
      });
    });
  }

  async transcribe() {
    console.log(`Transcribing ${this.name}`);
    if(!this._path) {
      throw Error("Cannot transcribe file that isn't downloaded.");
    }

    const config = {
      encoding: ENCODING,
      languageCode: LANGUAGE,
      sampleRateHertz: SAMPLE_RATE,
      enableWordTimeOffsets: true
    };

    const audio = {
      content: fs.readFileSync(this._path).toString('base64')
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

  duration(): Promise<number> {
    console.log(`Fetching duration of ${this.name}`);
    return new Promise<number>(((resolve, reject) => {
      if(!this._path) {
        throw Error("Cannot get duration of file not downloaded");
      }
      ffmpeg.ffprobe(this._path, function(err, metadata) {
        if(err) {
          console.error("FFProbe error");
          reject(new FFMPEGError(err));
        }
        const dur = metadata.streams[0].duration;
        if(typeof dur === 'undefined' || !dur) {
          console.error("No duration on stream");
          reject(new Error("No duration on stream"));
          return
        }
        console.log(`Successfully calculated duration to be ${dur}`);
        resolve(parseFloat(dur));
      });
    }));
  }

  get path(): string {
    if(!this._path) {
      throw Error("Cannot get path of non-downloaded audio file");
    }
    return this._path;
  }

  delete() {
    if(!this._path) {
      throw Error("Cannot delete non-downloaded audio file");
    }
    console.log(`Deleting audio from ${this._path}`);
    fs.unlinkSync(this._path);
    this._path = null;
  }
}
