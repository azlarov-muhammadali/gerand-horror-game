import React from 'react';

export default function IntroNewspaper({ onSkip }) {
  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-neutral-950 p-4 md:p-8 select-none overflow-y-auto">
      {/* Мрачный фоновый эффект */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_80%)] pointer-events-none z-10" />

      {/* ТЕЛО ГАЗЕТЫ */}
      <div className="relative z-20 w-full max-w-2xl bg-[#ece6d5] text-[#1a1510] p-6 md:p-10 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#d3c7a8] font-serif transform transition-transform duration-700 animate-fade-in">
        
        {/* Шапка газеты */}
        <div className="text-center border-b-4 border-double border-[#1a1510] pb-4 mb-6">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase font-black">
            ВЕЧЕРНИЙ ВЕСТНИК
          </h2>
          <div className="flex justify-between items-center text-xs md:text-sm font-mono mt-2 px-1 border-t border-[#1a1510] pt-1">
            <span>ВЫПУСК № 666</span>
            <span className="font-bold uppercase tracking-widest">СРОЧНЫЕ НОВОСТИ</span>
            <span>ЦЕНА: 15 КОП.</span>
          </div>
        </div>

        {/* Главный заголовок статьи */}
        <h1 className="text-xl md:text-3xl font-extrabold text-center leading-tight mb-6 uppercase tracking-tight">
          МЕСТЬ ТЕОРЕТИКОВ: ОЖИВШИЕ КОШМАРЫ НА ГУСЕНИЦАХ НАКАЖУТ НАГЛОГО КРИТИКА
        </h1>

        {/* Текст статьи с разделением на колонки (эффект газетной верстки) */}
        <div className="text-sm md:text-base leading-relaxed text-justify space-y-4 border-b-2 border-dashed border-[#1a1510] pb-6 mb-8 font-serif">
          <p className="indent-8 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:line-height-none">
            Все это время наглый хейтер оставлял злобные комментарии под разборами лора Геранда. 
            Терпение лороведов лопнуло. Теоретики решили проучить этого говнюка и показать, 
            как надо обращаться с создателями контента.
          </p>
          <p className="indent-8">
            Они проникли прямо в его сны, превратившись в стальные кошмары на гусеницах. 
            Теперь привычная комната стала ловушкой, а из темных углов доносится скрежет гусениц Азика, 
            Феликса, Марти и Мисау. Сможет ли он пережить эту ночь?
          </p>
        </div>

        {/* Кнопка SKIP в самом низу газеты */}
        <div className="flex justify-center">
          <button
            onClick={onSkip}
            className="px-10 py-3 text-sm md:text-base font-bold tracking-widest uppercase border-2 border-[#1a1510] bg-transparent text-[#1a1510] hover:bg-[#1a1510] hover:text-[#ece6d5] transition-all duration-300 rounded-sm active:scale-95 shadow-md"
          >
            Пропустить (Skip)
          </button>
        </div>

        {/* Эффект старой мятой бумаги поверх газеты */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-black/5 pointer-events-none mix-blend-overlay" />
      </div>
    </div>
  );
}
