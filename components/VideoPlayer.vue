<template>
    <video class="w-100 mt-5" v-if="status === 'done'" controls>
      <source :src="videoURL" type="video/mp4">
    </video>
</template>

<script>
    import {mapState} from 'vuex';
    export default {
        name: "VideoPlayer",
        computed: {
            ...mapState('processing', ['status','videoURL'])
        }
    }
</script>

<style scoped>

</style>
