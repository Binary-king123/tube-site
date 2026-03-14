/**
 * Static Sitemap Generator
 * Run on VPS: node generate-sitemap.js
 * This creates a static sitemap.xml in the public/ folder that Google can ALWAYS fetch.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function main() {
  console.log("Fetching all videos from database...");
  const videos = await prisma.video.findMany({
    select: { id: true, slug: true, title: true, thumbnail: true, embedUrl: true, duration: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(`Found ${videos.length} videos.`);

  const now = new Date().toISOString();

  // ── 1. Write sitemap index ─────────────────────────────────────────
  const CHUNK_SIZE = 5000;
  const totalPages = Math.max(1, Math.ceil(videos.length / CHUNK_SIZE));

  let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const sm of [`${BASE_URL}/sitemap_pages.xml`, `${BASE_URL}/sitemap_categories.xml`, `${BASE_URL}/sitemap_tags.xml`]) {
    indexXml += `  <sitemap><loc>${sm}</loc><lastmod>${now}</lastmod></sitemap>\n`;
  }
  for (let p = 1; p <= totalPages; p++) {
    indexXml += `  <sitemap><loc>${BASE_URL}/sitemap_videos_${p}.xml</loc><lastmod>${now}</lastmod></sitemap>\n`;
  }
  indexXml += `</sitemapindex>`;
  fs.writeFileSync(path.join("public", "sitemap.xml"), indexXml, "utf8");
  console.log("✅ Written public/sitemap.xml");

  // ── 2. Write chunked video sitemaps ────────────────────────────────
  for (let p = 1; p <= totalPages; p++) {
    const chunk = videos.slice((p - 1) * CHUNK_SIZE, p * CHUNK_SIZE);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

    for (const v of chunk) {
      const safeTitle = escapeXml(v.title);

      // Thumbnail: route external through proxy so Google can always fetch it
      let thumbUrl;
      if (v.thumbnail.startsWith("/uploads/") || v.thumbnail.startsWith("/thumbs/")) {
        thumbUrl = `${BASE_URL}${v.thumbnail}`;
      } else if (v.thumbnail.startsWith("http")) {
        thumbUrl = `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(v.thumbnail)}`;
      } else {
        thumbUrl = `${BASE_URL}${v.thumbnail}`;
      }

      const playerLoc = `${BASE_URL}/video/${v.id}/${v.slug}`;
      let contentLoc = v.embedUrl.startsWith("/uploads/") ? `${BASE_URL}${v.embedUrl}` : null;

      xml += `  <url>\n    <loc>${playerLoc}</loc>\n    <lastmod>${v.createdAt.toISOString()}</lastmod>\n    <video:video>\n`;
      xml += `      <video:thumbnail_loc>${thumbUrl}</video:thumbnail_loc>\n`;
      xml += `      <video:title>${safeTitle}</video:title>\n`;
      xml += `      <video:description>Watch ${safeTitle} free HD video on ILOVEDESI.</video:description>\n`;
      xml += `      <video:player_loc>${playerLoc}</video:player_loc>\n`;
      if (contentLoc) xml += `      <video:content_loc>${contentLoc}</video:content_loc>\n`;
      if (v.duration) xml += `      <video:duration>${v.duration}</video:duration>\n`;
      xml += `      <video:publication_date>${v.createdAt.toISOString()}</video:publication_date>\n`;
      xml += `      <video:family_friendly>no</video:family_friendly>\n`;
      xml += `    </video:video>\n  </url>\n`;
    }
    xml += `</urlset>`;

    fs.writeFileSync(path.join("public", `sitemap_videos_${p}.xml`), xml, "utf8");
    console.log(`✅ Written public/sitemap_videos_${p}.xml (${chunk.length} videos)`);
  }

  // ── 3. Pages sitemap ───────────────────────────────────────────────
  let pagesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const loc of [`${BASE_URL}/`, `${BASE_URL}/categories`, `${BASE_URL}/tags`, `${BASE_URL}/latest`]) {
    pagesXml += `  <url><loc>${loc}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
  }
  pagesXml += `</urlset>`;
  fs.writeFileSync(path.join("public", "sitemap_pages.xml"), pagesXml, "utf8");
  console.log("✅ Written public/sitemap_pages.xml");

  console.log("\n🎉 DONE! Sitemaps are now static files in public/");
  console.log(`   Total videos indexed: ${videos.length}`);
  console.log(`   Sitemap chunks: ${totalPages}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
