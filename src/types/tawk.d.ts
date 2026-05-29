export {}

declare global {
  interface Window {
    Tawk_API?: {
      maximize?: () => void
      minimize?: () => void
      toggle?: () => void
      hideWidget?: () => void
      showWidget?: () => void
      setAttributes?: (
        attributes: { name?: string; email?: string; [key: string]: string | undefined },
        callback?: (error?: Error) => void,
      ) => void
      onLoad?: () => void
    }
    Tawk_LoadStart?: Date
  }
}
