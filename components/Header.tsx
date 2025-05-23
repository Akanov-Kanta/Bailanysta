"use client";

import Link from "next/link";

interface HeaderProps {
  username: string | null;
}

export default function Header({ username }: HeaderProps) {
  return (
    <header
      className="rounded-b-3xl h-24 px-8 flex items-center justify-between text-white select-none overflow-hidden"
      style={{
        background: "rgba(55, 48, 80, 0.75)", // прозрачный фиолетово-синий оттенок
        backdropFilter: "blur(10px)", // размытие фона под хедером
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)", // лёгкая тень сверху, но не снизу
        backgroundClip: "padding-box", // чтобы скругления не показывали фон
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Название платформы */}
      <div className="text-2xl font-extrabold tracking-wide">Twittgram</div>

      {/* Никнейм и переход в профиль */}
      <div>
        {username ? (
          <Link
            href="/profile"
            className="text-sm font-medium bg-gray-700 bg-opacity-70 hover:bg-opacity-90 px-4 py-2 rounded-full transition-colors duration-300"
            title="Перейти в профиль"
          >
            {username}
          </Link>
        ) : (
          <span className="text-sm text-gray-500">Гость</span>
        )}
      </div>
    </header>
  );
}
