import { useState } from 'react';
import { User as UserIcon, Edit2, Save, LogOut, BookOpen, Key, RefreshCw } from 'lucide-react';
import { User, useToast } from '../App';


const defaultProfilePics = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
];
export default function TeacherProfile({ user, onUpdateUser, onLogout, stats }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [subjects, setSubjects] = useState(user.subjects || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.profilePic || defaultProfilePics[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const toast = useToast();




  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          name,
          subjects, // string from input, backend will store as [subjects]
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data?.message || 'Failed to save profile', 'error');
        return;
      }

      onUpdateUser(data);

      setIsEditing(false);
      setShowAvatarPicker(false);
      toast('Profile updated!', 'success');
    } catch (err) {
      toast('Failed to save profile', 'error');
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setSubjects(user.subjects || '');
    setSelectedAvatar(user.profilePic || defaultProfilePics[0]);
    setIsEditing(false);
    setShowAvatarPicker(false);
  };




  const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  //console.log("Cloudinary config:", CLOUD_NAME, UPLOAD_PRESET);


  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;


    // Optional: basic validation
    if (!file.type.startsWith("image/")) {
      toast("Please upload an image file.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast("Image too large (max 2MB).", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      // optional folder override (if not set in preset)
      // formData.append("folder", "eduquest/avatars");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Cloudinary error:", data);
        toast(data?.error?.message || "Upload failed", "error");
        return;
      }

      // Cloudinary returns secure_url
      const imageUrl = data.secure_url;

      // Update UI immediately
      setSelectedAvatar(imageUrl);

      // Save to YOUR backend (MongoDB) so it persists for the user
      await fetch(`/api/users/${user.id}/profile-pic`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ profilePic: imageUrl }),
      });

      // update app state
      onUpdateUser({ profilePic: imageUrl });

      toast("Profile picture updated!", "success");
    } catch (err) {
      console.error(err);
      toast("Upload failed. Please try again.", "error");
    }
  };

  //console.log(CLOUD_NAME, UPLOAD_PRESET);





  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl text-amber-400 mb-2">Teacher Profile</h2>
        <p className="text-purple-200">
          Update your profile details and avatar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-400/20">
          <div className="text-purple-300 text-sm">Courses</div>
          <div className="text-white text-2xl font-semibold">{stats?.courses ?? 0}</div>
        </div>
        <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-400/20">
          <div className="text-purple-300 text-sm">Students</div>
          <div className="text-white text-2xl font-semibold">{stats?.students ?? 0}</div>
        </div>
        <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-400/20">
          <div className="text-purple-300 text-sm">Quests</div>
          <div className="text-white text-2xl font-semibold">{stats?.quests ?? 0}</div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-400/30 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-8 mb-8">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <div className="relative">
              <img
                src={selectedAvatar}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-amber-400 object-cover object-center shadow-lg"
              />
              {isEditing && (
                <button
                  onClick={() => setShowAvatarPicker((v) => !v)}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full
                             bg-amber-600 hover:bg-amber-700 flex items-center justify-center
                             border-2 border-white shadow-lg transition-all"
                  title="Change avatar"
                  type="button"
                >
                  <Edit2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
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
                  <label className="block text-purple-100 mb-2">Faculty / Department</label>
                  <input
                    type="text"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-purple-400/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-3xl text-white mb-1">{user.name}</h3>
                <div className="text-purple-200 mb-4">@{user.username}</div>

                <div className="flex flex-wrap gap-3">
                  <div className="bg-amber-600/20 px-4 py-2 rounded-lg border border-amber-400/30">
                    <div className="text-sm text-amber-300">Role</div>
                    <div className="text-white">Teacher</div>
                  </div>

                  <div className="bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-400/30">
                    <div className="text-sm text-purple-300">Faculty</div>
                    <div className="text-white">
                      {Array.isArray(user.subjects) ? (user.subjects[0] || 'Not set') : (user.subjects || 'Not set')}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Avatar Picker */}
        {showAvatarPicker && isEditing && (
          <div className="mb-6 p-6 bg-slate-800/50 rounded-xl border-2 border-purple-400/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white">Choose an avatar</h4>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="text-sm text-purple-200 hover:text-white"
                type="button"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {defaultProfilePics.map((pic, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedAvatar(pic);
                    setShowAvatarPicker(false);
                  }}
                  className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center
                              border-4 transition-all hover:scale-105
                              ${selectedAvatar === pic ? 'border-amber-400' : 'border-purple-400/30'}`}
                  type="button"
                >
                  <img
                    src={pic}
                    alt="Avatar"
                    onError={(e) => (e.currentTarget.src = defaultProfilePics[0])}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>

            {/* Upload from device */}
            <div className="mt-5">
              <label className="text-sm text-purple-200 block mb-2">Upload from device</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-white"
              />
              <div className="text-xs text-purple-300 mt-2">
                PNG/JPG, max 2MB
              </div>
            </div>

            {/* Optional direct URL (keep if you still want it) */}
            <div className="mt-5">
              <label className="text-sm text-purple-200 block mb-2">Or paste image URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  className="flex-1 bg-slate-700/50 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  value={selectedAvatar}
                  onChange={(e) => setSelectedAvatar(e.target.value)}
                />
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all"
                  type="button"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                type="button"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>

              <button
                onClick={handleCancel}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                type="button"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
              type="button"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Account Info */}
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

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
        type="button"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}
