import React from "react"
import { createRoot } from "react-dom/client"

import Button from "./ui/Button"
import Card from "./ui/Card"
import Badge from "./ui/Badge"
import Input from "./ui/Input"

// Registry — add your React components here to make them mountable from ERB
const COMPONENTS = { Button, Card, Badge, Input }

// Mount all [data-react-component] elements on page load and after Turbo navigations
function mountComponents() {
  document.querySelectorAll("[data-react-component]").forEach((el) => {
    if (el.dataset.reactMounted) return
    const name = el.dataset.reactComponent
    const props = JSON.parse(el.dataset.reactProps || "{}")
    const Component = COMPONENTS[name]
    if (!Component) {
      console.warn(`[mantis] Unknown React component: "${name}"`)
      return
    }
    createRoot(el).render(React.createElement(Component, props))
    el.dataset.reactMounted = "true"
  })
}

document.addEventListener("DOMContentLoaded", mountComponents)
document.addEventListener("turbo:render", mountComponents)
