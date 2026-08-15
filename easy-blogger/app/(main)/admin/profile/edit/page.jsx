"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Bell, ShieldCheck, Globe, Smartphone, X } from "lucide-react";

import { auth } from "../../../../../lib/firebase";
import { api } from "../../../../../lib/api";

export default function EditAdminProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const response = await api.getMe(token);
      const userData = response.data || response;

      console.log("FRESH DATA FROM BACKEND:", userData);

      setFormData({
        name: userData.displayName || userData.username || "",
        email: userData.email || user.email ||"",
        bio: userData.bio || "",
        avatar: userData.avatarUrl || null,
        settings: {
          notifications: true,
          weeklyExport:userData.receiveWeeklyExport || false,
        }
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const payload = {
        displayName: formData.name,
        bio: formData.bio,
        avatarUrl: formData.avatar,
        receiveWeeklyExport: formData.settings.weeklyExport,
      };

      await api.updateProfile(payload, token);
      router.refresh();

      router.push("/admin/profile");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading profile data...</div>;
  if (!formData) return <div className="p-8 text-red-500">Failed to load profile. Please log in.</div>;

  return (
    <div className="max-w-4xl mx-auto p-12 relative">

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "serif" }}>Edit Profile</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/profile" className="px-6 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-500">Cancel</Link>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-full bg-[#1ABC9C] text-white text-sm font-bold shadow-sm">{saving ? "Updating..." : "Save Changes"}</button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-sm flex gap-16">
          <div className="relative h-fit">
            <div className="w-32 h-32 bg-gray-50 rounded-full border-2 border-gray-100 flex items-center justify-center overflow-hidden text-gray-300 font-bold text-2xl">
              {formData.avatar ? <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" /> : formData.name.charAt(0)}
            </div>
            <label className="absolute bottom-1 right-1 p-2 bg-[#1ABC9C] text-white rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-[#17a589] transition-colors">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="flex-1 space-y-6 text-left">
            <div className="grid grid-cols-2 gap-6">
              <div><label className="text-xs font-bold text-gray-900 mb-2 block uppercase">Admin Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C]" /></div>
              {/* Note: Email is usually read-only unless synced properly with Firebase auth, disabled for safety */}
              <div><label className="text-xs font-bold text-gray-900 mb-2 block uppercase">System Email</label><input type="email" value={formData.email} disabled className="w-full p-3 bg-gray-100 text-gray-500 border border-gray-100 rounded-xl text-sm outline-none cursor-not-allowed" /></div>
            </div>
            <div><label className="text-xs font-bold text-gray-900 mb-2 block uppercase">Administrative Bio</label><textarea rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C] resize-none text-[#374151]" /></div>
          </div>
        </div>

        {/* GOVERNANCE ALERTS SECTION */}
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-left opacity-75">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={18} className="text-[#1ABC9C]" />
            <h3 className="text-lg font-bold">System Governance Alerts </h3>
          </div>
          <div className="space-y-6">

            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <p className="text-sm font-bold text-gray-800">High-Priority Report Notifications</p>
                <p className="text-xs text-gray-400">Alert when post receives &gt; 5 reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.settings.notifications} onChange={() => setFormData({ ...formData, settings: { ...formData.settings, notifications: !formData.settings.notifications } })} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1ABC9C] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Audit Log Weekly Export</p>
                <p className="text-xs text-gray-400">Automated CSV summary of system changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.settings.weeklyExport} onChange={() => setFormData({ ...formData, settings: { ...formData.settings, weeklyExport: !formData.settings.weeklyExport } })} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1ABC9C] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}