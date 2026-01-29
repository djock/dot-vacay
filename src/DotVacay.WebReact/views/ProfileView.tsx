import React from 'react';

interface ProfileViewProps {
  user: { name: string; email: string } | null;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'G';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-bold text-2xl border border-sky-200 mb-4">
          {initials}
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{user?.name || 'Traveler'}</h1>
        <p className="text-slate-500 mt-1">{user?.email || 'No email available'}</p>

        <div className="mt-8 w-full max-w-md">
          <div className="bg-slate-50 rounded-2xl p-6 text-left">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Account</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Plan</span>
                <span className="font-semibold text-slate-800">Free Plan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Member Since</span>
                <span className="font-semibold text-slate-800">Recently joined</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
