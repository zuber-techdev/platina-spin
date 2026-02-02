import React, { useState, useMemo } from 'react';
import { MEMBERS } from './constants';
import { Member } from './types';
import MemberSelector from './components/MemberSelector';
import Wheel from './components/Wheel';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [matchedMember, setMatchedMember] = useState<Member | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Filter out the current user from the wheel options
  const wheelOptions = useMemo(() => {
    if (!currentUser) return [];
    return MEMBERS.filter((m) => m.id !== currentUser.id);
  }, [currentUser]);

  const handleUserSelect = (member: Member) => {
    setCurrentUser(member);
    setMatchedMember(null);
    setShowResult(false);
  };

  const handleSpinClick = () => {
    if (isSpinning || showResult) return;
    setIsSpinning(true);
    setMatchedMember(null);
  };

  const handleSpinEnd = (result: Member) => {
    setIsSpinning(false);
    setMatchedMember(result);
    // Add a small delay before showing the result card for effect
    setTimeout(() => {
        setShowResult(true);
    }, 500);
  };

  const handleReset = () => {
    setShowResult(false);
    setMatchedMember(null);
    // Keep the current user selected, just go back to wheel
  };

  const handleFullReset = () => {
    setCurrentUser(null);
    setMatchedMember(null);
    setShowResult(false);
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          <span className="text-red-700">BNI</span> Platina Connector
        </h1>
        <p className="text-gray-500">The easiest way to find your next 1-to-1 match</p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto">
        {!currentUser ? (
          <div className="animate-fade-in-up">
            <MemberSelector members={MEMBERS} onSelect={handleUserSelect} />
          </div>
        ) : !showResult ? (
          <div className="flex flex-col items-center animate-fade-in">
             <div className="mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <span className="text-gray-500 text-sm">Playing as:</span>
                <span className="font-bold text-gray-800">{currentUser.name}</span>
                <button 
                    onClick={handleFullReset}
                    className="ml-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                    Change
                </button>
             </div>

            <div className="relative mb-8 transform scale-90 md:scale-100">
               <Wheel 
                 members={wheelOptions} 
                 onSpinEnd={handleSpinEnd} 
                 isSpinning={isSpinning}
               />
            </div>

            <button
              onClick={handleSpinClick}
              disabled={isSpinning}
              className={`
                px-12 py-4 rounded-full text-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95
                ${isSpinning 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 ring-4 ring-red-100'}
              `}
            >
              {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL'}
            </button>
          </div>
        ) : matchedMember ? (
           <ResultCard 
             user={currentUser} 
             matchedMember={matchedMember} 
             onReset={handleReset} 
           />
        ) : null}
      </main>

      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} BNI Platina Chapter. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
