// console.log(await fetch("http://localhost:8000/gen-preview-url", {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({js: "document.body.append('Hello')\nconsole.log(123)"})}).then(r => r.text()))
// console.log(await fetch("https://vanjs-preview.deno.dev/gen-preview-url", {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({js: "document.body.append('Hello')\nconsole.log(123)"})}).then(r => r.text()))
console.log(await fetch("https://api.vanjs.org/gen-preview-url", {method: "POST", headers: {'Content-Type': 'application/json'}, body: Deno.readTextFileSync("sample.json")}).then(r => r.text()))
