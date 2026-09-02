/**
 * Product image generation. Claude does not generate images, so this module
 * talks to an image model provider when configured and otherwise renders a
 * clean branded SVG mockup so the store still has usable placeholder art.
 *
 * Configure with IMAGE_PROVIDER=openai + OPENAI_API_KEY, or
 * IMAGE_PROVIDER=stability + STABILITY_API_KEY.
 */
export type GeneratedImage =
  | { kind: "bytes"; bytes: ArrayBuffer; mime: string; provider: string }
  | { kind: "svg"; svg: string; provider: "placeholder" };

export function imageProvider(): "openai" | "stability" | null {
  const p = (process.env.IMAGE_PROVIDER ?? "").toLowerCase();
  if (p === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (p === "stability" && process.env.STABILITY_API_KEY) return "stability";
  if (!p && process.env.OPENAI_API_KEY) return "openai";
  if (!p && process.env.STABILITY_API_KEY) return "stability";
  return null;
}

export function buildImagePrompt(opts: {
  title: string;
  category: string;
  description?: string;
  style: "studio" | "lifestyle" | "flatlay";
  brandColor?: string;
}): string {
  const styles = {
    studio: "professional studio product photograph, soft diffused lighting, seamless light grey background, sharp focus, 50mm lens",
    lifestyle: "lifestyle product photograph in a real setting used by a happy customer, natural window light, shallow depth of field",
    flatlay: "top-down flat lay product photograph on a textured surface with tasteful props, even lighting",
  } as const;
  return `${styles[opts.style]}. Product: ${opts.title} (${opts.category}). ${opts.description ? `Details: ${opts.description.slice(0, 300)}.` : ""} ${opts.brandColor ? `Accent colour ${opts.brandColor}.` : ""} No text, no watermark, ecommerce ready, high resolution.`;
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function generateImage(prompt: string): Promise<GeneratedImage | null> {
  const provider = imageProvider();
  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
        prompt,
        size: "1024x1024",
        n: 1,
      }),
    });
    if (!res.ok) throw new Error(`Image provider error ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { data: Array<{ b64_json?: string; url?: string }> };
    const first = json.data?.[0];
    if (first?.b64_json) {
      return { kind: "bytes", bytes: base64ToArrayBuffer(first.b64_json), mime: "image/png", provider };
    }
    if (first?.url) {
      const img = await fetch(first.url);
      return { kind: "bytes", bytes: await img.arrayBuffer(), mime: img.headers.get("content-type") ?? "image/png", provider };
    }
    return null;
  }
  if (provider === "stability") {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("output_format", "png");
    form.append("aspect_ratio", "1:1");
    const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.STABILITY_API_KEY}`, Accept: "image/*" },
      body: form,
    });
    if (!res.ok) throw new Error(`Image provider error ${res.status}: ${await res.text()}`);
    return { kind: "bytes", bytes: await res.arrayBuffer(), mime: "image/png", provider };
  }
  return null;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string);
}

/** Branded SVG mockup used when no image provider is configured. */
export function placeholderSvg(opts: { title: string; category: string; color?: string; variant: number }): string {
  const color = opts.color && /^#[0-9a-f]{6}$/i.test(opts.color) ? opts.color : "#d4a017";
  const shapes = [
    `<rect x="312" y="292" width="400" height="440" rx="36" fill="${color}" opacity="0.9"/>`,
    `<circle cx="512" cy="512" r="230" fill="${color}" opacity="0.9"/>`,
    `<path d="M512 250 L760 512 L512 774 L264 512 Z" fill="${color}" opacity="0.9"/>`,
  ];
  const shape = shapes[opts.variant % shapes.length];
  const title = escapeXml(opts.title.slice(0, 34));
  const category = escapeXml(opts.category.slice(0, 40).toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f5f0"/>
      <stop offset="100%" stop-color="#e9e4d8"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="30" stdDeviation="30" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <g filter="url(#shadow)">${shape}</g>
  <text x="512" y="880" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="700" fill="#1f1f1f">${title}</text>
  <text x="512" y="930" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" letter-spacing="4" fill="#6b6b6b">${category}</text>
</svg>`;
}
