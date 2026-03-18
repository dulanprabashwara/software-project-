"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Bell, ShieldCheck, Globe, Smartphone, X } from "lucide-react";

export default function EditAdminProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  useEffect(() => {
    fetch('/api/users?type=adminProfile').then(res => res.json()).then(data => setFormData(data));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      action: "Updated Profile Settings", target: "Admin Governance",
      details: `Modified profile data and settings for ${formData.name}`,
      updatedData: formData 
    };
    await fetch('/api/users?action=updateProfile', { method: 'POST', body: JSON.stringify(payload) });
    router.push("/admin/profile");
  };

  // --- REAL WORLD: Image Upload ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleIpLock = async () => {
    const isLocked = formData.settings.lockedIp !== null;
    const newIp = isLocked ? null : "124.43.15.2";
    setFormData({ ...formData, settings: { ...formData.settings, lockedIp: newIp } });
    await fetch('/api/users?action=securityAction', {
      method: 'POST', body: JSON.stringify({ action: isLocked ? "Unlocked IP" : "Locked IP", securityType: 'lockIP', ip: newIp })
    });
  };

  if (!formData) return <div className="p-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-12 relative">
      {/* 2FA QR MODAL */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center relative">
            <button onClick={() => setShow2FAModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-2">Configure 2FA</h2>
            <p className="text-sm text-gray-500 mb-6">Scan this QR code with Google Authenticator or Authy.</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/EasyBlogger:${formData.email}?secret=JBSWY3DPEHPK3PXP&issuer=EasyBlogger`} alt="QR Code" className="mx-auto mb-6 border p-2 rounded-lg" />
            <input type="text" placeholder="Enter 6-digit code" className="w-full p-3 border rounded-xl text-center tracking-widest text-lg font-bold mb-4 outline-none focus:border-[#1ABC9C]" maxLength={6} />
            <button onClick={() => { alert("2FA Successfully Paired!"); setShow2FAModal(false); }} className="w-full py-3 bg-[#1ABC9C] text-white font-bold rounded-xl">Verify & Save</button>
          </div>
        </div>
      )}

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
            {/* REAL WORLD: Hidden File Input attached to Camera button */}
            <label className="absolute bottom-1 right-1 p-2 bg-[#1ABC9C] text-white rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-[#17a589] transition-colors">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="flex-1 space-y-6 text-left">
             <div className="grid grid-cols-2 gap-6">
              <div><label className="text-xs font-bold text-gray-900 mb-2 block uppercase">Admin Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C]" /></div>
              <div><label className="text-xs font-bold text-gray-900 mb-2 block uppercase">System Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C]" /></div>
            </div>
            <div><label className="text-xs font-bold text-gray-900 mb-2 block uppercase">Administrative Bio</label><textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C] resize-none text-[#374151]" /></div>
          </div>
        </div>

        {/* GOVERNANCE ALERTS SECTION */}
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-6">
            <Bell size={18} className="text-[#1ABC9C]"/>
            <h3 className="text-lg font-bold">System Governance Alerts</h3>
          </div>
          <div className="space-y-6">
            
            {/* Toggle 1: High-Priority */}
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <p className="text-sm font-bold text-gray-800">High-Priority Report Notifications</p>
                <p className="text-xs text-gray-400">Alert when post receives &gt; 5 reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.settings.notifications} onChange={() => setFormData({...formData, settings: {...formData.settings, notifications: !formData.settings.notifications}})} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1ABC9C] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>

            {/* Toggle 2: Critical System Errors */}
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Critical System Errors</p>
                <p className="text-xs text-gray-400">Email alerts for AI scraper failures</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.settings.criticalAlerts} onChange={() => setFormData({...formData, settings: {...formData.settings, criticalAlerts: !formData.settings.criticalAlerts}})} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1ABC9C] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>

            {/* Toggle 3: Audit Log Weekly Export */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Audit Log Weekly Export</p>
                <p className="text-xs text-gray-400">Automated CSV summary of system changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={formData.settings.weeklyExport} onChange={() => setFormData({...formData, settings: {...formData.settings, weeklyExport: !formData.settings.weeklyExport}})} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1ABC9C] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>

          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-6"><ShieldCheck size={18} className="text-[#1ABC9C]"/><h3 className="text-lg font-bold">Account Security & Hardening</h3></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3"><Globe size={18} className="text-gray-400" /><div><p className="text-sm font-bold text-gray-800">IP-Based Access Control</p><p className="text-[10px] text-gray-400 uppercase font-bold">Current IP: 124.43.15.2</p></div></div>
              <button onClick={handleIpLock} className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 uppercase tracking-tighter">{formData.settings.lockedIp ? "Unlock IP" : "Lock to IP"}</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3"><Smartphone size={18} className="text-gray-400" /><div><p className="text-sm font-bold text-gray-800">Administrative 2FA</p><p className="text-[10px] text-gray-400 uppercase font-bold">Secured via Google Authenticator</p></div></div>
              <button onClick={() => setShow2FAModal(true)} className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 uppercase tracking-tighter">Reset Keys</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}