const { Client } = require('pg');
require('dotenv').config();

async function test() {
    console.log("Connecting to:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        await client.connect();
        console.log("✅ Authenticated successfully!");

        const res = await client.query('SELECT current_user, session_user, current_database()');
        console.log("👤 Session info:", res.rows[0]);

        try {
            const tableCheck = await client.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
            console.log("📋 Tables in public schema:", tableCheck.rows.map(r => r.tablename));

            const count = await client.query('SELECT count(*) FROM "Video"');
            console.log("🎥 Video count:", count.rows[0].count);
        } catch (e) {
            console.error("❌ Schema/Table Error:", e.message, "(Code:", e.code, ")");
        }
    } catch (e) {
        console.error("❌ Connection/Auth Error:", e.message, "(Code:", e.code, ")");
    } finally {
        await client.end();
    }
}

test();
