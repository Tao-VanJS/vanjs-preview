/// <reference lib="deno.unstable" />

const GEN_PREVIEW_URL_PATTERN = new URLPattern({pathname: "/gen-preview-url"})
const JSFIDDLE_PREVIEW_PATTERN = new URLPattern({pathname: "/jsfiddle/:key"})
const CODEPEN_PREVIEW_PATTERN = new URLPattern({pathname: "/codepen/:key"})
const PRIVACY_PATTERN = new URLPattern({pathname: "/privacy"})

const kv = await Deno.openKv()

const randomKey = () => Math.random().toString(36).substring(6)

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
}

const escapeText = (s: string) => s.replace(/[&<>]/g, tag => escapeMap[tag] || tag)

const jsfiddleTemplate = await Deno.readTextFile("./jsfiddle-template.html")
const template = await Deno.readTextFile("./template.html")
const privacy = await Deno.readTextFile("./privacy")

Deno.serve(async req => {
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request")
    return new Response(
      null,
      {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        },
      },
    )
  }
  if (req.method === "GET" && PRIVACY_PATTERN.test(req.url)) {
    return new Response(privacy)
  }
  if (req.method === "POST" && GEN_PREVIEW_URL_PATTERN.test(req.url)) {
    const data = await req.text()
    const key = randomKey()
    console.log({key, data})
    kv.set([key], data, {expireIn: 86400 * 1000})
    const url = new URL(req.url)
    return new Response(
      JSON.stringify(`https://${url.hostname}/codepen/${key}`),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
          "Content-Type": "text/json; charset=utf-8",
        },
      },
    )
  }
  {
    const match = JSFIDDLE_PREVIEW_PATTERN.exec(req.url)
    if (match) {
      const key = match.pathname.groups.key!
      const {value} = await kv.get<string>([key])
      console.log({op: "jsfiddle", key, value})
      if (!value) return new Response("Invalid or expired link", {status: 404})
      const json = JSON.parse(value)
      return new Response(
        jsfiddleTemplate
          .replace("{{js}}", escapeText(json.js ?? ""))
          .replace("{{css}}", escapeText(json.css ?? ""))
          .replace("{{html}}", escapeText(json.html ?? "")),
        {status: 200, headers: {"Content-Type": "text/html; charset=utf-8"}},
      )
    }
  }
  {
    const match = CODEPEN_PREVIEW_PATTERN.exec(req.url)
    if (match) {
      const key = match.pathname.groups.key!
      const {value} = await kv.get<string>([key])
      console.log({key, value})
      if (!value) return new Response("Invalid or expired link", {status: 404})
      const data = {
        ...JSON.parse(value),
        js_external: "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.5.5.nomodule.min.js",
      }
      return new Response(
        template.replace("{{value}}", escapeText(JSON.stringify(data))),
        {status: 200, headers: {"Content-Type": "text/html; charset=utf-8"}})
    }
  }
  return new Response("Not Found", {status: 404})
})
