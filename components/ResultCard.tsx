import React from 'react';
import { Member } from '../types';
import { RefreshCcw, MessageCircle } from 'lucide-react';

interface ResultCardProps {
  user: Member;
  matchedMember: Member;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ user, matchedMember, onReset }) => {
  
  // Helper to format phone number and generate WhatsApp URL
  const getWhatsAppUrl = (phone: string, message: string) => {
    // Remove non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Assumption for India: If 10 digits, prepend 91.
    // If >10 and starts with 0, remove 0 and prepend 91.
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    } else if (cleanPhone.length > 10 && cleanPhone.startsWith('0')) {
        cleanPhone = '91' + cleanPhone.substring(1);
    }
    
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  };

  const message = `Hi ${matchedMember.name}, I'm ${user.name} from ${user.company}. I matched with you on the BNI Platina Connector wheel! Let's schedule a 1-to-1 meeting.`;
  const whatsappUrl = matchedMember.phone ? getWhatsAppUrl(matchedMember.phone, message) : null;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
          <p className="opacity-90">Connect instantly on WhatsApp</p>
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
             {whatsappUrl ? (
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md transform hover:scale-[1.02]"
                >
                    <MessageCircle size={24} />
                    Connect on WhatsApp
                </a>
             ) : (
                 <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                    <MessageCircle size={20} />
                    Phone number not available
                 </div>
             )}

            <button
              onClick={onReset}
              className="w-full py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all mt-2"
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