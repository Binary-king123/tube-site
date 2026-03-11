"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { parse } from "csv-parse/sync";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function addVideo(formData: FormData) {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const embedUrl = formData.get("embedUrl") as string;
    const thumbnail = formData.get("thumbnail") as string;
    const durationStr = formData.get("duration") as string;
    const category = formData.get("category") as string;
    const tagsStr = formData.get("tags") as string;

    if (!title || !slug || !embedUrl || !thumbnail) {
        return { error: "Missing required fields" };
    }

    const duration = durationStr ? parseInt(durationStr, 10) : null;
    const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim().toLowerCase()) : [];

    try {
        // Handle slug uniqueness — append random suffix if collision
        let finalSlug = slug;
        const existing = await db.video.findUnique({ where: { slug } });
        if (existing) {
            finalSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        // 1. Create the video
        await db.video.create({
            data: {
                title,
                slug: finalSlug,
                embedUrl,
                thumbnail,
                duration,
                category: category || null,
                tags,
            },
        });

        // 2. Auto-create category if new
        if (category) {
            await db.category.upsert({
                where: { name: category },
                update: {},
                create: {
                    name: category,
                    slug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                },
            });
        }

        revalidatePath("/");
        revalidatePath("/categories");
        revalidatePath("/sitemap.xml");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to add video:", error?.message || error);
        return { error: `Database error: ${error?.message || "unknown"}` };
    }
}

export async function bulkImportVideos(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        return { errors: ["No file uploaded."] };
    }

    try {
        const rawText = await file.text();
        const firstLine = rawText.split('\n')[0];
        const isEpornerDump = firstLine && firstLine.includes('|');
        const isCommaSeparated = firstLine && firstLine.includes(',');

        if (!isEpornerDump && !isCommaSeparated) {
            return { errors: ["File format not recognized. Must be standard CSV or Pipe-delimited (|) Affiliate feed."] };
        }

        let records: any[] = [];

        if (isEpornerDump) {
            // Eporner format has NO headers, so we map them by array index
            const rawRecords = parse(rawText, {
                delimiter: '|',
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true
            });

            // Map Eporner positional data to our expected schema
            // [0] ID, [1] URL, [2] Duration, [3] Title, [4/5] Tags, [6] Thumbnail
            records = rawRecords.map((row: any[]) => ({
                title: row[3],
                url: row[1],
                embed: row[0] ? `https://www.eporner.com/embed/${row[0]}` : "",
                duration: row[2],
                thumbnail: row[6],
                category: row[4] ? row[4].split(',')[0] : "Category",
                tags: row[5] || row[4]
            }));
        } else {
            // Standard Comma CSV with headers
            records = parse(rawText, {
                columns: (headers) => headers.map((h: string) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '')),
                skip_empty_lines: true,
                trim: true,
            });
        }

        if (records.length === 0) {
            return { errors: ["The CSV file is empty."] };
        }

        interface CSVRow {
            title?: string;
            name?: string;
            embed?: string;
            url?: string;
            link?: string;
            embedurl?: string;
            thumbnail?: string;
            thumb?: string;
            image?: string;
            duration?: string;
            time?: string;
            category?: string;
            tags?: string;
        }

        // Validate headers roughly
        const firstRow = records[0] as CSVRow;
        if (!firstRow.title || !firstRow.embed) {
            return { errors: ["Missing crucial headers. Required: title, embed (url, thumbnail highly recommended)"] };
        }

        const errors: string[] = [];
        let success = 0;
        let failed = 0;

        // Process sequentially to handle category creation properly and avoid overwhelming DB connections
        for (let i = 0; i < records.length; i++) {
            const row = records[i] as CSVRow;

            // Flexible header aliases
            const rowTitle = row.title || row.name;
            const rowEmbed = row.embed || row.url || row.link || row.embedurl;
            const rowThumb = row.thumbnail || row.thumb || row.image;
            const rowDurationRaw = row.duration || row.time;

            try {
                if (!rowTitle || !rowEmbed) {
                    failed++;
                    errors.push(`Row ${i + 2}: Missing title or embed URL.`);
                    continue;
                }

                // Generate a slug if missing
                let rawSlug = rowEmbed.split('/').pop() || rowTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                let finalSlug = rawSlug;

                // Extra uniqueness check to prevent collisions on identical titles
                const existing = await db.video.findUnique({ where: { slug: finalSlug } });
                if (existing) {
                    finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
                }

                const duration = rowDurationRaw ? parseInt(rowDurationRaw, 10) : null;
                const category = row.category || null;
                const tagsRaw = row.tags ? row.tags.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [];

                await db.video.create({
                    data: {
                        title: rowTitle,
                        slug: finalSlug,
                        embedUrl: rowEmbed,
                        thumbnail: rowThumb || "https://placehold.co/600x400/1a1a1a/FFF?text=No+Thumbnail",
                        duration,
                        category,
                        tags: tagsRaw,
                    }
                });

                if (category) {
                    await db.category.upsert({
                        where: { name: category },
                        update: {},
                        create: {
                            name: category,
                            slug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        },
                    });
                }

                success++;
            } catch (err: any) {
                failed++;
                errors.push(`Row ${i + 2} (${rowTitle || 'Unknown'}): ${err.message}`);
            }
        }

        revalidatePath("/");
        revalidatePath("/categories");

        return { success, failed, errors };

    } catch (e: any) {
        return { errors: [`Failed to parse CSV: ${e.message}`] };
    }
}

export async function bulkImportText(formData: FormData) {
    const rawText = formData.get("text") as string;
    const defaultCategory = formData.get("category") as string;
    const defaultTagsStr = formData.get("tags") as string;

    if (!rawText) {
        return { errors: ["No text provided."] };
    }

    const defaultTags = defaultTagsStr ? defaultTagsStr.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];

    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    
    // We expect pairs of lines or just lines with MP4s and JPGs.
    // Let's extract all mp4 URLs and jpg URLs. 
    // Usually they are adjacent in pairs. We can match by the video name.
    
    // Basic heuristics: Find all lines containing .mp4
    const mp4Lines = lines.filter(l => l.includes(".mp4"));
    // Find all lines containing .jpg / .jpeg / .png / .webp
    const imgLines = lines.filter(l => l.match(/\.(jpg|jpeg|png|webp)/i));

    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    // Use a map to pair them up based on the core filename
    const pairs: { url: string, thumb: string, titleStr: string }[] = [];

    mp4Lines.forEach(mp4Line => {
        // extract the actual URL from the line (ignoring the front "VM59:53 " stuff)
        const match = mp4Line.match(/(https?:\/\/[^\s]+)/);
        if (!match) return;
        const mp4Url = match[1];

        // extract filename without extension
        const urlParts = mp4Url.split('/');
        const filenameWithExt = urlParts[urlParts.length - 1];
        const basename = filenameWithExt.replace(/\.[^/.]+$/, "");

        // Find matching image line
        const matchingImgLine = imgLines.find(l => l.includes(basename));
        let thumbUrl = "";
        if (matchingImgLine) {
            const imgMatch = matchingImgLine.match(/(https?:\/\/[^\s]+)/);
            if (imgMatch) thumbUrl = imgMatch[1];
        }

        // Generate title: Replace dashes and percent encodings with spaces
        let rawTitle = decodeURIComponent(basename);
        rawTitle = rawTitle.replace(/[-_]/g, " ");

        pairs.push({
            url: mp4Url,
            thumb: thumbUrl,
            titleStr: rawTitle
        });
    });

    if (pairs.length === 0) {
        return { errors: ["No valid .mp4 URLs found in the text."] };
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    for (let i = 0; i < pairs.length; i++) {
        const item = pairs[i];
        try {
            let finalThumbPath = item.thumb;

            // Attempt to download the image to our server to fix hotlink
            if (item.thumb) {
                try {
                    const imgRes = await fetch(item.thumb, {
                        headers: {
                            // Spoof referer to bypass simple hotlink protections
                            "Referer": "https://desibf.com/",
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                        }
                    });
                    if (imgRes.ok) {
                        const ext = item.thumb.split('.').pop()?.toLowerCase().split('?')[0] || 'jpg';
                        const uniqueName = Date.now() + Math.round(Math.random() * 1e9) + '.' + ext;
                        const buffer = Buffer.from(await imgRes.arrayBuffer());
                        await writeFile(join(uploadDir, uniqueName), buffer);
                        finalThumbPath = "/uploads/" + uniqueName;
                    }
                } catch (imgErr) {
                    console.log("Failed to download image, using original url", item.thumb);
                }
            } else {
                finalThumbPath = "https://placehold.co/600x400/1a1a1a/FFF?text=No+Thumbnail";
            }

            // Slugs and Database
            let rawSlug = item.titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            let finalSlug = rawSlug;

            const existing = await db.video.findUnique({ where: { slug: finalSlug } });
            if (existing) {
                finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
            }

            await db.video.create({
                data: {
                    title: item.titleStr,
                    slug: finalSlug,
                    embedUrl: item.url,
                    thumbnail: finalThumbPath,
                    category: defaultCategory || null,
                    tags: defaultTags,
                }
            });

            if (defaultCategory) {
                await db.category.upsert({
                    where: { name: defaultCategory },
                    update: {},
                    create: {
                        name: defaultCategory,
                        slug: defaultCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    },
                });
            }

            success++;
        } catch (err: any) {
            failed++;
            errors.push(`Failed on ${item.titleStr}: ${err.message}`);
        }
    }

    revalidatePath("/");
    revalidatePath("/categories");

    return { success, failed, errors };
}
