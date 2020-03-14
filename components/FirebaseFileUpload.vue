<template>
  <FileUploadForm @new-file="onFileUpload"/>
</template>

<script>
    import FileUploadForm from './FileUploadForm'

    export default {
        name: "FirebaseFileUpload",
        components: {
            FileUploadForm,
        },
        methods: {
            onFileUpload(file) {
                console.log(file)
            }
        }
    }
</script>

<style scoped>

</style>
