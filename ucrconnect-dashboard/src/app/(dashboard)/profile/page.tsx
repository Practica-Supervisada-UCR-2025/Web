'use client';
import { useEffect, useState } from 'react';
import { fetchProfile } from '@/lib/mockApi';
import { Pencil } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    profile_picture: '',
  });

  useEffect(() => {
    fetchProfile().then((res: any) => {
      setProfile(res.data);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-10">
      <div className="flex flex-col sm:flex-row items-center space-x-6 mb-10">
        <div className="relative group mb-4 sm:mb-0">
          <img
            src={profile.profile_picture || 'https://via.placeholder.com/120'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
          />
          <div className="absolute bottom-0 right-0 bg-white border shadow-md rounded-full p-1">
            <label htmlFor="profileImage" className="cursor-pointer">
              <Pencil className="w-5 h-5 text-blue-600" />
            </label>
          </div>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            className="hidden"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-blue-600">
            {profile.full_name || 'Nombre completo'}
          </h2>
          <p className="text-gray-600 mt-1">{profile.email}</p>
        </div>
      </div>

      <hr className="my-8" />
    </div>
  );
}
