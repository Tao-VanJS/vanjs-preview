import {parse} from "https://deno.land/std@0.206.0/yaml/mod.ts"

const inputFile = Deno.args[0]
const data = parse(Deno.readTextFileSync(inputFile))

console.log(JSON.stringify(data, null, 2))
