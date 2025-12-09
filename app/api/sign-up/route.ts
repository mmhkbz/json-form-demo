import { handleUserSignup } from "@/workflows/user-signup";
import { NextResponse } from "next/server";
import { start } from "workflow/api";

export async function GET() {
  await start(handleUserSignup, ["mmhtoo@example.com"]);
  return NextResponse.json({ message: "success" });
}
