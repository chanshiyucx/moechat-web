import Vue from 'vue'
import Toasted from 'vue-toasted'
import App from './App.vue'

// Layout and Font
import '@/styles/index.scss'
import '@/assets/font/fontello.scss'

Vue.config.productionTip = false

Vue.use(Toasted, { theme: 'bubble', position: 'top-center', duration: 3000 })

new Vue({
  render: (h) => h(App),
}).$mount('#app')
