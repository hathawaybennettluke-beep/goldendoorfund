import { cn } from "@/lib/utils";

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s: string): string {
  return escape(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
}

/** Minimal, safe Markdown → HTML for generated product copy (headings, lists, bold/italic, paragraphs). */
export function markdownToHtml(md: string): string {
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) { close(); continue; }
    const h = /^(#{1,4})\s+(.*)/.exec(line);
    if (h) { close(); const lvl = Math.min(h[1].length + 1, 4); out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); continue; }
    if (/^[-*]\s+/.test(line)) { if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; } out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`); continue; }
    if (/^\d+[.)]\s+/.test(line)) { if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; } out.push(`<li>${inline(line.replace(/^\d+[.)]\s+/, ""))}</li>`); continue; }
    close();
    out.push(`<p>${inline(line)}</p>`);
  }
  close();
  return out.join("\n");
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  return <div className={cn("prose-sm max-w-none [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-semibold [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5", className)} dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }} />;
}
