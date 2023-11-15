const body = JSON.stringify({js: `van.add(document.body, div("Hello"))`})
console.log({body})

await fetch("http://localhost:8000/gen-preview-url", {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({js: "document.body.append('Hello')"})}).then(r => r.text())
