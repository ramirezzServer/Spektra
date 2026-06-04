const defaultProtocols = new Set(['http:', 'https:']);

export function safeUrl(value: string | null | undefined, fallback: string | null = null, options: { allowMailto?: boolean } = {}): string | null {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    const allowedProtocols = options.allowMailto ? new Set([...defaultProtocols, 'mailto:']) : defaultProtocols;
    return allowedProtocols.has(parsed.protocol) ? trimmed : fallback;
  } catch {
    return fallback;
  }
}
