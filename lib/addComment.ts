import { supabase } from "./supabase";

export async function addComment(postId: string, username: string, content: string) {
  const { data, error } = await supabase
    .from("comments")
    .insert([{ post_id: postId, username, content }]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select("id, content, username, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}