<template>
  <img :src="imgSrc" alt :width="width" :height="height" />
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: ''
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  data() {
    return {
      defaultImg: require('@/assets/images/default.png'),
      imgSrc: ''
    }
  },
  mounted() {
    this.imgSrc = this.defaultImg
    const img = new Image()
    img.onload = () => {
      this.imgSrc = this.src
    }
    img.src = this.src
  }
}
</script>
