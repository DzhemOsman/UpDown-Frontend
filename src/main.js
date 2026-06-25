import { createApp } from 'vue'
import App from './App.vue'

import './style.css'

// PrimeVue Core und Design-System (Aura) importieren
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

import Tooltip from 'primevue/tooltip'

const app = createApp(App)

// PrimeVue mit Aura-Theme registrieren
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            // Wichtig damit tailwind theme nicht ungewollt überschreibt
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            }
        }
    }
})

// v-tooltip Direktive registrieren (Erklärungen, wenn man drüber hovert)
app.directive('tooltip', Tooltip)

app.mount('#app')