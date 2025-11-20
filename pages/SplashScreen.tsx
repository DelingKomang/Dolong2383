import React, { useState, useEffect } from 'react';
import { Droplets } from 'lucide-react';
import Spinner from '../components/shared/Spinner';

interface SplashScreenProps {
  onLoginClick: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onLoginClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let transitionTimeout: ReturnType<typeof setTimeout>;

    if (isAnimating) {
      // Transition to the next page after the animation completes
      transitionTimeout = setTimeout(() => {
        onLoginClick();
      }, 3000); // 3-second animation
    }
    
    return () => {
      clearTimeout(transitionTimeout);
    };
  }, [isAnimating, onLoginClick]);

  const handleStartAnimation = () => {
    setIsAnimating(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-teal-900 to-gray-800 animate-gradient-slow">
      
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleStartAnimation}
          disabled={isAnimating}
          className="px-6 py-2 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg shadow-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
        >
          {isAnimating ? (
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Log In'
          )}
        </button>
      </div>

      <div className="text-center z-10 flex flex-col items-center">
         <div className="p-5 bg-black/20 rounded-full mb-8 backdrop-blur-sm shadow-2xl">
            <Droplets size={80} className="text-teal-300 drop-shadow-[0_0_15px_rgba(56,189,179,0.7)]" />
         </div>

        <div className={`${isAnimating ? 'animate-spin-clockwise' : ''}`}>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Rahajeng Rauh
          </h1>
          <p className="text-lg md:text-2xl text-teal-200 drop-shadow-md">
            Ring Aplikasi Bacol Bigalow
          </p>
        </div>
      </div>
      {isAnimating && <Spinner text="Mempersiapkan Log In..." />}
    </div>
  );
};

export default SplashScreen;