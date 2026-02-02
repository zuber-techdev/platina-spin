import React, { useState, useMemo } from 'react';
import { Member } from '../types';
import { Search, User } from 'lucide-react';

interface MemberSelectorProps {
  members: Member[];
  onSelect: (member: Member) => void;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ members, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Who are you?</h2>
        <p className="text-gray-500 text-sm mt-1">Select your profile to start finding a match.</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by name or category..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No members found.</div>
        ) : (
          filteredMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group text-left"
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                  {member.name}
                </p>
                <p className="text-xs text-gray-500">{member.category}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberSelector;
