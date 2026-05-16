const DEFAULT_ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

interface SafeUrlOptions {
  allowedHosts?: string[];
  allowedProtocols?: string[];
}

function hostMatches(hostname: string, allowedHost: string) {
  return hostname === allowedHost || hostname.endsWith(`.${allowedHost}`);
}

export function safeExternalUrl(
  value: string | null | undefined,
  options: SafeUrlOptions = {},
) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const allowedProtocols = options.allowedProtocols
      ? new Set(options.allowedProtocols)
      : DEFAULT_ALLOWED_PROTOCOLS;

    if (!allowedProtocols.has(url.protocol)) return null;

    if (
      options.allowedHosts &&
      !options.allowedHosts.some((host) => hostMatches(url.hostname, host))
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export const trustedMediaHosts = [
  "pub-956cede54b444e1c8c8ded564f2dd959.r2.dev",
  "cf.geekdo-images.com",
  "geekdo-images.com",
  "images.squarespace-cdn.com",
];

export const trustedVideoHosts = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "tiktok.com",
  "instagram.com",
];

export const trustedBggHosts = [
  "boardgamegeek.com",
  "boardgamegeek.com.br",
];
