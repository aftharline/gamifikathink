import type { DetailedHTMLProps, HTMLAttributes, Ref } from "react"

export interface ModelViewerElementAttributes
  extends HTMLAttributes<HTMLElement> {
  src?: string
  "ios-src"?: string
  poster?: string
  ar?: boolean
  "ar-modes"?: string
  "ar-scale"?: string
  "camera-controls"?: boolean
  "camera-target"?: string
  "camera-orbit"?: string
  "field-of-view"?: string
  "min-camera-orbit"?: string
  "max-camera-orbit"?: string
  "auto-rotate"?: boolean
  "animation-name"?: string
  autoplay?: boolean
  loading?: "auto" | "lazy" | "eager"
  reveal?: "auto" | "interaction" | "manual"
  "shadow-intensity"?: string
  exposure?: string
  "interaction-prompt"?: string
  "data-name"?: string
}

export interface ModelViewerElement extends HTMLElement {
  availableAnimations: string[]
  animationName: string
  paused: boolean
  play: () => void
  pause: () => void
  activateAR: () => void
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        ModelViewerElementAttributes,
        HTMLElement
      > & {
        ref?: Ref<ModelViewerElement>
      }
    }
  }
}
