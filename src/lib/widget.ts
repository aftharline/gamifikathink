export const WIDGET_MAX_HTML = 12000

/** Ambil blok ```html bila ada fence, lalu sanitasi allowlist. */
export function extractWidgetHtml(raw: string): string {
  const fence = raw.match(/```html\s*([\s\S]*?)```/i)
  let html = (fence ? fence[1] : raw).trim()
  // buang fence sisa + script src / iframe / fetch / XHR / eval
  html = html
    .replace(/```+\w*/g, "")
    .replace(/<script[^>]*\ssrc=[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<\/?iframe[^>]*>/gi, "")
    .replace(/fetch\s*\(/gi, "void(")
    .replace(/XMLHttpRequest/gi, "void")
    .replace(/\beval\s*\(/gi, "void(")
  return html.slice(0, WIDGET_MAX_HTML)
}
