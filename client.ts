const server = "http://localhost:8000/"

console.log(await fetch(server + "gen-preview-url", {method: "POST", headers: {'Content-Type': 'application/json'}, body: Deno.readTextFileSync("sample2.json")}).then(r => r.text()))
