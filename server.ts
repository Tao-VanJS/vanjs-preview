Deno.serve(req => {
  const previewPattern = new URLPattern({pathname: "/:key"})
  const match = previewPattern.exec(req.url)
  if (match) return new Response("Hello " + match.pathname.groups.key)
  return new Response("Not Found", {status: 404})
})
