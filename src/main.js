import Vue from 'vue'
import App from './App.vue'
import './styles/index.scss'
import './assets/font/fontello.scss'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
