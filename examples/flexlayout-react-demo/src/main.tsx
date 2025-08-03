import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"
import { AppContextProvider } from "./Context"

import "prismjs/themes/prism-coy.css"

ReactDOM.createRoot(document.getElementById("container") as HTMLElement).render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>
)
