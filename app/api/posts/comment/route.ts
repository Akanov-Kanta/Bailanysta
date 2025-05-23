import { NextRequest, NextResponse } from "next/server";
import { addComment, getComments } from "@/lib/addComment";

export async function POST(req: NextRequest) {
  const { postId, content, username } = await req.json();

  if (!postId || !content || !username) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await addComment(postId, username, content);
    const comments = await getComments(postId);
    
    const formattedComments = comments.map(c => ({
      id: c.id,
      content: c.content,
      username: c.username
    }));

    return NextResponse.json({ 
      success: true, 
      comments: formattedComments 
    }, { status: 201 });

  } catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}