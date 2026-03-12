"use server";

import { cookies } from "next/headers";

export async function authenticateAdmin(user: string, pwd: string) {
    // In a real application, this would query the database
    // For this setup, we use environment variables for security
    const EXPECTED_USER = process.env.ADMIN_USER || "admin";
    const EXPECTED_PASS = process.env.ADMIN_PASS || "change_me_in_env";

    if (user === EXPECTED_USER && pwd === EXPECTED_PASS) {
        // Set an HTTP-Only cookie that JavaScript cannot access or read
        cookies().set({
            name: "admin_session",
            value: "authenticated",
            httpOnly: true, // Prevents XSS attacks
            secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        return { success: true };
    }

    return { success: false, error: "Invalid credentials. Try again." };
}
