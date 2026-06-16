import React, { useState, useEffect, useRef } from 'react';

export default function GameScreen({ onWin, onGameOver }) {
  // ========================================================
  // 1. ГЛОБАЛЬНЫЕ СТЭЙТЫ ИГРОКА И НАВИГАЦИИ
  // ========================================================
  const [currentRoom, setCurrentRoom] = useState('bedroom');   
  const [lookDirection, setLookDirection] = useState('center'); // Направление взгляда: left, center, right
  const [isShaking, setIsShaking] = useState(false);           // Эффект тряски экрана при смене комнат
  const [flashlightOn, setFlashlightOn] = useState(false);       // Состояние фонарика (вкл/выкл)
  const [battery, setBattery] = useState(100);                 // Заряд батареи фонаря
  const [gameHour, setGameHour] = useState(22);                // Время старта кошмара хейтера

  // ========================================================
  // 2. СТЭЙТЫ МОНСТРОВ И СКРИМЕРОВ
  // ========================================================
  const [monsterPositions, setMonsterPositions] = useState({
    azik: null,
    felix: null,
    marti: null,
    misau: null,
  });

  const [screamerMonster, setScreamerMonster] = useState(null); // Какой танк нападает
  const [isGameOverScreen, setIsGameOverScreen] = useState(false); // Показ кнопок перезапуска через 3 сек

  // ========================================================
  // 3. СИСТЕМНЫЕ РЕФЫ ДЛЯ ПОЛНОЙ ОЧИСТКИ ПАМЯТИ И ИИ
  // ========================================================
  const attackTimersRef = useRef({ azik: null, felix: null, marti: null, misau: null });
  
  // Рефы для точного покадрового отслеживания времени отпугивания
  const scaringStartTimeRef = useRef(null);
  const currentScaredMonsterRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Важнейшие рефы-зеркала для исключения багов с "призрачными" данными в React
  const monsterPositionsRef = useRef({ azik: null, felix: null, marti: null, misau: null });
  const flashlightOnRef = useRef(false);
  const currentRoomRef = useRef('bedroom');
  const lookDirectionRef = useRef('center');
  const screamerMonsterRef = useRef(null);
  // Синхронизируем рефы с текущими стейтами для исключения "призрачных" багов
  useEffect(() => {
    monsterPositionsRef.current = monsterPositions;
  }, [monsterPositions]);

  useEffect(() => {
    flashlightOnRef.current = flashlightOn;
  }, [flashlightOn]);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    lookDirectionRef.current = lookDirection;
  }, [lookDirection]);

  useEffect(() => {
    screamerMonsterRef.current = screamerMonster;
  }, [screamerMonster]);

  // ========================================================
  // 4. КОНФИГУРАЦИЯ СПАВНА И ИЗОБРАЖЕНИЙ МОНСТРОВ
  // ========================================================
  const monsterConfig = {
    azik: { 
      img: '/src/assets/monsterAzik.png', 
      rooms: ['bedroom'], 
      possibleDirections: ['center'] // У кровати по центру
    },
    felix: { 
      img: '/src/assets/monsterFELix.png', 
      rooms: ['kuhnya', 'tualet', 'left_corridor', 'right_corridor'], 
      possibleDirections: ['left', 'right'] 
    },
    marti: { 
      img: '/src/assets/monsterMarti.png', 
      rooms: ['wardrobe_room'], // Марти караулит строго в отдельной комнате со шкафом
      possibleDirections: ['center'] // Ждёт по центру у шкафа
    },
    misau: { 
      img: '/src/assets/monsterMisau.png', 
      rooms: ['kuhnya', 'tualet', 'left_corridor', 'right_corridor'], 
      possibleDirections: ['left', 'right'] 
    }
  };

  // ========================================================
  // 5. ГЛАВНЫЙ ИГРОВОЙ ТАЙМЕР НОЧИ (1 час = 1 минута в реальной жизни)
  // ========================================================
  useEffect(() => {
    const hourInterval = setInterval(() => {
      setGameHour((prevHour) => {
        let nextHour = prevHour + 1;
        if (nextHour === 24) nextHour = 0; // Переход после 23:00 в полночь 00:00
        
        // В 06:00 утра наступает рассвет — хейтер побеждает лороведов
        if (nextHour === 6) {
          clearInterval(hourInterval);
          // Полностью уничтожаем все таймеры перед победным экраном
          Object.values(attackTimersRef.current).forEach(t => { if (t) clearTimeout(t); });
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          onWin();
        }
        return nextHour;
      });
    }, 60000); // 60 секунд реального времени = 1 игровой час

    return () => clearInterval(hourInterval);
  }, [onWin]);
  // ========================================================
  // 6. ЖЕЛЕЗОБЕТОННЫЙ СПАВН: БЕЗ СБРОСА ТАЙМЕРОВ (СТРОГО ПО ОДНОМУ)
  // ========================================================
  useEffect(() => {
    let spawnTimeoutId = null;

    const tickSpawn = () => {
      // Если прямо сейчас идет скример — прерываем текущий тик и ждем еще 6 секунд
      if (screamerMonsterRef.current) {
        spawnTimeoutId = setTimeout(tickSpawn, 6000);
        return;
      }

      // Используем функциональный апдейтер стейта, чтобы заглянуть в "живую" память React
      setMonsterPositions((currentPositions) => {
        // Подсчитываем количество активных танков в доме на данный момент
        const activeCount = Object.values(currentPositions).filter(pos => pos !== null).length;

        // БАЛАНСИРОВЩИК: Если в доме уже кто-то есть — отменяем спавн новых монстров!
        if (activeCount >= 1) {
          return currentPositions; // Возвращаем стейт без изменений
        }

        // Если в доме пусто, выбираем случайный танк-кошмар лороведов
        const monsters = ['azik', 'felix', 'marti', 'misau'];
        const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
        
        const config = monsterConfig[randomMonster];
        const targetRoom = config.rooms[Math.floor(Math.random() * config.rooms.length)];
        const targetDir = config.possibleDirections[Math.floor(Math.random() * config.possibleDirections.length)];

        // Навешиваем на заспавненного одиночку 20-секундный таймер до атаки
        if (attackTimersRef.current[randomMonster]) clearTimeout(attackTimersRef.current[randomMonster]);
        
        attackTimersRef.current[randomMonster] = setTimeout(() => {
          // Если хейтер прозевал 20 секунд — триггерим скример
          triggerScreamer(randomMonster);
        }, 20000);

        // Обновляем позицию только для выбранного монстра
        return {
          ...currentPositions,
          [randomMonster]: { room: targetRoom, dir: targetDir }
        };
      });

      // Перезапускаем цикл спавна ровно через 6 секунд (Будут спавниться ОЧЕНЬ ЧАСТО)
      spawnTimeoutId = setTimeout(tickSpawn, 6000);
    };

    // Запускаем первую попытку спавна через 6 секунд после старта игры
    spawnTimeoutId = setTimeout(tickSpawn, 6000);

    return () => {
      if (spawnTimeoutId) clearTimeout(spawnTimeoutId);
      Object.values(attackTimersRef.current).forEach(t => { if (t) clearTimeout(t); });
    };
  }, []); // Массив зависимостей СТРОГО пустой! Никаких сбросов таймера в фоне!

  // Функция вызова скримера
  const triggerScreamer = (monsterName) => {
    setFlashlightOn(false);
    setScreamerMonster(monsterName);
    
    // Через 3 секунды непрерывного 3D-наплыва открываем меню Game Over
    setTimeout(() => {
      setIsGameOverScreen(true);
    }, 3000);
  };

  // ========================================================
  // 7. ТАЙМЕР БАТАРЕИ ФОНАРИКА (1% за 3 секунды работы)
  // ========================================================
  useEffect(() => {
    let batteryInterval = null;
    if (flashlightOn && battery > 0) {
      batteryInterval = setInterval(() => {
        setBattery((prev) => {
          if (prev <= 1) {
            setFlashlightOn(false); // Выключаем свет, если батарея села в ноль
            clearInterval(batteryInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 3000); // 3 секунды
    }
    return () => { if (batteryInterval) clearInterval(batteryInterval); };
  }, [flashlightOn, battery]);
  // ========================================================
  // 8. НАВИГАЦИЯ, ВРАЩЕНИЕ И ДВИЖЕНИЕ КАМЕРЫ
  // ========================================================
  const handleRoomChange = (roomName) => {
    if (currentRoom === roomName || screamerMonster) return;
    
    setIsShaking(true);
    setCurrentRoom(roomName);
    setLookDirection('center'); // Сброс ракурса строго в центр при беге в любую другую комнату
    
    // Эффект тряски (бега) длится 0.4 секунды
    setTimeout(() => {
      setIsShaking(false);
    }, 400); 
  };

  // Вращение головой внутри комнаты (поворот камеры влево и вправо)
  const handleRotate = (side) => {
    if (screamerMonster) return;
    if (side === 'left') {
      if (lookDirection === 'center') setLookDirection('left');
      else if (lookDirection === 'right') setLookDirection('center');
    } else if (side === 'right') {
      if (lookDirection === 'center') setLookDirection('right');
      else if (lookDirection === 'left') setLookDirection('center');
    }
  };

  // Переключатель кнопки фонаря
  const toggleFlashlight = () => {
    if (battery > 0 && !screamerMonster) {
      setFlashlightOn(!flashlightOn);
    }
  };

  // ========================================================
  // 9. ИСПРАВЛЕННАЯ СИСТЕМА ИЗГНАНИЯ МОНСТРОВ (ПОКАДРОВЫЙ ТАЙМЕР)
  // ========================================================
  useEffect(() => {
    const checkScaring = () => {
      let activeMonsterToScare = null;

      // Сверяемся с актуальными рефами каждую миллисекунду
      if (flashlightOnRef.current && battery > 0 && !screamerMonsterRef.current) {
        Object.entries(monsterPositionsRef.current).forEach(([name, pos]) => {
          if (pos && pos.room === currentRoomRef.current && pos.dir === lookDirectionRef.current) {
            activeMonsterToScare = name;
          }
        });
      }

      if (activeMonsterToScare) {
        // Если только что навели луч фонаря на цель
        if (currentScaredMonsterRef.current !== activeMonsterToScare) {
          currentScaredMonsterRef.current = activeMonsterToScare;
          scaringStartTimeRef.current = performance.now();
        } else {
          // Если продолжаем удерживать свет на танке
          const elapsed = performance.now() - scaringStartTimeRef.current;
          
          if (elapsed >= 5000) { // Ровно 5 секунд (5000 миллисекунд)
            const monsterToRemove = activeMonsterToScare;
            
            // Мгновенно зачищаем все рефы и останавливаем покадровый цикл
            currentScaredMonsterRef.current = null;
            scaringStartTimeRef.current = null;
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

            // Полностью уничтожаем таймер атаки этого монстра
            if (attackTimersRef.current[monsterToRemove]) {
              clearTimeout(attackTimersRef.current[monsterToRemove]);
              attackTimersRef.current[monsterToRemove] = null;
            }

            // Намертво стираем танк из стейта игры («исчезает во всех смыслах»)
            setMonsterPositions(prev => ({ ...prev, [monsterToRemove]: null }));
            return; // Выходим из кадра
          }
        }
      } else {
        // Если игрок убрал фонарь или отвернулся — мгновенно сбрасываем прогресс
        currentScaredMonsterRef.current = null;
        scaringStartTimeRef.current = null;
      }

      // Запрашиваем проверку на следующий кадр анимации монитора
      animationFrameRef.current = requestAnimationFrame(checkScaring);
    };

    // Запускаем непрерывный цикл слежения за лучом света
    animationFrameRef.current = requestAnimationFrame(checkScaring);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [battery]);
  // ========================================================
  // 10. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ РЕНДЕРА И КАРКАС ИНТЕРФЕЙСА
  // ========================================================
  const formatTime = () => `${gameHour < 10 ? '0' + gameHour : gameHour}:00`;

  // Подгрузка правильного фона для пяти раздельных локаций
  const getRoomBackground = () => {
    switch (currentRoom) {
      case 'bedroom': return '/src/assets/krovat.png';       
      case 'wardrobe_room': return '/src/assets/shkaf.png';  
      case 'kuhnya': return '/src/assets/Kuhnya.png'; 
      case 'tualet': return '/src/assets/tualet.png'; 
      case 'left_corridor': return 'https://unsplash.com'; 
      case 'right_corridor': return 'https://unsplash.com'; 
      default: return '/src/assets/krovat.png';
    }
  };

  // Расчет сдвига панорамы при осмотре углов влево/вправо
  const getPanoramaTransform = () => {
    let translateValue = '0%';
    if (lookDirection === 'left') translateValue = '12%';
    if (lookDirection === 'right') translateValue = '-12%';
    return `translateX(${translateValue}) scale(1.15)`;
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-zinc-200 select-none overflow-hidden font-mono p-4 justify-between">
      
      {/* Стили анимаций, встроенные через Tailwind arbitrary values */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes screamerZoom {
          0% { transform: scale(0.05); filter: brightness(0.2) contrast(100%); }
          15% { filter: brightness(1) contrast(130%); }
          100% { transform: scale(4.5); }
        }
        @keyframes shakeEffect {
          0%, 100% { transform: translate(0, 0); }
          20%, 60% { transform: translate(-4px, 4px); }
          40%, 80% { transform: translate(4px, -4px); }
        }
      `}} />

      {/* ЭКРАН ИГРЫ (ОБЫЧНЫЙ РЕЖИМ ВЫЖИВАНИЯ) */}
      {!screamerMonster && (
        <>
          {/* ИНФОРМАЦИОННЫЙ ИНТЕРФЕЙС ВВЕРХУ */}
          <div className="flex justify-between items-center max-w-4xl mx-auto w-full border border-zinc-800 bg-zinc-950/90 p-3 rounded z-30 backdrop-blur-md">
            <div className="text-red-600 font-bold tracking-widest text-lg animate-pulse">ВРЕМЯ: {formatTime()}</div>
            <div className="text-zinc-500 text-xs uppercase tracking-widest hidden sm:block">
              КОМНАТА: {currentRoom.replace('_', ' ')} | ОБЗОР: {lookDirection.toUpperCase()}
            </div>
            <div className={`font-bold text-sm ${battery < 20 ? 'text-red-500 animate-bounce' : 'text-yellow-500'}`}>ЗАРЯД: {battery}%</div>
          </div>

          {/* ИГРОВОЕ ОКНО НАБЛЮДЕНИЯ С ДИНАМИЧЕСКИМ ОБЗОРОМ */}
          <div className={`flex-1 flex items-center justify-center max-w-4xl mx-auto w-full border-2 border-zinc-900 bg-zinc-950 relative rounded-md shadow-2xl overflow-hidden my-3 transition-transform duration-200 ${isShaking ? 'animate-[shakeEffect_0.35s_ease-in-out_infinite]' : ''}`}>
            
            {/* Задний фон с панорамным вращением */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out" style={{ backgroundImage: `url(${getRoomBackground()})`, transform: getPanoramaTransform() }} />

            {/* ОТРИСОВКА ТАНКОВ-МОНСТРОВ В УГЛАХ ТЕКУЩЕЙ КОМНАТЫ */}
            {Object.entries(monsterPositions).map(([name, pos]) => {
              if (pos && pos.room === currentRoom) {
                // Проверяем, совпадает ли ракурс монстра с направлением взгляда игрока
                const isVisibleInDirection = pos.dir === lookDirection;
                if (!isVisibleInDirection) return null;

                return (
                  <img
                    key={name}
                    src={monsterConfig[name].img}
                    alt={name}
                    className="absolute w-32 md:w-44 bottom-14 z-15 filter brightness-[0.25] contrast-125 pointer-events-none transition-all duration-300 bg-transparent mix-blend-normal"
                    style={{
                      left: pos.dir === 'left' ? '15%' : pos.dir === 'right' ? 'auto' : '50%',
                      right: pos.dir === 'right' ? '15%' : 'auto',
                      transform: pos.dir === 'center' ? 'translateX(-50%)' : 'none',
                    }}
                  />
                );
              }
              return null;
            })}

            {/* ЭФФЕКТ НАПРАВЛЕННОГО ЛУЧА ФОНАРИКА (Радиальная маска тьмы) */}
            <div className={`absolute inset-0 pointer-events-none z-20 transition-all duration-300 ${flashlightOn && battery > 0 ? 'bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.96)_55%)]' : 'bg-black/98'}`} />

            {/* Физические стрелки вращения камеры внутри локации */}
            <button onClick={() => handleRotate('left')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 border border-zinc-800 text-zinc-400 hover:text-white p-4 rounded-full z-30 hover:bg-zinc-900 active:scale-90 transition-all text-xl">◀</button>
            <button onClick={() => handleRotate('right')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 border border-zinc-800 text-zinc-400 hover:text-white p-4 rounded-full z-30 hover:bg-zinc-900 active:scale-90 transition-all text-xl">▶</button>
          </div>
          {/* НИЖНЯЯ ПАНЕЛЬ И УМНАЯ СЕТКА ПЕРЕМЕЩЕНИЙ */}
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-2 z-30">
            {/* Кнопка фонарика */}
            <button onClick={toggleFlashlight} className={`w-full py-3 font-bold uppercase tracking-widest text-xs border transition-all duration-300 rounded active:scale-[0.99] ${flashlightOn && battery > 0 ? 'bg-yellow-500 text-black border-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.35)]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}>
              {flashlightOn ? '🔦 Выключить фонарь' : '🔦 Включить фонарь'}
            </button>

            {/* Навигационная карта по твоим правилам (Шкаф — главный перекресток) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              
              {/* СПАЛЬНЯ: Всего одна кнопка, ведущая в комнату со шкафом */}
              {currentRoom === 'bedroom' && (
                <button 
                  onClick={() => handleRoomChange('wardrobe_room')} 
                  className="bg-zinc-900/90 border border-zinc-800 hover:border-red-950 hover:text-red-400 p-3 text-xs uppercase tracking-wider transition-colors col-span-2 md:col-span-3"
                >
                  🚪 Идти в комнату со шкафом
                </button>
              )}

              {/* КОМНАТА СО ШКАФОМ: Главный хаб, разветвляющийся во все стороны */}
              {currentRoom === 'wardrobe_room' && (
                <>
                  <button onClick={() => handleRoomChange('left_corridor')} className="bg-zinc-900/90 border border-zinc-800 hover:border-red-900 hover:text-red-400 p-3 text-xs uppercase tracking-wider transition-colors">🚪 Левая дверь (В левый коридор)</button>
                  <button onClick={() => handleRoomChange('bedroom')} className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-500 p-3 text-xs uppercase tracking-wider transition-colors">🛏️ Вернуться в Спальню</button>
                  <button onClick={() => handleRoomChange('right_corridor')} className="bg-zinc-900/90 border border-zinc-800 hover:border-red-900 hover:text-red-400 p-3 text-xs uppercase tracking-wider transition-colors">🚪 Правая дверь (В правый коридор)</button>
                </>
              )}

              {/* ЛЕВЫЙ КОРИДОР: Назад к шкафу или вперед в туалет */}
              {currentRoom === 'left_corridor' && (
                <>
                  <button onClick={() => handleRoomChange('wardrobe_room')} className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-500 p-3 text-xs uppercase tracking-wider transition-colors">⬅ Назад к Шкафу</button>
                  <button onClick={() => handleRoomChange('tualet')} className="bg-zinc-900/90 border border-zinc-800 hover:border-red-900 hover:text-red-400 p-3 text-xs uppercase tracking-wider transition-colors">🚽 Зайти в Туалет</button>
                </>
              )}

              {/* ПРАВЫЙ КОРИДОР: Назад к шкафу или вперед на кухню */}
              {currentRoom === 'right_corridor' && (
                <>
                  <button onClick={() => handleRoomChange('wardrobe_room')} className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-500 p-3 text-xs uppercase tracking-wider transition-colors">⬅ Назад к Шкафу</button>
                  <button onClick={() => handleRoomChange('kuhnya')} className="bg-zinc-900/90 border border-zinc-800 hover:border-red-900 hover:text-red-400 p-3 text-xs uppercase tracking-wider transition-colors">🍳 Зайти на Кухню</button>
                </>
              )}

              {/* ТУАЛЕТ: Выход только в левый коридор */}
              {currentRoom === 'tualet' && <button onClick={() => handleRoomChange('left_corridor')} className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-500 p-3 text-xs uppercase tracking-wider transition-colors col-span-2 md:col-span-1">⬅ Выйти в Левый коридор</button>}
              
              {/* КУХНЯ: Выход только в правый коридор */}
              {currentRoom === 'kuhnya' && <button onClick={() => handleRoomChange('right_corridor')} className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-500 p-3 text-xs uppercase tracking-wider transition-colors col-span-2 md:col-span-1">⬅ Выйти в Правый коридор</button>}
            </div>
          </div>
        </>
      )}

      {/* РЕЖИМ АТАКИ: ИСПРАВЛЕННЫЙ 3D СКРИМЕР НА ВЕСЬ ЭКРАН ТАЙЛВИНДА */}
      {screamerMonster && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
          {!isGameOverScreen ? (
            /* Танк увеличивается без ограничений, пока полностью не перекроет экран */
            <img
              src={monsterConfig[screamerMonster].img}
              alt="СКРИМЕР!"
              className="w-screen h-screen object-cover animate-[screamerZoom_0.6s_cubic-bezier(0.6,-0.28,0.735,0.045)_forwards] filter brightness-125 contrast-125 select-none pointer-events-none"
            />
          ) : (
            /* Спустя ровно 3 секунды наезда скримера — выводим меню проигрыша */
            <div className="z-50 text-center max-w-sm px-6 py-8 bg-zinc-950/90 border-2 border-red-700 rounded shadow-[0_0_50px_rgba(220,38,38,0.3)] backdrop-blur-md">
              <h2 className="text-4xl font-extrabold text-red-600 tracking-widest uppercase mb-4 font-serif">Ты уничтожен</h2>
              <p className="text-zinc-400 text-xs mb-8 uppercase tracking-wider">Теоретики лора Геранда преподали тебе урок.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-red-950/40 border border-red-700 text-red-400 hover:bg-red-600 hover:text-black font-bold uppercase text-xs tracking-wider transition-all rounded active:scale-95">Начать заново</button>
                <button onClick={onGameOver} className="w-full py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white uppercase text-xs tracking-widest transition-all rounded">В меню</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
