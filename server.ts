/// <reference lib="deno.unstable" />

const GEN_PREVIEW_URL_PATTERN = new URLPattern({pathname: "/gen-preview-url"})
const PREVIEW_PATTERN = new URLPattern({pathname: "/:key"})

const kv = await Deno.openKv()

const randomKey = () => Math.random().toString(36).substring(6)

const escapeAttr = (v: string) => v.replaceAll('"', "&quot;")

const template = await Deno.readTextFile("./template.html")

Deno.serve(async req => {
  if (req.method === "POST" && GEN_PREVIEW_URL_PATTERN.test(req.url)) {
    const data = await req.text()
    const key = randomKey()
    // console.log({key, data})
    kv.set([key], data, {expireIn: 86400 * 1000})
    return new Response("https://vanjs-preview.deno.dev/" + key)
  }

  const match = PREVIEW_PATTERN.exec(req.url)
  if (match) {
    const key = match.pathname.groups.key!
    const {value} = await kv.get<string>([key])
    // console.log({key, value})
    if (!value) return new Response("Invalid or expired link", {status: 404})
    const data = {
      ...JSON.parse(value),
      js_external: "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.2.6.nomodule.min.js",
    }
    return new Response(
      template.replace("{{value}}", JSON.stringify(escapeAttr(JSON.stringify(data)))),
      {status: 200, headers: {"content-type": "text/html; charset=utf-8"}})
  }
  return new Response("Not Found", {status: 404})
})
