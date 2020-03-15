import * as functions from 'firebase-functions';
import {v4 as uuidv4} from 'uuid';
import * as mime from 'mime-types';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import axios from 'axios';

const UNSPLASH_BASE = 'https://api.unsplash.com';

export class Media {
  private _path: string | null = null;

  constructor(private url: string) {
  }

  download() {
    return new Promise((async (resolve, reject) => {
      console.log(`Starting download of ${this.url}`);
      const resp = await axios.get(this.url, {
        responseType: 'arraybuffer'
      });

      const id = uuidv4();
      const ext = mime.extension(resp.headers['content-type']);
      this._path = path.join(os.tmpdir(), id + '.' + ext);
      console.log(`Downloading media ${this.url} to ${this._path}`);
      fs.writeFile(this._path, resp.data, (err => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      }));
    }));
  }

  async delete() {
    if (!this._path) {
      throw Error("Cannot delete media that has not been downloaded");
    }
    console.log(`Deleting media from ${this._path}`);
    fs.unlinkSync(this._path);
    this._path = null;
  }

  get path(): string {
    if(!this._path) {
      throw Error("Cannot use media file that has not been downloaded.");
    }
    return this._path;
  }
}

abstract class MediaSource {
  constructor(protected width: number, protected height: number) {
  }

  abstract search(keyword: string): Promise<Media | null>
}

class Unsplash extends MediaSource {
  private clientId: string;

  constructor(width: number, height: number) {
    super(width, height);
    this.clientId = functions.config().unsplash.access;
  }

  async search(keyword: string) {
    console.log(`Searching unsplash for ${keyword}`);
    const url = `${UNSPLASH_BASE}/search/photos?client_id=${this.clientId}&query=${keyword}`;
    console.log(`Searching ${url}.`);
    try {
      const resp = await axios.get(url);
      if (!resp.data.results || resp.data.results.length === 0) {
        console.warn(`Unplash returned no results for ${keyword}.`);
        return null;
      }
      const bestResult = resp.data.results[0];
      return new Media(bestResult.urls.full + `&w=${this.width}&h=${this.height}&fit=crop`);
    } catch (e) {
      console.error(e.response.data);
      throw e;
    }
  }
}

export function search(keyword: string, width: number, height: number) {
  return new Unsplash(width, height).search(keyword);
}

