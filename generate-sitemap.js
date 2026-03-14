/**
 * Static Sitemap Generator — ilovedesi.fun
 * Run on VPS: node generate-sitemap.js
 * Creates ALL sitemap files in public/ so Google can always fetch them.
 *
 * Files created:
 *   public/sitemap.xml           ← Sitemap index (the one you submit to Google)
 *   public/sitemap_pages.xml     ← Home, Categories, Tags, Latest pages
 *   public/sitemap_categories.xml← All categories
 *   public/sitemap_tags.xml      ← All tags
 *   public/sitemap_videos_1.xml  ← First 5000 videos
 *   public/sitemap_videos_2.xml  ← Next 5000 (if needed), etc..
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ilovedesi.fun";
const CHUNK_SIZE = 5000;

function escapeXml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function write(filename, content) {
    fs.writeFileSync(path.join("public", filename), content, "utf8");
    console.log(`✅ Written public/${filename}`);
}

async function main() {
    const now = new Date().toISOString();

    // ── 1. Fetch everything we need from DB ──────────────────────────
    console.log("Fetching data from database...");

    const videos = await prisma.video.findMany({
        select: { id: true, slug: true, title: true, thumbnail: true, embedUrl: true, duration: true, createdAt: true, category: true, tags: true },
        orderBy: { createdAt: "desc" },
    });

    // Unique categories
    const categories = [...new Set(videos.map(v => v.category).filter(Boolean))];

    // Unique tags
    const allTags = videos.flatMap(v => v.tags || []);
    const tags = [...new Set(allTags)];

    console.log(`Found: ${videos.length} videos, ${categories.length} categories, ${tags.length} tags`);

    // ── 2. sitemap_pages.xml ─────────────────────────────────────────
    let pagesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const [loc, freq, pri] of [
        [`${BASE_URL}/`, "daily", "1.0"],
        [`${BASE_URL}/categories`, "weekly", "0.8"],
        [`${BASE_URL}/tags`, "weekly", "0.8"],
        [`${BASE_URL}/latest`, "daily", "0.8"],
    ]) {
        pagesXml += `  <url><loc>${loc}</loc><changefreq>${freq}</changefreq><priority>${pri}</priority></url>\n`;
    }
    pagesXml += `</urlset>`;
    write("sitemap_pages.xml", pagesXml);

    // ── 3. sitemap_categories.xml ────────────────────────────────────
    let catXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const cat of categories) {
        catXml += `  <url><loc>${BASE_URL}/search?q=${encodeURIComponent(cat)}</loc><changefreq>weekly</changefreq></url>\n`;
    }
    catXml += `</urlset>`;
    write("sitemap_categories.xml", catXml);

    // ── 4. sitemap_tags.xml ──────────────────────────────────────────
    let tagXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const tag of tags) {
        tagXml += `  <url><loc>${BASE_URL}/search?q=${encodeURIComponent(tag)}</loc><changefreq>weekly</changefreq></url>\n`;
    }
    tagXml += `</urlset>`;
    write("sitemap_tags.xml", tagXml);

    // ── 5. sitemap_videos_N.xml (chunked, 5000 per file) ────────────
    const totalPages = Math.max(1, Math.ceil(videos.length / CHUNK_SIZE));
    for (let p = 1; p <= totalPages; p++) {
        const chunk = videos.slice((p - 1) * CHUNK_SIZE, p * CHUNK_SIZE);
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

        for (const v of chunk) {
            const safeTitle = escapeXml(v.title);
            const playerLoc = `${BASE_URL}/video/${v.id}/${v.slug}`;

            // Route external thumbnails through our proxy so Google can fetch them
            let thumbUrl;
            if (v.thumbnail.startsWith("/uploads/") || v.thumbnail.startsWith("/thumbs/")) {
                thumbUrl = `${BASE_URL}${v.thumbnail}`;
            } else if (v.thumbnail.startsWith("http")) {
                thumbUrl = `${BASE_URL}/api/proxy-image?url=${encodeURIComponent(v.thumbnail)}`;
            } else {
                thumbUrl = `${BASE_URL}${v.thumbnail}`;
            }

            const contentLoc = v.embedUrl.startsWith("/uploads/") ? `${BASE_URL}${v.embedUrl}` : null;

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
        write(`sitemap_videos_${p}.xml`, xml);
    }

    // ── 6. sitemap.xml (index) ───────────────────────────────────────
    // Names MUST match the actual files we created above
    let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    const sitemapFiles = [
        "sitemap_pages.xml",
        "sitemap_categories.xml",
        "sitemap_tags.xml",
        ...Array.from({ length: totalPages }, (_, i) => `sitemap_videos_${i + 1}.xml`),
    ];
    for (const file of sitemapFiles) {
        indexXml += `  <sitemap><loc>${BASE_URL}/${file}</loc><lastmod>${now}</lastmod></sitemap>\n`;
    }
    indexXml += `</sitemapindex>`;
    write("sitemap.xml", indexXml);

    console.log(`\n🎉 DONE! All sitemaps written to public/`);
    console.log(`   Videos: ${videos.length} across ${totalPages} file(s)`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Tags: ${tags.length}`);
    console.log(`\n   Submit this to Google Search Console: ${BASE_URL}/sitemap.xml`);

    await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
