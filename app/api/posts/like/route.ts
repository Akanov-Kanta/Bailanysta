import { NextRequest, NextResponse } from "next/server";
import { likePost } from "@/lib/likePost";

export async function POST(req: NextRequest) {
  const { postId, username } = await req.json();

  if (!postId || !username) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
const result = await likePost(postId, username);
return NextResponse.json({
  success: true,
  ...(result ?? {}),
});

  } catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}
