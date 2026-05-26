/// <reference types="vite/client" />

declare module '*.private?url' {
  const url: string
  export default url
}

declare module '*.id?url' {
  const url: string
  export default url
}
