// src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useRecipes } from '../hooks/useRecipes';
import userService from '../services/userService';
import { Camera, Edit2, Save, X, User, Heart } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function ProfilePage() {
  const { favorites, loading: favLoading } = useFavorites();
  const { recipes: allRecipes } = useRecipes();
  const [profile, setProfile] = useState(userService.getUserProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Get favorite recipes with details
  const favoriteRecipes = allRecipes.filter(recipe =>
    favorites.some(fav => fav.recipe_id === recipe.id)
  );

  useEffect(() => {
    setProfile(userService.getUserProfile());
    setTempProfile(userService.getUserProfile());
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = userService.saveUserProfile(tempProfile);
      if (result.success) {
        setProfile(result.data);
        setIsEditing(false);
      } else {
        alert('Gagal menyimpan profil: ' + result.message);
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setIsEditing(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempProfile(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Profile Pengguna
          </h1>
          <p className="text-gray-600">
            Kelola informasi profil dan favorit Anda
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-white shadow-lg">
                  {tempProfile.avatar && tempProfile.avatar.trim() !== '' ? (
                    <img
                      src={tempProfile.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 md:w-16 md:h-16 text-blue-500" />
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Name and Actions */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={tempProfile.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center md:text-left text-xl font-bold"
                      placeholder="Nama pengguna"
                    />
                    <textarea
                      value={tempProfile.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder="Bio singkat tentang Anda..."
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      {profile.username}
                    </h2>
                    {profile.bio && (
                      <p className="text-gray-600 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Bergabung sejak {formatDate(profile.updatedAt || profile.userId.split('_')[1])}
                    </p>
                  </div>
                )}
              </div>

              {/* Edit Actions */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-800">
                Resep Favorit ({favoriteRecipes.length})
              </h2>
            </div>

            {favLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat favorit...</p>
              </div>
            ) : favoriteRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => window.location.href = `/recipe/${recipe.id}`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <div className="bg-red-500 text-white p-2 rounded-full">
                          <Heart className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {recipe.name}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {recipe.category === 'makanan' ? 'Makanan' : 'Minuman'}
                        </span>
                        {recipe.average_rating > 0 && (
                          <span className="flex items-center gap-1">
                            ⭐ {recipe.average_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Belum ada resep favorit
                </h3>
                <p className="text-gray-500 mb-6">
                  Mulai tambahkan resep favorit Anda dengan menekan tombol hati pada resep yang Anda suka.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Jelajahi Resep
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
