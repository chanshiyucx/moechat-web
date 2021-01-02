<template>
  <div class="avatar-cropper">
    <div class="avatar-cropper-overlay" :class="{ 'avatar-cropper-overlay-inline': inline }" v-if="dataUrl">
      <div class="avatar-cropper-mark" v-if="!inline"></div>
      <div class="avatar-cropper-container">
        <div class="avatar-cropper-image-container">
          <img :src="dataUrl" @load.stop="createCropper" alt ref="img" />
        </div>
        <div class="avatar-cropper-footer">
          <button @click.stop.prevent="cancel" class="avatar-cropper-btn">取消</button>
          <button @click.stop.prevent="submit" class="avatar-cropper-btn">提交</button>
        </div>
      </div>
    </div>
    <input :accept="mimes" class="avatar-cropper-img-input" ref="input" type="file" />
  </div>
</template>

<script>
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'
import config from '@/config'

export default {
  props: {
    trigger: {
      type: [String, Element],
      required: true,
    },
  },
  data() {
    return {
      cropper: undefined,
      dataUrl: undefined,
      filename: undefined,
      inline: false,
      withCredentials: false,
      outputMime: null,
      mimes: 'image/png, image/gif, image/jpeg, image/bmp',
      uploadFormName: 'image',
      uploadUrl: config.imgurAPI,
      uploadHeaders: {
        Authorization: 'Client-ID ' + config.imgurID,
      },
      outputOptions: {
        width: 200,
        height: 200,
      },
      outputQuality: 0.9,
      cropperOptions: {
        aspectRatio: 1,
        autoCropArea: 1,
        viewMode: 1,
        movable: false,
        zoomable: false,
      },
    }
  },
  mounted() {
    // listen for click event on trigger
    const trigger = typeof this.trigger === 'object' ? this.trigger : document.querySelector(this.trigger)
    if (!trigger) {
      this.$emit('error', 'No avatar make trigger found.', 'user')
    } else {
      trigger.addEventListener('click', this.pickImage)
    }

    // listen for input file changes
    const fileInput = this.$refs.input
    fileInput.addEventListener('change', () => {
      if (fileInput.files != null && fileInput.files[0] != null) {
        const correctType = this.mimes.split(', ').find((m) => m === fileInput.files[0].type)
        if (!correctType) {
          this.$emit('error', 'File type not correct.', 'user')
          return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
          this.dataUrl = e.target.result
        }
        reader.readAsDataURL(fileInput.files[0])

        this.filename = fileInput.files[0].name || 'unknown'
        this.mimeType = this.mimeType || fileInput.files[0].type
        this.$emit('changed', fileInput.files[0], reader)
      }
    })
  },
  methods: {
    destroy() {
      this.cropper.destroy()
      this.$refs.input.value = ''
      this.dataUrl = undefined
    },
    submit() {
      this.$emit('submit')
      if (this.uploadUrl) {
        this.uploadImage()
      } else {
        this.$emit('error', 'No upload handler found.', 'user')
      }
      this.destroy()
    },
    cancel() {
      this.$emit('cancel')
      this.destroy()
    },
    pickImage(e) {
      this.$refs.input.click()
      e.preventDefault()
      e.stopPropagation()
    },
    createCropper() {
      this.cropper = new Cropper(this.$refs.img, this.cropperOptions)
    },
    uploadImage() {
      this.cropper.getCroppedCanvas(this.outputOptions).toBlob(
        (blob) => {
          const form = new FormData()
          const xhr = new XMLHttpRequest()
          const data = {}

          xhr.withCredentials = this.withCredentials
          for (let key in data) {
            form.append(key, data[key])
          }

          form.append(this.uploadFormName, blob, this.filename)

          this.$emit('uploading', form, xhr)

          xhr.open('POST', this.uploadUrl, true)

          for (let header in this.uploadHeaders) {
            xhr.setRequestHeader(header, this.uploadHeaders[header])
          }

          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              let response = ''
              try {
                response = JSON.parse(xhr.responseText)
              } catch (err) {
                response = xhr.responseText
              }
              this.$emit('completed', response, form, xhr)

              if ([200, 201, 204].indexOf(xhr.status) > -1) {
                this.$emit('uploaded', response, form, xhr)
              } else {
                this.$emit('error', 'Image upload fail.', 'upload', xhr)
              }
            }
          }
          xhr.send(form)
        },
        this.outputMime,
        this.outputQuality
      )
    },
  },
}
</script>

<style lang="scss" scope>
@import './index.scss';
</style>
