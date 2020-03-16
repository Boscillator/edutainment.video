<template>
  <div class="container">
    <h1 class="display-4 mb-4">Speech-to-Slideshow</h1>
    <FileUploadForm />
    <VideoPlayer />
  </div>
</template>

<script>
    import Logo from '~/components/Logo.vue'
    import FileUploadForm from '../components/FileUploadForm'
    import VideoPlayer from '../components/VideoPlayer'

    export default {
        components: {
            VideoPlayer,
            FileUploadForm,
            Logo,
        },
    }
</script>

<style>
</style>
