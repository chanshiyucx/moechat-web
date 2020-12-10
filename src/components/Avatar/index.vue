<template>
  <img :src="src" alt="avatar" />
</template>

<script>
const avatarList = [
  '//i.loli.net/2020/12/09/5OemM6WSxDAQjXR.jpg',
  '//i.loli.net/2020/12/09/fbSl8UzQv6dJYwB.jpg',
  '//i.loli.net/2020/12/09/JRIPeYlfvA9DOab.jpg',
  '//i.loli.net/2020/12/09/9nPhFNpfGoISXmT.jpg',
  '//i.loli.net/2020/12/09/pnPIovcVbO6JyzW.jpg',
  '//i.loli.net/2020/12/09/DJGUcmTgsfXY8q2.jpg',
  '//i.loli.net/2020/12/09/7pqaVlJUEe2O3kt.jpg',
  '//i.loli.net/2020/12/09/ZHWPoAReSBah54t.jpg',
  '//i.loli.net/2020/12/09/wElGo52n7OCXA16.jpg',
  '//i.loli.net/2020/12/09/FfP7KwqvhRzBb4E.jpg',
  '//i.loli.net/2020/12/09/AMuiponSkRINXvW.jpg',
  '//i.loli.net/2020/12/09/cpzKjDILHFQB2fR.jpg',
  '//i.loli.net/2020/12/09/SxqFuEJpVIHUAsg.jpg',
  '//i.loli.net/2020/12/09/MH849sTlDctVX2m.jpg',
  '//i.loli.net/2020/12/09/igBT7DANvPdtohr.jpg',
  '//i.loli.net/2020/12/09/9ghM1ZtP8LVTGle.jpg',
  '//i.loli.net/2020/12/09/TpUH7x84LXRdzyF.jpg',
  '//i.loli.net/2020/12/09/L873Tcml9YXaDVw.jpg',
  '//i.loli.net/2020/12/09/pyouP2rX9OQFbxZ.jpg',
  '//i.loli.net/2020/12/09/5BCMAtGdUT8VkfW.jpg',
  '//i.loli.net/2020/12/09/D1v7p45HNySdXRn.jpg',
  '//i.loli.net/2020/12/09/MvQV9sePNy46KTH.jpg',
  '//i.loli.net/2020/12/09/4zkVYecxJyTr5Ua.jpg',
  '//i.loli.net/2020/12/09/aRkuH2CDLQ3Otd7.jpg',
]

export default {
  name: 'Avatar',
  props: {
    userId: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  computed: {
    src() {
      if (this.avatar) return this.avatar
      return avatarList[+this.userId % avatarList.length]
    },
  },
}
</script>
