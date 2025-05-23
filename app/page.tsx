"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { getLikes } from "@/lib/likePost";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Post {
  id: string;
  author: string;
  content: string;
  created_at: string;
  likes: number;
  comments: { id: number; content: string; username: string }[];
}

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [likeAnimating, setLikeAnimating] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored && stored.trim().length >= 3) {
      setUsername(stored);
    }
  }, []);

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);

        const { data: postsData } = await supabase
          .from("posts")
          .select("*, comments(id, content, username)")
          .order("created_at", { ascending: false });

        const { data: likesData } = await supabase
          .from("likes")
          .select("post_id");

        const likesCountMap = likesData?.reduce((acc, like) => {
          acc[like.post_id] = (acc[like.post_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const postsWithLikes =
          postsData?.map((post) => ({
            ...post,
            likes: likesCountMap?.[post.id] || 0,
          })) || [];

        setPosts(postsWithLikes);
      } catch (error) {
        toast.error("Ошибка загрузки постов");
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  function saveUsername() {
    if (tempName.trim().length < 3) {
      toast.error("Имя должно быть минимум 3 символа");
      return;
    }
    localStorage.setItem("username", tempName.trim());
    setUsername(tempName.trim());
  }

  async function handleLike(postId: string) {
    setLikeAnimating(postId);

    try {
      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, username }),
      });

      const data = await res.json();

      if (data.success) {
        const updatedLikes = await getLikes(postId); // получить актуальное число лайков
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, likes: updatedLikes } : post
          )
        );
      } else {
        toast.error("Ошибка при лайке: " + (data.error || "unknown"));
      }
    } catch (err) {
      toast.error("Сетевая ошибка при лайке");
    }

    setTimeout(() => setLikeAnimating(null), 600);
  }

  async function handleCommentSubmit(postId: string) {
    const comment = newComments[postId]?.trim();
    if (!comment) return;

    try {
      const res = await fetch("/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: comment,
          username: username, // Убедитесь что здесь передается username
        }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Received comments:", data.comments); // Добавьте лог
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, comments: data.comments } : post
          )
        );
      }
    } catch (err) {
      toast.error("Сетевая ошибка при отправке комментария");
    }
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

        {isLoading ? (
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            {posts.length === 0 ? (
              <p className="text-center text-indigo-200 text-lg">
                Постов пока нет
              </p>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white bg-opacity-5 rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:scale-[1.02] transition-transform duration-300 cursor-default"
                  >
                    <p className="text-indigo-100 text-lg leading-relaxed mb-4 whitespace-pre-line">
                      {post.content}
                    </p>
                    <footer className="flex justify-between text-indigo-300 text-sm font-mono select-none mb-4">
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleString()}
                      </time>
                      <span>Автор: {post.author}</span>
                    </footer>

                    <div className="flex items-center gap-4">
                      <motion.button
                        whileTap={{ scale: 1.3 }}
                        onClick={() => handleLike(post.id)}
                        className="text-white text-lg hover:text-pink-400 transition duration-300"
                      >
                        ❤️ {post.likes || 0}
                      </motion.button>
                    </div>

                    <div className="mt-4">
                      <input
                        value={newComments[post.id] || ""}
                        onChange={(e) =>
                          setNewComments((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        placeholder="Оставить комментарий..."
                        className="w-full p-2 rounded-lg bg-white bg-opacity-20 text-white"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="mt-2 text-sm text-indigo-300 hover:text-white"
                      >
                        Отправить
                      </button>
                    </div>

                    {/* Блок с комментариями */}
                    <div className="mt-4 space-y-2">
                      {post.comments?.map((c) => (
                        <div
                          key={c.id}
                          className="text-indigo-100 bg-white bg-opacity-5 px-4 py-2 rounded-lg"
                        >
                          <p className="text-sm font-semibold">
                            user: {c.username}
                          </p>
                          <p>{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </>
  );
}
