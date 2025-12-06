import { useState } from 'react';
import { User as UserIcon, Edit2, Save, LogOut, Camera } from 'lucide-react';
import { User, Character } from '../App';



const defaultProfilePics = [
  'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?w=200',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
];

export default function StudentProfile({ user, character, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user.profilePic || defaultProfilePics[0]);

  const handleSave = () => {
    onUpdateUser({
      name,
      profilePic: selectedAvatar
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user.name || '');
    setSelectedAvatar(user.profilePic || defaultProfilePics[0]);
    setIsEditing(false);
    setShowAvatarPicker(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-4xl text-amber-400 mb-2">Profile</h2>
        <p className="text-xl text-purple-200">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <div className="flex items-start gap-8 mb-8">
          {/* Avatar */}
          <div className="relative">
            <img
              src={selectedAvatar}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-amber-400 object-cover"
            />
            {isEditing && (
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-700 flex items-center justify-center border-2 border-white shadow-lg transition-all"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-100 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-3xl text-white mb-2">{user.name}</h3>
                <div className="text-purple-200 mb-4">@{user.username}</div>
                <div className="flex gap-4">
                  <div className="bg-blue-600/20 px-4 py-2 rounded-lg border border-blue-400/30">
                    <div className="text-sm text-blue-300">Role</div>
                    <div className="text-white">Student</div>
                  </div>
                  <div className="bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-400/30">
                    <div className="text-sm text-purple-300">Level</div>
                    <div className="text-white">{character.level}</div>
                  </div>
                  <div className="bg-amber-600/20 px-4 py-2 rounded-lg border border-amber-400/30">
                    <div className="text-sm text-amber-300">Total XP</div>
                    <div className="text-white">{character.xp}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div className="mb-6 p-6 bg-slate-800/50 rounded-lg border-2 border-purple-400/30">
            <h4 className="text-white mb-4">Choose Avatar</h4>
            <div className="grid grid-cols-6 gap-4">
              {defaultProfilePics.map((pic, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedAvatar(pic);
                    setShowAvatarPicker(false);
                  }}
                  className={`rounded-full overflow-hidden border-4 transition-all hover:scale-110 ${
                    selectedAvatar === pic ? 'border-amber-400' : 'border-purple-400/30'
                  }`}
                >
                  <img src={pic} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Character Info */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <h3 className="text-2xl text-amber-400 mb-6">Character Information</h3>
        
        <div className="flex items-center gap-6">
          <img
            src={character.avatar}
            alt={character.name}
            className="w-24 h-24 rounded-full border-4 border-amber-400 object-cover"
          />
          <div className="flex-1">
            <div className="text-2xl text-white mb-1">{character.name}</div>
            <div className="text-purple-200 mb-4">{character.class}</div>
            <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden border-2 border-purple-400/30">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                style={{ width: `${(character.xp / character.maxXp) * 100}%` }}
              />
            </div>
            <div className="text-sm text-purple-200 mt-2">
              {character.xp} / {character.maxXp} XP to next level
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <h3 className="text-2xl text-amber-400 mb-6">Account Settings</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-400/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">Username</div>
                <div className="text-purple-200">@{user.username}</div>
              </div>
              <UserIcon className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-400/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white">Account Type</div>
                <div className="text-purple-200">Student Account</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
