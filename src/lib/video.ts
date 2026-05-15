export type VideoPlatform = "youtube" | "vimeo" | "tiktok" | "instagram" | "other";

export interface ParsedVideo {
  platform: VideoPlatform;
  videoId: string | null;
  embedUrl: string | null;
  thumbnail: string | null;
}

const youtubePatterns = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
];
const vimeoPatterns = [
  /vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/|album\/\d+\/video\/)?(\d+)/,
  /player\.vimeo\.com\/video\/(\d+)/,
];
const tiktokPatterns = [
  /tiktok\.com\/@[^/]+\/video\/(\d+)/,
  /tiktok\.com\/v\/(\d+)/,
];
const instagramPatterns = [
  /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/,
];

export function parseVideoUrl(url: string): ParsedVideo {
  const trimmed = url.trim();

  for (const re of youtubePatterns) {
    const match = trimmed.match(re);
    if (match) {
      const id = match[1];
      return {
        platform: "youtube",
        videoId: id,
        embedUrl: `https://www.youtube.com/embed/${id}`,
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      };
    }
  }

  for (const re of vimeoPatterns) {
    const match = trimmed.match(re);
    if (match) {
      const id = match[1];
      return {
        platform: "vimeo",
        videoId: id,
        embedUrl: `https://player.vimeo.com/video/${id}`,
        thumbnail: null,
      };
    }
  }

  for (const re of tiktokPatterns) {
    const match = trimmed.match(re);
    if (match) {
      const id = match[1];
      return {
        platform: "tiktok",
        videoId: id,
        embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
        thumbnail: null,
      };
    }
  }

  for (const re of instagramPatterns) {
    const match = trimmed.match(re);
    if (match) {
      const shortcode = match[1];
      return {
        platform: "instagram",
        videoId: shortcode,
        embedUrl: `https://www.instagram.com/p/${shortcode}/embed`,
        thumbnail: null,
      };
    }
  }

  return { platform: "other", videoId: null, embedUrl: null, thumbnail: null };
}

export const platformLabels: Record<VideoPlatform, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  tiktok: "TikTok",
  instagram: "Instagram",
  other: "Otro",
};

export function buildEmbedUrl(platform: VideoPlatform, videoId: string | null): string | null {
  if (!videoId) return null;
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}`;
    case "tiktok":
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    case "instagram":
      return `https://www.instagram.com/p/${videoId}/embed`;
    default:
      return null;
  }
}
