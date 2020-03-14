<template>
  <div>
    <b-form-file
      v-model="file"
      :state="Boolean(file)"
      placeholder="Choose an audio file or drop it here..."
      drop-placeholder="Drop file here..."
      accept=".wav"
    />
    <b-button @click="submit">Upload!</b-button>
  </div>
</template>
<script>
    export default {
        name: 'FileUploadForm',
        data() {
            return {
                file: null,
            }
        },
        methods: {
            submit() {
                this.$emit('new-file', this.file)
            },
        },
    }
</script>
