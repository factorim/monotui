import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(() => {
  const port = Number(process.env.PORT ?? "3000")

  return {
    plugins: [react()],
    server: {
      host: true,
      port,
    },
    preview: {
      host: true,
      port,
    },
  }
})
