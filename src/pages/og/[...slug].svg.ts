import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

// 1. Read static assets once at compile time globally
let bgBase64 = "";
try {
  const bgPath = path.join(process.cwd(), "public", "shader-bg.png");
  const bgBuffer = fs.readFileSync(bgPath);
  bgBase64 = `data:image/png;base64,${bgBuffer.toString("base64")}`;
} catch (err) {
  console.error("Failed to read shader-bg.png for OG cards:", err);
}

let iconBase64 = "";
try {
  const iconPath = path.join(process.cwd(), "public", "icon.png");
  const iconBuffer = fs.readFileSync(iconPath);
  iconBase64 = `data:image/png;base64,${iconBuffer.toString("base64")}`;
} catch (err) {
  console.error("Failed to read icon.png for OG cards:", err);
}

let fontBase64 = "";
try {
  const fontPath = path.join(
    process.cwd(),
    "node_modules",
    "@fontsource-variable",
    "google-sans-flex",
    "files",
    "google-sans-flex-latin-wght-normal.woff2"
  );
  const fontBuffer = fs.readFileSync(fontPath);
  fontBase64 = `data:font/woff2;base64,${fontBuffer.toString("base64")}`;
} catch (err) {
  console.error("Failed to load Google Sans Flex font for OG cards:", err);
}

// Utility to wrap text for SVG rendering
const wrapText = (text: string, maxChars = 22): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxChars) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

export async function getStaticPaths() {
  // Fetch search catalog
  const searchRes = await fetch("https://pricecatcher-lake.iwa.my/data/global_search.json");
  if (!searchRes.ok) throw new Error("Failed to fetch search catalog for OG routes");
  const searchCatalog = await searchRes.json();

  // Find the maximum date from all items in the search catalog to use as a global fallback
  let maxItemDate = "";
  searchCatalog.forEach((item: any) => {
    if (item.last_updated && (!maxItemDate || item.last_updated > maxItemDate)) {
      maxItemDate = item.last_updated;
    }
  });
  if (!maxItemDate) maxItemDate = new Date().toISOString().split("T")[0]; // absolute fallback

  const paths = [];

  // Default homepage OG
  paths.push({
    params: { slug: "default" },
    props: {
      title: "OpenPriceCatcher",
      subtitle: "Open Data Portal",
      value: "Malaysia",
      label: "Track & compare prices.",
      footer: "Real-time, mobile-free KPDN analytics portal.",
      type: "default",
      date: maxItemDate
    }
  });

  // Items
  searchCatalog.forEach((item: any) => {
    const avg = item.median ? `RM ${item.median.toFixed(2)}` : "N/A";
    const range = `Min: RM ${item.minimum?.toFixed(2) || "0.00"}   •   Max: RM ${item.maximum?.toFixed(2) || "0.00"}`;
    paths.push({
      params: { slug: `item-${item.item_code}` },
      props: {
        title: item.item || "Unknown Item",
        subtitle: `${item.item_group || ""} / ${item.item_category || ""}`,
        value: avg,
        label: "Median",
        footer: range,
        type: "item",
        date: item.last_updated || maxItemDate
      }
    });
  });

  // Categories
  const indexRes = await fetch("https://pricecatcher-lake.iwa.my/indices/item_category_price_index.json");
  let indices: Record<string, any> = {};
  if (indexRes.ok) {
    const rawText = await indexRes.text();
    indices = JSON.parse(rawText.replace(/:\s*NaN/g, ": null"));
  }

  const groupCategoryPairs = new Set<string>();
  searchCatalog.forEach((item: any) => {
    if (item.item_group && item.item_category) {
      groupCategoryPairs.add(`${item.item_group}|${item.item_category}`);
    }
  });

  groupCategoryPairs.forEach((pair) => {
    const [group, category] = pair.split("|");
    const urlSafeCatName = category.replace(/\//g, "--");

    // Find WoW change from index
    const categoryData = indices[category] || [];
    const latestData = categoryData[categoryData.length - 1];
    const wowVal = latestData ? latestData.pop_change_pct : null;
    const rawDate = latestData ? latestData.date : "";
    const catDate = rawDate ? rawDate.split(" ")[0] : maxItemDate;

    let wowText = "Stable";
    let sublabel = "No index changes this week";
    if (wowVal !== null && !isNaN(wowVal)) {
      const sign = wowVal > 0 ? "+" : "";
      wowText = `${sign}${wowVal.toFixed(2)}%`;
      sublabel = wowVal > 0 ? "Increase since last week" : wowVal < 0 ? "Decrease since last week" : "Stable this week";
    }

    paths.push({
      params: { slug: `category-${group}-${urlSafeCatName}` },
      props: {
        title: category,
        subtitle: group,
        value: wowText,
        label: "Week on week",
        footer: sublabel,
        type: "category",
        date: catDate
      }
    });
  });

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const { title, subtitle, value, label, footer, date } = props;

  // Escape HTML characters for SVG compatibility
  const escapeXml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  // Wrap title for long text to avoid overlapping the right column
  const lines = wrapText(title, 22);
  const fontSize = lines.length > 2 ? "44" : "56";
  const dy = lines.length > 2 ? "52" : "68";

  const lineElements = lines.map((line, idx) => {
    return `<tspan x="80" dy="${idx === 0 ? 0 : dy}">${escapeXml(line)}</tspan>`;
  }).join("\n");

  // Estimate width dynamically for the footer card background
  const textLen = footer.length;
  const pillWidth = Math.max(160, textLen * 9.5 + 32);

  const subtitleParts = subtitle.split(" / ");
  let subtitleMarkup = "";
  let titleY = 220;

  if (subtitleParts.length > 1) {
    titleY = 235;
    subtitleMarkup = `
      <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="400" font-size="18" fill="#FFFFFF" opacity="0.5" x="80" y="130" filter="url(#shadow)">${escapeXml(subtitleParts[0].toUpperCase())}</text>
      <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="500" font-size="22" fill="#FFFFFF" opacity="0.85" x="80" y="165" filter="url(#shadow)">${escapeXml(subtitleParts[1].toUpperCase())}</text>
    `;
  } else {
    titleY = 205;
    subtitleMarkup = `
      <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="400" font-size="24" fill="#FFFFFF" x="80" y="155" filter="url(#shadow)">${escapeXml(subtitle.toUpperCase())}</text>
    `;
  }

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        @font-face {
          font-family: 'Google Sans Flex';
          font-style: normal;
          src: url('${fontBase64}') format('woff2');
        }
      </style>
      
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="60%" stop-color="#041811" />
          <stop offset="100%" stop-color="#032c1c" />
        </linearGradient>
        
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.65" />
        </filter>
      </defs>

      <!-- Background -->
      ${bgBase64 ? `<image href="${bgBase64}" width="1200" height="630" x="0" y="0" />` : `<rect width="1200" height="630" fill="url(#bg)" />`}

      <!-- Top Branding Bar (Reduced top margin to y=50) -->
      <g transform="translate(80, 50)">
        ${iconBase64 ? `<image href="${iconBase64}" x="0" y="0" width="36" height="36" />` : `
          <circle cx="18" cy="18" r="16" fill="#10B981" />
          <path d="M12 18h12M18 12v12" stroke="white" stroke-width="3" stroke-linecap="round" />
        `}
        <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="500" font-size="26" fill="#FFFFFF" x="52" y="27" filter="url(#shadow)">OpenPriceCatcher</text>
        <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="400" font-size="16" fill="#FFFFFF" opacity="0.6" x="315" y="25" filter="url(#shadow)">as of ${escapeXml(date)}</text>
      </g>

      <!-- Subtitle (Category Path / Group) -->
      ${subtitleMarkup}
      
      <!-- Headline Title (Wrapped & Dynamically Scaled) -->
      <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="500" font-size="${fontSize}" fill="#FFFFFF" x="80" y="${titleY}" filter="url(#shadow)">
        ${lineElements}
      </text>

      <!-- Metrics Section (Moved to the right: x=820, y=155) -->
      <g transform="translate(820, 155)" filter="url(#shadow)">
        <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="400" font-size="24" fill="#FFFFFF">${escapeXml(label)}</text>
        <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="500" font-size="80" fill="#FFFFFF" y="80">${escapeXml(value)}</text>
        
        <!-- Bottom label with semi-transparent background pill to improve contrast -->
        <g transform="translate(0, 120)">
          <rect x="-12" y="0" width="${pillWidth}" height="40" rx="16" fill="#000000" opacity="0.45" />
          <text font-family="Google Sans Flex, system-ui, sans-serif" font-weight="400" font-size="20" fill="#FFFFFF" opacity="0.95" x="12" y="28">${escapeXml(footer)}</text>
        </g>
      </g>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
