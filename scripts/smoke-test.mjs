const checks = [
  { name: 'web', url: process.env.WEB_URL },
  { name: 'api', url: process.env.API_URL ? `${process.env.API_URL.replace(/\/$/, '')}/health` : undefined },
  { name: 'worker', url: process.env.WORKER_URL ? `${process.env.WORKER_URL.replace(/\/$/, '')}/health` : undefined, optional: true },
];

let failed = false;

async function check({ name, url, optional = false }) {
  if (!url) {
    if (!optional) {
      console.error(`Missing ${name.toUpperCase()}_URL.`);
      failed = true;
    }
    return;
  }

  try {
    const response = await fetch(url, { redirect: 'manual' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (name !== 'web') {
      const body = await response.json();
      if (body.status !== 'ok') {
        throw new Error(`Unexpected status: ${body.status}`);
      }
    }

    console.log(`OK ${name}: ${url}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${name}: ${url}`);
    console.error(error instanceof Error ? error.message : error);
  }
}

for (const item of checks) {
  await check(item);
}

if (failed) {
  process.exit(1);
}
