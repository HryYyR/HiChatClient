import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import axios from "axios"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import Vue3EmojiPicker from 'vue3-emoji-picker';
// import router from './router/router'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'


// export const wsurl = "127.0.0.1"
// export const fileurl = '127.0.0.1'
// export const staticurl = "127.0.0.1"
// axios.defaults.baseURL = "http://127.0.0.1"

export const wsurl = "10.235.102.151"
export const fileurl = '10.235.102.151'
export const staticurl = "10.235.102.151"
axios.defaults.baseURL = "http://10.235.102.151"

// export const wsurl = "192.168.137.1"
// export const fileurl = '192.168.137.1'
// export const staticurl = "192.168.137.1"
// axios.defaults.baseURL = "http://192.168.137.1"

// export const wsurl = "203.195.163.23"
// export const fileurl = '203.195.163.23'
// export const staticurl = "203.195.163.23"
// axios.defaults.baseURL = "http://203.195.163.23"




axios.defaults.timeout = 4000;

// http request 请求拦截器
axios.interceptors.request.use(
    config => {
        // 这里判断localStorage里面是否存在token，如果有则在请求头里面设置
        if (localStorage.getItem("token")) {
            config.headers.Authorization = localStorage.getItem("token");
        }
        return config
    },
    err => {
        return err.response
    }
);

// // http response 响应拦截器
// axios.interceptors.response.use(
//     response => {
//         if (response.status != 200) {
//             return response.data.msg
//         }
//         return response
//     })


const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus)
app.use(ContextMenu)

app.component('Vue3EmojiPicker', Vue3EmojiPicker);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
// app.use(router)
app.mount('#app')
