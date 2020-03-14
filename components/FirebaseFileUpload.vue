<template>
  <FileUploadForm @new-file="onFileUpload"/>
</template>

<script>
    import FileUploadForm from './FileUploadForm'
    import {v4 as uuidv4} from 'uuid'

    const UPLOAD_PREFIX = '/uploads/audio'

    export default {
        name: "FirebaseFileUpload",
        components: {
            FileUploadForm,
        },
        methods: {
            onFileUpload(file) {
                // Generate a uuid for the file
                const id = uuidv4()

                // get the extension from the file or empty string if it has none
                // see https://stackoverflow.com/a/680982
                const extention = /(?:\.([^.]+))?$/.exec(file.name)[1] || ""

                // create reference and upload
                const ref = this.$storage.ref(`${UPLOAD_PREFIX}/${id}.${extention}`)
                ref.put(file)
                console.log("Writing file to " + ref.fullPath)
            },
        },
    }
</script>

<style scoped>

</style>
