<template>
  <div>
    <b-input-group>
      <b-form-file
        v-model="file"
        :state="Boolean(file)"
        placeholder="Choose an audio file or drop it here..."
        drop-placeholder="Drop file here..."
        accept=".wav"
      />
      <b-input-group-append>
        <b-button @click="submit">Upload!</b-button>
      </b-input-group-append>
    </b-input-group>
    <b-progress class="w-100" v-if="status === 'uploading'" :value="progress" max="100" show-progress></b-progress>
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
