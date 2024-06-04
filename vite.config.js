import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/jaxs-bus.ts'),
      name: 'jaxs-bus',
      fileName: 'jaxs-bus'
    }
  }
})
