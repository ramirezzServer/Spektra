const targets = [
  { name: 'web', url: process.env.WEB_URL, required: ['x-content-type-options', 'referrer-policy'] },
  { name: 'api', url: process.env.API_URL, required: ['x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy'] },
  { name: 'worker', url: process.env.WORKER_URL, required: [] },
].filter((target) => target.url);

if (!targets.length) {
  console.log('Set WEB_URL, API_URL, or WORKER_URL to check response headers.');
  process.exit(0);
}

let criticalFailures = 0;

for (const target of targets) {
  try {
    const response = await fetch(target.url);
    console.log(`\n${target.name}: ${target.url}`);
    console.log(`status: ${response.status}`);

    const poweredBy = response.headers.get('x-powered-by');
    if (poweredBy) {
      console.warn(`warning: x-powered-by is present (${poweredBy})`);
    }

    const server = response.headers.get('server');
    if (server) {
      console.log(`server: ${server} (may be controlled by hosting provider or reverse proxy)`);
    }

    for (const header of target.required) {
      const value = response.headers.get(header);
      if (value) {
        console.log(`${header}: ${value}`);
      } else {
        criticalFailures += 1;
        console.error(`missing: ${header}`);
      }
    }
  } catch (error) {
    console.warn(`\n${target.name}: could not reach ${target.url}`);
    console.warn(error instanceof Error ? error.message : error);
  }
}

process.exitCode = criticalFailures ? 1 : 0;
