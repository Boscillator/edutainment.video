import {google} from "@google-cloud/speech/build/protos/protos";
import ISpeechRecognitionResult = google.cloud.speech.v1.ISpeechRecognitionResult;

const NANOS_PER_SECOND = 1e9;

/**
 * God I hate typescript
 * https://github.com/microsoft/TypeScript/issues/20707
 */
function notNullOrUndefined<T>(x: T | null | undefined): x is T {
  return typeof x !== "undefined" && x !== null;
}

export class Word {
  constructor(public word: string, public time: number) {
  }
}

export class Transcript {
  public words: Word[] = [];

  constructor(results: ISpeechRecognitionResult[]) {
    // All this this nonsense just converts from GCP's overly complex format to an array of Words
    const firstAlternatives = results.filter(notNullOrUndefined).map(result => result?.alternatives && result.alternatives[0]);
    for (const alt of firstAlternatives) {
      if (!alt || !alt.words) {
        continue;
      }
      for (const word of alt.words) {
        if (!word || !word.word || !word.startTime) {
          console.error(`Wrong type for word`);
          console.log(word);
        }
        else if(word.startTime.seconds && typeof word.startTime.seconds !== "number" && typeof word.startTime.seconds !== "string") {
          this.words.push(new Word(word.word, word.startTime.seconds.low));
        } else if(word.startTime.nanos) {
          this.words.push(new Word(word.word, word.startTime.nanos / NANOS_PER_SECOND));
        } else {
          console.error(`Wrong type for word`);
          console.log(word);
        }
      }
    }
  }

  pickKeyWords() {
    return this.words.filter((w,i) => i === 0 || Math.random() > 0.4);
  }
}
