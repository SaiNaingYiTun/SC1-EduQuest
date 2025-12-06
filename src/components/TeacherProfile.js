import { useState } from 'react';
import { User as UserIcon, Edit2, Save, LogOut, BookOpen, Key, RefreshCw } from 'lucide-react';
import { User } from '../App';



const defaultProfilePics = [
  'https://images.unsplash.com/photo-1724435811349-32d27f4d5806?w=200',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
];

export default function TeacherProfile({ user, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [subjectName, setSubjectName] = useState(user.subjectName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.profilePic || defaultProfilePics[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = () => {
    onUpdateUser({
      name,
      subjectName,
      profilePic: selectedAvatar
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user.name || '');
    setSubjectName(user.subjectName || '');
    setSelectedAvatar(user.profilePic || defaultProfilePics[0]);
    setIsEditing(false);
    setShowAvatarPicker(false);
  };

  const handleRegenerateOTP = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';
    for (let i = 0; i < 8; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onUpdateUser({ otpCode: otp });
    alert('New OTP code generated!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-4xl text-amber-400 mb-2">Teacher Profile</h2>
        <p className="text-xl text-purple-200">Manage your account and course settings</p>
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
                <Edit2 className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-100 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-purple-100 mb-2">Subject/Course Name</label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter your subject or course name"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-3xl text-white mb-2">{user.name}</h3>
                <div className="text-purple-200 mb-4">@{user.username}</div>
                <div className="flex gap-4">
                  <div className="bg-amber-600/20 px-4 py-2 rounded-lg border border-amber-400/30">
                    <div className="text-sm text-amber-300">Role</div>
                    <div className="text-white">Teacher</div>
                  </div>
                  <div className="bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-400/30">
                    <div className="text-sm text-purple-300">Subject</div>
                    <div className="text-white">{user.subjectName}</div>
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

      {/* Course Settings */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <h3 className="text-2xl text-amber-400 mb-6">Course Settings</h3>
        
        <div className="space-y-4">
          <div className="bg-slate-800/30 rounded-lg p-6 border border-purple-400/20">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <BookOpen className="w-8 h-8 text-amber-400 mt-1" />
                <div className="flex-1">
                  <div className="text-white mb-1">Subject Name</div>
                  <div className="text-2xl text-amber-400 mb-2">{user.subjectName}</div>
                  <div className="text-sm text-purple-300">
                    This is the course that students will see when they join your class
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-6 border-2 border-amber-400/30">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <Key className="w-8 h-8 text-amber-400 mt-1" />
                <div className="flex-1">
                  <div className="text-white mb-1">Class OTP Code</div>
                  <div className="text-3xl text-amber-400 tracking-wider mb-2">{user.otpCode}</div>
                  <div className="text-sm text-purple-300">
                    Share this code with students so they can join your class. Students need your username and this OTP to enroll.
                  </div>
                </div>
              </div>
              <button
                onClick={handleRegenerateOTP}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 ml-4"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <h3 className="text-2xl text-amber-400 mb-6">Account Information</h3>
        
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
                <div className="text-purple-200">Teacher Account</div>
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
