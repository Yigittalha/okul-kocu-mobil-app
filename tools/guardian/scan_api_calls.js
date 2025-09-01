#!/usr/bin/env node
// Basit ama etkili sözleşme denetimi: axios/api çağrılarını sözleşmeyle karşılaştır
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CONTRACT = path.join(ROOT, "tools/guardian/api_contract.json");
if (!fs.existsSync(CONTRACT)) {
  console.log("[verify] api_contract.json yok; sözleşme denetimi atlandı.");
  process.exit(0);
}

const spec = JSON.parse(fs.readFileSync(CONTRACT, "utf8")); // { "/examdelete": "post", "/student/homework": "post", ... }
const allowed = new Map(
  Object.entries(spec).map(([p, m]) => [
    p.trim(),
    String(m).toLowerCase().trim(),
  ]),
);
const SRC = path.join(ROOT, "src");

function scanFile(fp, arr) {
  const txt = fs.readFileSync(fp, "utf8");
  // axios.<meth>('...') veya api.<meth>('...')
  const re =
    /\b(?:axios|api)\s*\.\s*(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  let m;
  while ((m = re.exec(txt))) {
    const method = m[1].toLowerCase();
    let url = m[2];
    // sadece yol parçaları; query/base çıkarılabilir
    if (url.startsWith("http")) {
      arr.push({ file: fp, method, url, ok: true });
      continue;
    }
    // normalize: baştaki base'i /api gibi düşürme (projeye göre uyarlanabilir)
    url = url.replace(/^\./, "").trim();
    const specMethod = allowed.get(url);
    if (!specMethod)
      arr.push({
        file: fp,
        method,
        url,
        ok: false,
        why: "endpoint-not-in-contract",
      });
    else if (specMethod !== method)
      arr.push({
        file: fp,
        method,
        url,
        ok: false,
        why: `method-mismatch: expected ${specMethod}`,
      });
    else arr.push({ file: fp, method, url, ok: true });
  }
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(js|jsx|ts|tsx)$/.test(e.name)) scanFile(p, out);
  }
  return out;
}

const hits = fs.existsSync(SRC) ? walk(SRC, []) : [];
const bad = hits.filter((h) => !h.ok);
if (bad.length) {
  console.error("[verify] API contract violations:");
  for (const b of bad.slice(0, 30)) {
    console.error(
      ` - ${b.file}: ${b.method.toUpperCase()} ${b.url} (${b.why})`,
    );
  }
  process.exit(1);
} else {
  console.log("[verify] API contract OK");
}
