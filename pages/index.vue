<template>
  <div class="container">
    <h1>Hello world!</h1>
    <FirebaseFileUpload/>
  </div>
</template>

<script>
    import Logo from '~/components/Logo.vue'
    import FirebaseFileUpload from '../components/FirebaseFileUpload'

    export default {
        components: {
            FirebaseFileUpload,
            Logo,
        },
    }
</script>

<style>
</style>
