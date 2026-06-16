import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import IntroNewspaper from './components/IntroNewspaper';
import GameScreen from './components/GameScreen';

export default function App() {
  // Возможные состояния игры: 'menu', 'newspaper', 'playing', 'win'
  const [gameState, setGameState] = useState('menu');

  // Функция для полного перезапуска игры из любого экрана
  const resetToMenu = () => {
    setGameState('menu');
  };

  // Функция перехода к чтению газеты
  const startNewspaper = () => {
    setGameState('newspaper');
  };

  // Функция старта самой ночной смены
  const startGamePlay = () => {
    setGameState('playing');
  };

  // Функция, которая сработает при успешном доживании до 6:00
  const handleWin = () => {
    setGameState('win');
  };

  return (
    <div className="w-full min-h-screen bg-black text-white select-none overflow-hidden font-sans">
      {/* 1. ЭКРАН ГЛАВНОГО МЕНЮ */}
      {gameState === 'menu' && (
        <MainMenu onStart={startNewspaper} />
      )}

      {/* 2. ЭКРАН ГАЗЕТЫ С СЮЖЕТОМ */}
      {gameState === 'newspaper' && (
        <IntroNewspaper onSkip={startGamePlay} />
      )}

      {/* 3. ОСНОВНОЙ ИГРОВОЙ ПРОЦЕСС */}
      {gameState === 'playing' && (
        <GameScreen onWin={handleWin} onGameOver={resetToMenu} />
      )}

      {/* 4. ЭКРАН ПОБЕДЫ (ЕСЛИ ВЫЖИЛ ДО 6 УТРА) */}
      {gameState === 'win' && (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4 text-center">
          {/* Хоррор-фон для финального экрана */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none z-10" />
          
          <div className="z-20 max-w-md bg-zinc-900/80 border border-emerald-500/30 p-8 rounded-lg shadow-2xl backdrop-blur-sm animate-pulse">
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-500 mb-6 tracking-wider uppercase">
              Поздравляю!
            </h1>
            <p className="text-zinc-300 text-lg mb-8 leading-relaxed">
              Ты смог пережить эту жуткую ночь. Стальные кошмары лороведов отступили с рассветом. Хейтер открыл глаза в холодном поту — это был всего лишь сон... Или нет?
            </p>
            <button
              onClick={resetToMenu}
              className="w-full py-4 bg-emerald-950/40 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all duration-300 uppercase tracking-widest font-bold text-sm rounded shadow-lg active:scale-95"
            >
              Пропустить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
