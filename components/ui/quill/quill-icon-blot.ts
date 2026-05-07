import Quill from "quill"

const Embed = Quill.import("blots/embed")

class LucideIconBlot extends Embed {
  static create(value: string) {
    const node = super.create() as HTMLElement
    // Set a class so we can identify it later
    node.setAttribute("class", "lucide-icon-inline inline-flex items-center align-middle mx-1")
    node.innerHTML = value
    return node
  }

  static value(node: HTMLElement) {
    return node.innerHTML
  }
}

LucideIconBlot.blotName = "lucideIcon"
LucideIconBlot.tagName = "span"

export default LucideIconBlot
