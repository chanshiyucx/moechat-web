<template>
  <div class="lazy-img">
    <img :src="imgSrc" />
    <Loading />
  </div>
</template>

<script>
import Loading from '../Loading'
const defaultImg = require('@/assets/images/default.png')

export default {
  components: { Loading },
  props: {
    src: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      imgSrc: defaultImg,
    }
  },
  watch: {
    src: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadImg()
        }
      },
    },
  },
  methods: {
    loadImg() {
      const img = new Image()
      img.onerror = () => {
        this.$toasted.error('图片加载失败')
      }
      img.onload = () => {
        this.imgSrc = this.src
        this.$emit('onload')
      }
      img.src = this.src
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
