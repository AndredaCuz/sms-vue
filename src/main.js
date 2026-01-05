import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const app=createApp(App)
app.use(router)



// Ícones que você vai usar
import { faPaperPlane, faWallet, faUserPlus, faUsers, faAddressBook } from '@fortawesome/free-solid-svg-icons'

library.add(faPaperPlane, faWallet, faUserPlus, faUsers, faAddressBook)


app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')