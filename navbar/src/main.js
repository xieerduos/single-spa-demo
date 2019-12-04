import './set-public-path'
import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from './store'
import singleSpaVue from 'single-spa-vue'
Vue.config.productionTip = false

// new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    router,
    store,
    render: h => h(App)
  }
})

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount
