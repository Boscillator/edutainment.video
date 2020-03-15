// import * as ffmpeg from 'fluent-ffmpeg'
import {v4 as uuidv4} from "uuid";
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {Media} from "./Media";
import {AudioFile, FFMPEGError} from "./AudioFile";
// @ts-ignore
import * as videoshow from "videoshow";
import * as admin from "firebase-admin";


const VIDEO_EXTENTION = '.mp4';

export class Video {

  private _path: string;

  /**
   * Generate a video file
   * @param media A list of media clips to show
   * @param timing The start times in seconds of each clip
   * @param audio The audio file to attach to the video
   */
  constructor(private media: Media[], private timing: number[], private audio: AudioFile) {
    // Each media element needs timing data
    console.assert(media.length === timing.length);
    this._path = path.join(os.tmpdir(), uuidv4() + VIDEO_EXTENTION);
  }

  private async getDuration(i: number) {
    // If this is the last element
    if (i === this.media.length - 1) {
      // It should run until the end of the audio file
      const audioFileDuration = await this.audio.duration();
      return audioFileDuration - this.timing[i];
    } else {
      return this.timing[i + 1] - this.timing[i];
    }
  }


  save(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const images = [];
      for (let i = 0; i < this.media.length; i++) {
        images.push({
          path: this.media[i].path,
          loop: await this.getDuration(i)
        })
      }
      videoshow(images)
        .audio(this.audio.path)
        .save(this.path)
        .on('end', () => {
          console.log(`Saved video to ${this.path}`);
          resolve();
        })
        .on('error', (err: any, stdout: any, stderr: any) => {
          console.error("FFMPEG Error:\n" + stderr);
          reject(new FFMPEGError(err));
        })
    });
  }

  async upload(bucket: string, name: string) {
    console.log("UPLOAD");
    const destination = 'processed/videos/' + path.basename(name, path.extname(name)) + '.mp4';
    console.log(`Uploading video file from ${name} to ${destination}`);
    await admin.storage().bucket(bucket).upload(this.path, {
      destination: destination
    });
    console.log("Deleting temporary files...");
    await Promise.all(this.media.map(m => m.delete()));
    this.audio.delete();
    fs.unlinkSync(this.path);
  }

  get path() {
    return this._path;
  };
}
