<template>
  <img :class="className" :src="imgSrc" />
</template>

<script>
const defaultImg = require('@/assets/images/default.png')

export default {
  props: {
    src: {
      type: String,
      default: '',
    },
    className: {
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
