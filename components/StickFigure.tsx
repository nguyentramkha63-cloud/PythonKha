
import { StickAction } from '../types';
import React, { useState, useEffect } from 'react';

interface StickFigureProps {
  action: StickAction;
  enableReveal?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const StickFigure: React.FC<StickFigureProps> = ({ action, enableReveal = true, onClick }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [rating, setRating] = useState(4.0);

  useEffect(() => {
    if (!isRevealed) return;
    
    const interval = setInterval(() => {
      // Simulate a fluctuating average rating between 4.0 and 10.0
      setRating(prev => {
        const target = 4.0 + Math.random() * 6.0; // Random target between 4 and 10
        const step = (target - prev) * 0.3; // Move 30% towards target for smooth-ish jump
        const next = prev + step;
        return parseFloat(next.toFixed(1));
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRevealed]);

  const isJumping = action === 'jump' || action === 'celebrate';
  const isThinking = action === 'think';
  const isError = action === 'error';

  // Link ảnh Thầy Kha từ Google Drive
  const thayKhaImageUrl = "https://lh3.googleusercontent.com/d/1JGYdJXUL5BiUucIxcxGQvNk5RIP3RXTR";

  const handleInternalClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (enableReveal) {
      e.stopPropagation();
      setIsRevealed(true);
    }
  };

  return (
    <>
      <div 
        className={`relative inline-block transition-all duration-300 cursor-pointer group`}
        onClick={handleInternalClick}
        title={enableReveal ? "Bấm để chiêm ngưỡng dung nhan Thầy Kha" : ""}
      >
        <div 
          className={`
            w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 overflow-hidden shadow-lg bg-white
            transition-transform duration-300 group-hover:scale-110 active:scale-95
            ${isJumping ? 'animate-jump border-yellow-400' : 'border-[#10b981]'}
            ${isThinking ? 'animate-pulse grayscale-[0.5]' : ''}
            ${isError ? 'animate-shake border-red-500' : ''}
          `}
        >
          <img 
            src={thayKhaImageUrl} 
            alt="Thầy Kha" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Kha";
            }}
          />
        </div>
        
        {/* Biểu tượng trạng thái nhỏ */}
        {isThinking && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-200">
            <span className="text-[10px] animate-bounce block">💭</span>
          </div>
        )}
      </div>

      {/* MODAL CHIÊM NGƯỠNG DUNG NHAN */}
      {isRevealed && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsRevealed(false)}
        >
          <div 
            className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-[0_35px_100px_-15px_rgba(0,0,0,0.5)] border-[6px] border-yellow-400 relative animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button 
              onClick={() => setIsRevealed(false)}
              className="absolute top-4 right-4 z-10 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90 transition-all font-black"
            >
              ✕
            </button>

            {/* Ảnh chân dung lớn */}
            <div className="aspect-square w-full bg-slate-100 relative overflow-hidden">
              <img 
                src={thayKhaImageUrl} 
                alt="Chân dung Thầy Kha" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>

            {/* Thông tin */}
            <div className="p-8 text-center bg-white">
              <h2 className="text-2xl sm:text-3xl font-black text-[#065f46] mb-1">
                Thầy Kha "Khó Tính"
              </h2>
              <p className="text-sm font-black text-black uppercase tracking-widest mb-6">
                NHƯNG EM LÀ SỐ 1
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-[11px] font-black border-2 border-yellow-200 shadow-sm transition-all duration-500">
                  ĐẸP TRAI {rating}/10
                </span>
                <span className="bg-emerald-100 text-[#059669] px-4 py-1.5 rounded-full text-[11px] font-black border-2 border-emerald-200 shadow-sm">
                  PYTHON TUTOR
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StickFigure;
