import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="hello"
export default class extends Controller {
  static targets = ["name", "output"]

  greet() {
    const name = this.nameTarget.value.trim() || "world"
    this.outputTarget.textContent = `Hello, ${name}!`
  }
}
