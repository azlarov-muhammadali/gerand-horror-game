import React from 'react';

export default function MainMenu({ onStart }) {
  // Сюда ты можешь вставить ссылку или путь к своему хоррору-фону
  // Например: "/src/assets/your_horror_background.png" или ссылку из интернета
  const bgImage = "https://unsplash.com";

  return (
    <div 
      className="relative flex items-center justify-center min-h-screen w-full bg-black bg-cover bg-center select-none overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Затемняющий слой поверх картинки, чтобы кнопка хорошо читалась и выглядела жутко */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black pointer-events-none z-10" />

      {/* Контентная зона */}
      <div className="z-20 text-center px-4">
        <button
          onClick={onStart}
          className="px-12 py-5 text-2xl md:text-3xl font-extrabold tracking-widest uppercase text-red-600 bg-black/80 border-4 border-red-950 rounded-md shadow-[0_0_20px_rgba(153,27,27,0.6)] hover:bg-red-950 hover:text-red-400 hover:border-red-600 hover:shadow-[0_0_40px_rgba(220,38,38,0.8)] active:scale-95 transition-all duration-500 font-serif"
        >
          Начать игру
        </button>
      </div>

      {/* Мелкий декоративный эффект виньетки по краям экрана */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none z-15" />
    </div>
  );
}
