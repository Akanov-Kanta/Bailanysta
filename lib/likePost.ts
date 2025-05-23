import { supabase } from "./supabase";

export async function likePost(postId: string, username: string) {
  const { data, error } = await supabase
    .from("likes")
    .insert([{ post_id: postId, username }]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getLikes(postId: string) {
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}
