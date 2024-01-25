import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.js'


const apiURL = 'http://localhost:5000'

const app = createApp(App)

app.use(router)
app.provide('apiURL', apiURL)


app.mount('#app')
