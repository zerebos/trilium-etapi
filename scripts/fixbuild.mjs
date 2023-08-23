import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from 'node:url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

fs.writeFileSync(path.join(__dirname, "..", "lib", "cjs", "package.json"), JSON.stringify({type: "commonjs"}));
fs.writeFileSync(path.join(__dirname, "..", "lib", "esm", "package.json"), JSON.stringify({type: "module"}));

// const updated = fs.readFileSync(path.join(__dirname, "..", "lib", "cjs", "index.js")).toString().replace("exports.default", "module.exports");
// fs.writeFileSync(path.join(__dirname, "..", "lib", "cjs", "index.js"), updated);