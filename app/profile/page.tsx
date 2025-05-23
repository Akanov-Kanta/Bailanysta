"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Post {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export default function ProfilePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored && stored.trim().length >= 3) {
      setUsername(stored);
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    async function loadPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author", username)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ошибка загрузки постов:", error);
        return;
      }
      setPosts(data || []);
    }
    loadPosts();
  }, [username]);

  async function handleCreatePost() {
    if (!username) return alert("Сначала введите ник!");
    if (newPost.trim().length === 0) return alert("Введите текст поста");

    const { data, error } = await supabase
      .from("posts")
      .insert({ author: username, content: newPost.trim() })
      .select();

    if (error) {
      console.error(error);
      alert("Ошибка при создании поста");
      return;
    }

    setNewPost("");
    if (data && data.length > 0) {
      setPosts((prev) => [data[0], ...prev]);
    }
  }

  async function handleGenerateIdea() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gpt-post-suggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: "" }),
      });
      const json = await res.json();
      setNewPost(json.suggestion || "Не удалось получить идею.");
    } catch (e) {
      console.error(e);
      setNewPost("Произошла ошибка при получении идеи.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!username) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <p className="text-lg animate-pulse">
          Сначала введите ник на главной странице
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-gradient-to-br from-[#1a1c2c] to-[#0f0f10] min-h-screen text-white">
      <h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Привет, {username}!
      </h1>

      <p className="text-center text-gray-400 mb-8">
        У тебя {posts.length} пост(ов)
      </p>

      <div className="bg-[#111318] border border-gray-700 rounded-xl p-6 mb-10 shadow-lg">
        <textarea
          className="w-full p-4 rounded-lg bg-[#1f1f2e] text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
          rows={4}
          placeholder="Напиши, что у тебя нового..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleCreatePost}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            Опубликовать
          </button>
          <button
            onClick={handleGenerateIdea}
            className="flex-1 px-6 py-3 rounded-lg border border-blue-500 hover:bg-blue-600 transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Генерация..." : "Сгенерировать идею при помощи ИИ"}
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
        📝 Мои посты
      </h2>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center">Пока нет ни одного поста</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#1c1e2f] border border-gray-700 p-5 rounded-xl shadow-md hover:scale-[1.01] transition-transform duration-200"
            >
              <p className="text-lg mb-2">{post.content}</p>
              <div className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="py-7">
        <Link href="/">
          <button className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
            ← На главную
          </button>
        </Link>
      </div>
    </div>
  );
}
