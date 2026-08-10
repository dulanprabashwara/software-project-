"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Activity, Clock, Laptop, ShieldAlert, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "../../../../lib/firebase";
import { api } from "../../../../lib/api";

export default function AdminProfilePage() {
  const router = useRouter();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const response = await api.getMe(token);

      const userData = response.data || response;

      let actionsCount = 0;
      let resolvedCount = 0;
      let realSessions = [];

      try {
        const metricsResponse = await api.getAdminMetrics(token);
        if (metricsResponse.data?.data) {
          const metrics = metricsResponse.data.data || metricsResponse.data;
          actionsCount = metricsResponse.data.data.totalActions;
          resolvedCount = metricsResponse.data.data.totalResolved;
        }
        await api.registerSession(token); 
        const sessionsResponse = await api.getActiveSessions(token);

        console.log("Real Sessions from DB:", sessionsResponse);

        // Safely extract the array whether it is in response.data or response.data.data
        let sessionsArray = [];
        if (Array.isArray(sessionsResponse)) sessionsArray = sessionsResponse;
        else if (Array.isArray(sessionsResponse.data)) sessionsArray = sessionsResponse.data;
        else if (Array.isArray(sessionsResponse.data?.data)) sessionsArray = sessionsResponse.data.data;
        
        // Map the backend data to match UI format
        if (sessionsArray.length > 0) {
          realSessions = sessionsArray.map(sess => ({
            id: sess.id,
            device: sess.deviceInfo,
            location: sess.ipAddress || "Active Session",
            status: "Online Now"
          }));
        }

      } catch (metricsErr) {
        console.error("Could not fetch metrics endpoint:", metricsErr);
      }

      setAdminData({
        name: userData.displayName || userData.username || "Admin User",
        email: userData.email,
        role: userData.role === "ADMIN" ? "Super Admin" : "User",
        bio: userData.bio || "No administrative bio provided yet.",
        avatar: userData.avatarUrl || null,
        lastLogin: userData.lastSeen ? new Date(userData.lastSeen).toLocaleString() : new Date().toLocaleString(),
        stats: {
          followers: userData.stats?.totalFollowers || "0",
          following: userData.stats?.totalFollowing || "0",
          actions: actionsCount,
          resolved: resolvedCount
        },
        permissions: ["Full Content Moderation", "User Data Access", "System API Management"],
        sessions: realSessions.length > 0 ? realSessions : [
          { id: "fallback", device: "Current Device", location: "Active Session", status: "Online Now" }
        ]
      });

    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      if (error.status === 401 || error.message.includes("401")) {
          alert("Your session was revoked. You are being logged out.");
          await auth.signOut();
          window.location.href = "/login"; 
        }
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

  const handleRevokeSession = async (sessionId, deviceName) => {
    const confirm = window.confirm(`Are you sure you want to terminate the session on ${deviceName}?`);
    if (!confirm) return;

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      
      await api.revokeSession(sessionId, token);
      
      alert("Session revoked successfully.");
      fetchProfile(); 
      
    } catch (error) {
      console.error("Failed to revoke session:", error);
      if (error.status === 401) {
        await auth.signOut();
        window.location.href = "/login"; // Hard redirect
      } else {
        alert("Failed to revoke session. Check the console.");
      }
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-bold">Loading Data...</div>;
  if (!adminData) return <div className="p-8 text-red-500 font-bold">Failed to load profile. Are you logged in?</div>;

  return (
    <div className="flex gap-12 p-8 bg-white max-w-7xl mx-auto">
      <div className="flex-1 text-left">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "serif" }}>{adminData.name}</h1>
        </div>

        <div className="space-y-10 mt-8">
          <section>
            <p className="text-[#374151] leading-relaxed text-base mb-6">{adminData.bio}</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 uppercase">
                <Clock size={12} /> Last Login: {adminData.lastLogin}
              </div>
            </div>
          </section>

          <section className="pt-8 border-t border-gray-50">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert size={14} /> Assigned Administrative Permissions
            </h3>
            <div className="flex flex-wrap gap-2">
              {adminData.permissions.map((perm, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold rounded-lg uppercase">{perm}</span>
              ))}
            </div>
          </section>

          <section className="pt-8 border-t border-gray-50">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Account Accountability Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-[#F0FDFA] rounded-3xl border border-[#CCFBF1]">
                <Activity className="text-[#1ABC9C] mb-4" size={24} />
                <h4 className="text-2xl font-black text-gray-900">{adminData.stats.actions}</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase">System Actions Logged</p>
              </div>
              <div className="p-6 bg-[#EFF6FF] rounded-3xl border border-[#DBEAFE]">
                <Shield className="text-[#3B82F6] mb-4" size={24} />
                <h4 className="text-2xl font-black text-gray-900">{adminData.stats.resolved}</h4>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Reports Resolved</p>
              </div>
            </div>
          </section>

          <section className="pt-8 border-t border-gray-50">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Laptop size={14} /> Active Management Sessions
            </h3>
            {adminData.sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-3">
                <div className="flex items-center gap-4">
                  <Monitor className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{session.device}</p>
                    <p className="text-xs text-gray-400">{session.location} • {session.status}</p>
                  </div>
                </div>
                <button onClick={() => handleRevokeSession(session.id, session.device)} className="text-[10px] font-black text-red-500 uppercase hover:underline">
                  Revoke Access
                </button>
              </div>
            ))}
          </section>
        </div>
      </div>

      <div className="w-64 pt-4 sticky top-8 h-fit text-left">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-6 flex items-center justify-center overflow-hidden text-gray-500 text-3xl font-bold shadow-sm">
          {adminData.avatar ? <img src={adminData.avatar} alt="Profile" className="w-full h-full object-cover" /> : adminData.name.charAt(0)}
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{adminData.name}</h2>
        <div className="text-xs text-gray-500 space-y-1 mb-4">
          <p>{adminData.stats.followers} Followers · {adminData.stats.following} Following</p>
          <p className="font-bold text-[#1ABC9C] uppercase text-[10px] tracking-widest mt-2 flex items-center gap-1"><Shield size={12} /> {adminData.role}</p>
        </div>
        <Link href="/admin/profile/edit" className="text-[#1ABC9C] text-sm font-medium hover:underline block mb-8 text-[13px]">Edit profile</Link>
      </div>
    </div>
  );
}