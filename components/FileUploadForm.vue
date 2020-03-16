<template>
  <div>
    <b-input-group>
      <b-form-file
        v-model="file"
        :state="Boolean(file)"
        placeholder="Choose an audio file or drop it here..."
        drop-placeholder="Drop file here..."
        accept=".wav,.mp3"
      />
      <b-input-group-append>
        <b-button @click="submit">Upload!</b-button>
      </b-input-group-append>
    </b-input-group>
    <b-progress class="w-100 mt-1" v-if="status === 'uploading'" :value="progress" max="100" show-progress></b-progress>
    <b-progress class="w-100 mt-1" variant="success" v-if="status === 'processing'" value="1" max="1" animated>
      <b-progress-bar value="1">Generating Video</b-progress-bar>
    </b-progress>
  </div>
</template>
<script>
  import {mapState} from 'vuex'
    export default {
        name: 'FileUploadForm',
        data() {
            return {
                file: null,
            }
        },
        methods: {
            submit() {
                this.$store.dispatch("processing/upload", {file: this.file});
            },
        },
        computed: {
            ...mapState('processing', ['status', 'progress'])
        }
    }
</script>
