import express from "express"

const app = express()

app.get("/", (_req, res) => {
  res.type("text").send("ok")
})

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

const port = Number(process.env.PORT ?? "3002")
app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`)
})
