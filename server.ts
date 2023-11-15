/// <reference lib="deno.unstable" />

import { toArrayBuffer } from "https://deno.land/std@0.206.0/streams/mod.ts";

const GEN_PREVIEW_URL_PATTERN = new URLPattern({pathname: "/gen-preview-url"})
const PREVIEW_PATTERN = new URLPattern({pathname: "/:key"})
const decoder = new TextDecoder

const kv = await Deno.openKv()

const randomKey = () => Math.random().toString(36).substring(6)

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
    return new Response(value)
  }
  return new Response("Not Found", {status: 404})
})
