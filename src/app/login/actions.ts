"use server";

import { cookies } from "next/headers";

export async function authenticateAdmin(user: string, pwd: string) {
    // In a real application, this would query the database
    // For this setup, we use the user's requested static credentials
    const EXPECTED_USER = "alagappan";
    const EXPECTED_PASS = "861135";

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
