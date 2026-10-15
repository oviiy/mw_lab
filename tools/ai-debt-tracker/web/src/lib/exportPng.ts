/**
 * Render a chart's <svg> to a PNG with title and source line, for sharing.
 * Computed styles are inlined because the stylesheet does not travel with the image.
 */
const PROPS = [
  "fill", "fill-opacity", "stroke", "stroke-width", "stroke-dasharray", "stroke-opacity", "stroke-linecap",
  "opacity", "font-family", "font-size", "font-weight", "font-style", "text-anchor", "dominant-baseline",
];

function inline(src: Element, dst: Element) {
  const cs = getComputedStyle(src);
  const style = PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";");
  dst.setAttribute("style", style);
  for (let i = 0; i < src.children.length; i++) inline(src.children[i], dst.children[i]);
}

export async function exportPng(svg: SVGSVGElement, title: string, source: string, filename: string) {
  const { width, height } = svg.getBoundingClientRect();
  const clone = svg.cloneNode(true) as SVGSVGElement;
  inline(svg, clone);
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = url;
  });

  const scale = 2;
  const pad = 32;
  const head = 64;
  const foot = 40;
  const canvas = document.createElement("canvas");
  canvas.width = (width + pad * 2) * scale;
  canvas.height = (height + head + foot + pad) * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f8f1e7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1c1a17";
  ctx.font = "600 22px Spectral, Georgia, serif";
  ctx.fillText(title, pad, pad + 18);
  ctx.drawImage(img, pad, head);
  ctx.fillStyle = "#6e655b";
  ctx.font = "13px 'IBM Plex Sans Condensed', 'Arial Narrow', sans-serif";
  ctx.fillText(source, pad, head + height + 26);
  URL.revokeObjectURL(url);

  const a = document.createElement("a");
  a.download = filename;
  a.href = canvas.toDataURL("image/png");
  a.click();
}
