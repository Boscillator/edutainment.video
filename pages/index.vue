<template>
  <div class="container">
    <h1>Hello world!</h1>
    <FileUploadForm />
  </div>
</template>

<script>
    import Logo from '~/components/Logo.vue'
    import FileUploadForm from '../components/FileUploadForm'

    export default {
        components: {
            FileUploadForm,
            Logo,
        },
    }
</script>

<style>
</style>
