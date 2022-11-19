import React from 'react'
import { SWRConfig } from 'swr'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NotificationsProvider } from '@mantine/notifications'
import { BrowserRouter } from 'react-router-dom'

import './main.css'
import { App } from './components/app'
import store from './store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <Provider store={store}>
        <ModalsProvider>
          <NotificationsProvider>
            <BrowserRouter>
              <SWRConfig>
                <App />
              </SWRConfig>
            </BrowserRouter>
          </NotificationsProvider>
        </ModalsProvider>
      </Provider>
    </MantineProvider>
  </React.StrictMode>
)
