import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const scanRoots = ['apps/api/app', 'apps/api/routes', 'apps/api/database/migrations', 'apps/web/src', 'apps/web/public', 'apps/worker'];
const ignoredDirs = new Set(['node_modules', 'dist', 'vendor', '.git', 'storage']);
const sourceExtensions = new Set(['.php', '.ts', '.tsx', '.js', '.jsx', '.py', '.txt', '.conf']);

const checks = [
  {
    label: 'Raw SQL review',
    severity: 'REVIEW',
    pattern: /\b(DB::select|DB::statement|DB::raw|whereRaw|orderByRaw|havingRaw|selectRaw|updateRaw|pool\.(execute|fetch|fetchrow|fetchval)|conn\.execute)\b/,
  },
  {
    label: 'Unsafe HTML rendering',
    severity: 'FAIL',
    pattern: /\b(dangerouslySetInnerHTML|insertAdjacentHTML|document\.write|DOMParser)\b|\.innerHTML\s*=/,
  },
  {
    label: 'File upload surface',
    severity: 'REVIEW',
    pattern: /<input[^>]+type=["']file["']|multipart\/form-data|UploadedFile|Storage::put|storeAs\(/i,
  },
  {
    label: 'New tab/window surface',
    severity: 'REVIEW',
    pattern: /target=["']_blank["']|window\.open\(/,
  },
  {
    label: 'Unsafe javascript URL literal',
    severity: 'FAIL',
    pattern: /javascript:/i,
  },
];

async function collectFiles(dir) {
  const absolute = path.join(root, dir);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(relative));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(relative);
    }
  }

  return files;
}

let failCount = 0;
let reviewCount = 0;

for (const dir of scanRoots) {
  let files = [];
  try {
    files = await collectFiles(dir);
  } catch {
    continue;
  }

  for (const file of files) {
    const content = await readFile(path.join(root, file), 'utf8');
    const lines = content.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      for (const check of checks) {
        if (!check.pattern.test(line)) continue;
        if (check.severity === 'FAIL') {
          failCount += 1;
        } else {
          reviewCount += 1;
        }
        console.log(`${check.severity}: ${check.label}: ${file}:${index + 1}`);
      }
    }
  }
}

if (!failCount && !reviewCount) {
  console.log('PASS: no suspicious security patterns found.');
} else {
  console.log(`\nSummary: ${failCount} fail finding(s), ${reviewCount} review finding(s).`);
}

process.exitCode = failCount > 0 ? 1 : 0;
