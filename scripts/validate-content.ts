import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root = join(process.cwd(), "content");
let errors = 0;
let checked = 0;

async function files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await files(path));
    else if (extname(entry.name) === ".json") out.push(path);
  }
  return out;
}

function requireField(value: unknown, field: string, file: string) {
  if (value === undefined || value === null || value === "") {
    console.error(`✗ ${file}: missing ${field}`);
    errors++;
  }
}

for (const file of await files(root)) {
  checked++;
  let data: unknown;
  try { data = JSON.parse(await readFile(file, "utf8")); }
  catch (error) { console.error(`✗ ${file}: invalid JSON`, error); errors++; continue; }
  const items = Array.isArray(data) ? data : [data];
  if (file.includes("/vocabulary/") || file.includes("\\vocabulary\\")) {
    for (const item of items as Record<string, unknown>[]) {
      requireField(item.german, "german", file); requireField(item.arabic, "arabic", file); requireField(item.exampleDe, "exampleDe", file); requireField(item.exampleAr, "exampleAr", file);
    }
  }
  if (file.includes("/grammar/") || file.includes("\\grammar\\")) {
    for (const item of items as Record<string, unknown>[]) { requireField(item.title, "title", file); requireField(item.explanationAr, "explanationAr", file); requireField(item.examples, "examples", file); }
  }
  if (file.includes("/reading-texts/") || file.includes("\\reading-texts\\")) {
    for (const item of items as Record<string, unknown>[]) { requireField(item.germanText, "germanText", file); requireField(item.arabicTranslation, "arabicTranslation", file); requireField(item.questions, "questions", file); }
  }
  if (file.includes("/listening/") || file.includes("\\listening\\")) {
    for (const item of items as Record<string, unknown>[]) { requireField(item.transcript, "transcript", file); requireField(item.arabicTranslation, "arabicTranslation", file); }
  }
}

if (errors) { console.error(`\nContent validation failed: ${errors} issue(s) in ${checked} JSON file(s).`); process.exit(1); }
console.log(`✓ Content validation passed for ${checked} JSON file(s).`);
