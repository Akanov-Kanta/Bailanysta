"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

interface Post {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored && stored.trim().length >= 3) {
      setUsername(stored);
    }
  }, []);

  useEffect(() => {
    async function loadPosts() {
      let { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      setPosts(postsData || []);
    }
    loadPosts();
  }, []);

  function saveUsername() {
    if (tempName.trim().length < 3) {
      alert("Имя должно быть минимум 3 символа");
      return;
    }
    localStorage.setItem("username", tempName.trim());
    setUsername(tempName.trim());
  }

  if (!username) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-indigo-900 via-gray-900 to-gray-800">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Введите свой никнейм
          </h2>
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Минимум 3 символа"
            className="border border-gray-300 p-3 w-full rounded-md mb-6 text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={saveUsername}
            className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 transition"
          >
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-900 to-gray-800 px-2 sm:px-6">
        <Header username={username} />
        <h1 className="text-center text-white text-4xl font-extrabold mb-12 tracking-wide drop-shadow-lg py-12">
          Лента постов
        </h1>

        {posts.length === 0 && (
          <p className="text-center text-indigo-200 text-lg">Постов пока нет</p>
        )}

        <div className="max-w-3xl mx-auto space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:scale-[1.02] transition-transform duration-300 cursor-default"
            >
              <p className="text-indigo-100 text-lg leading-relaxed mb-4 whitespace-pre-line">
                {post.content}
              </p>
              <footer className="flex justify-between text-indigo-300 text-sm font-mono select-none">
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleString()}
                </time>
                <span>Автор: {post.author}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
