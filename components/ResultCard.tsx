import React, { useState } from 'react';
import { Member } from '../types';
import { generateIcebreakers } from '../services/geminiService';
import { Sparkles, RefreshCcw, MessageSquare } from 'lucide-react';

interface ResultCardProps {
  user: Member;
  matchedMember: Member;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ user, matchedMember, onReset }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetInsights = async () => {
    setLoading(true);
    const result = await generateIcebreakers(user, matchedMember);
    setInsights(result);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
          <p className="opacity-90">Prepare for your 1-to-1 meeting</p>
        </div>

        {/* Members Comparison */}
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            {/* User */}
            <div className="text-center flex-1">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
              <p className="text-gray-500">{user.category}</p>
              <p className="text-sm text-gray-400">{user.company}</p>
            </div>

            {/* VS Badge */}
            <div className="text-gray-300 font-bold text-xl">🤝</div>

            {/* Match */}
            <div className="text-center flex-1">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                style={{ backgroundColor: matchedMember.color }}
              >
                {matchedMember.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{matchedMember.name}</h3>
              <p className="text-gray-500">{matchedMember.category}</p>
              <p className="text-sm text-gray-400">{matchedMember.company}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
             {!insights && (
                <button
                    onClick={handleGetInsights}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>Generating...</>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generate AI Conversation Starters
                        </>
                    )}
                </button>
             )}

            {insights && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 text-indigo-800 font-bold border-b border-indigo-200 pb-2">
                        <MessageSquare size={20} />
                        <h3>AI Meeting Assistant</h3>
                    </div>
                    <div 
                        className="prose prose-sm prose-indigo max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: insights }}
                    />
                </div>
            )}

            <button
              onClick={onReset}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCcw size={18} />
              Spin Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
