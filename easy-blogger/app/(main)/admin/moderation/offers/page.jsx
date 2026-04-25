"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, Plus, Save, AlertCircle, MousePointer2, Percent, Tag } from "lucide-react";

import { auth } from "../../../../../lib/firebase"; 
import { api } from "../../../../../lib/api";

export default function OffersPage() {
  const [offers, setOffers] = useState([]); 
  const [filterStatus, setFilterStatus] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const dropdownRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");
  
  // 2. UPDATED STATE TO MATCH PRISMA SCHEMA
  const [formData, setFormData] = useState({
    name: "", discount_percent: "",stripe_coupon_id: "", is_active: true,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRealOffers();
      }
    });

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  // --- REAL BACKEND FETCH ---
  const fetchRealOffers = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const response = await api.getOffers(token);
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setOffers(data);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    }
  };

  const handleSelectOffer = (offer) => {
    setIsAddingNew(false);
    setSelectedId(offer.id);
    setFormData({ ...offer});
    setErrors({});
    setSubmitError("");
  };

  const handlePlusClick = () => {
    setSelectedId(null);
    setIsAddingNew(true);
    setFormData({
      name: "", discount_percent: "", stripe_coupon_id: "", is_active: true
    });
    setErrors({});
    setSubmitError("");
  };

  const toggleVisibility = async () => {
    const newActiveState = !formData.is_active;
    
    // Update local editor state immediately
    setFormData({ ...formData, is_active: newActiveState });
  };

  const validateAndTriggerVerify = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Offer Name is required.";
    
    // STRIPE ID VALIDATION
    const stripeId = formData.stripe_coupon_id?.trim();
    if (!stripeId) {
      newErrors.stripe_coupon_id = "Stripe Coupon ID is required.";
    } else if (/\s/.test(stripeId)) {
      newErrors.stripe_coupon_id = "Coupon IDs cannot contain spaces.";
    } else if (/[^a-zA-Z0-9_-]/.test(stripeId)) {
      newErrors.stripe_coupon_id = "Only letters, numbers, hyphens, and underscores allowed.";
    }

    const discount = parseInt(formData.discount_percent);
    if (formData.discount_percent && (isNaN(discount) || discount < 0 || discount > 100)) {
      newErrors.discount_percent = "Must be 0-100.";
    }
    
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setShowVerifyModal(true); 
  };

  // --- REAL BACKEND SAVE ---
  const confirmFinalSave = async () => {
    try {
      setSubmitError("");
      const user = auth.currentUser;
      const token = await user.getIdToken();

      // Match the payload to the Prisma schema
      const payload = {
        name: formData.name,
        discount_percent: parseInt(formData.discount_percent)|| 0,
        stripe_coupon_id: formData.stripe_coupon_id.trim(),
        is_active: formData.is_active
      };

      if (isAddingNew) {
        await api.createOffer(payload, token);
      } else {
       await api.updateOffer(selectedId, payload, token);
      }

      await fetchRealOffers(); 
      setShowVerifyModal(false);
      setIsAddingNew(false);
      setSelectedId(null);
      
    } catch (err) { 
      console.error("Save Error:", err); 
      setShowVerifyModal(false);
      setSubmitError(err.message || "Failed to save to the database. Please try again.");
    }
  };

  const filteredOffers = offers.filter(o => 
    (filterStatus ? (filterStatus === 'active' ? o.is_active : !o.is_active) : true) && 
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 bg-[#F9FAFB]">
      {/* LEFT COLUMN */}
      <div className="w-1/3 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Moderation</h1>
        <div className="flex gap-2 relative z-20"> 
          <div className="relative w-36" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full h-10 px-4 rounded-lg font-medium flex items-center justify-between transition-all ${filterStatus ? 'bg-[#1ABC9C] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280]'}`}>
              <span className="capitalize">{filterStatus || "Status"}</span>
              <ChevronDown size={16} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden">
                <button onClick={() => { setFilterStatus('active'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50">Active</button>
                <button onClick={() => { setFilterStatus('inactive'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50">Inactive</button>
                <button onClick={() => { setFilterStatus(null); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 border-t">Show All</button>
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[#9CA3AF]" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-10 bg-white border border-[#E5E7EB] rounded-lg text-sm" />
          </div>
        </div>

        <div className="bg-[#E5E7EB] p-1 rounded-full flex text-sm font-medium z-10">
          <Link href="/admin/moderation/queue" className="flex-1 py-1.5 text-center text-[#6B7280] hover:text-[#111827]">Queue</Link>
          <div className="flex-1 py-1.5 text-center bg-white text-[#111827] shadow-sm rounded-full">Offers</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-2 custom-scrollbar">
          <button onClick={handlePlusClick} className="w-full h-12 border-2 border-dashed border-[#1ABC9C] bg-[#E6F8F3] rounded-xl flex items-center justify-center text-[#1ABC9C] font-bold hover:bg-[#1ABC9C] hover:text-white transition-all shadow-sm"><Plus size={20} className="mr-2" /> Create New Offer</button>
          {filteredOffers.map((offer) => (
            <div key={offer.id} onClick={() => handleSelectOffer(offer)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedId === offer.id ? "border-[#1ABC9C] bg-white shadow-md ring-1 ring-[#1ABC9C]" : "bg-white border-[#E5E7EB]"}`}>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-[#111827] text-sm leading-tight">{offer.name}</h3>
                <div className={`w-8 h-2.5 rounded-full ${offer.is_active ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}></div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[13px] font-black text-gray-800">${offer.price}</p>
                {offer.discount_percent > 0 && (
                  <p className="text-[11px] font-bold text-[#1ABC9C] bg-[#E6F8F3] px-2 py-0.5 rounded-md">-{offer.discount_percent}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col overflow-hidden relative">
        {(selectedId || isAddingNew) ? (
          <div className="p-10 flex-1 overflow-y-auto">
            <h1 className="text-3xl font-black text-[#111827] italic mb-8" style={{ fontFamily: "Georgia, serif" }}>
              {isAddingNew ? "Add New Promo Offer" : `Update Promo: ${formData.name}`}
            </h1>

            {submitError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl text-sm flex items-start gap-3 shadow-sm">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{submitError}</p>
              </div>
            )}

            <div className="bg-[#F0FDFA] rounded-[35px] p-8 space-y-6 shadow-sm border border-gray-100 max-w-2xl">
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Offer Name:</label>
                  <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Summer Sale" className={`w-full p-3 border bg-white rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C] ${errors.name ? 'border-red-500' : 'border-gray-200'}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Discount (%):</label>
                  <div className="relative">
                    <input type="number" min="0" max="100" value={formData.discount_percent} onChange={(e) => setFormData({...formData, discount_percent: e.target.value})} placeholder="e.g. 50" className={`w-full p-3 pl-10 border bg-white rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#1ABC9C] ${errors.discount_percent ? 'border-red-500' : 'border-gray-200'}`} />
                    <Percent className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  </div>
                  {errors.discount_percent && <p className="text-red-500 text-xs mt-1">{errors.discount_percent}</p>}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Stripe Coupon ID:</label>
                  <div className="relative">
                    <input type="text" value={formData.stripe_coupon_id} onChange={(e) => setFormData({...formData, stripe_coupon_id: e.target.value})} placeholder="e.g. SUMMER50" className={`w-full p-3 pl-10 border bg-white rounded-xl text-sm font-mono outline-none focus:ring-1 focus:ring-[#1ABC9C] ${errors.stripe_coupon_id ? 'border-red-500' : 'border-gray-200'}`} />
                    <Tag className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  </div>
                  {errors.stripe_coupon_id && <p className="text-red-500 text-xs mt-1">{errors.stripe_coupon_id}</p>}
                </div>
              </div>


              <div className="flex items-center justify-between pt-6">
                <button onClick={validateAndTriggerVerify} className="bg-[#114A3F] text-white pl-6 pr-2 py-2 rounded-full flex items-center gap-3 shadow-md active:scale-95 transition-all">
                  <span className="font-bold text-sm">Save Action</span>
                  <div className="w-8 h-8 bg-[#4FD1C5] rounded-full flex items-center justify-center text-[#114A3F]"><Save size={18} /></div>
                </button>
                <div className="flex items-center gap-4">
                   <span className="text-xl font-black text-[#111827]">Visibility</span>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.is_active} onChange={toggleVisibility} />
                      <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-[#1ABC9C] after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 shadow-inner"></div>
                   </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF] select-none">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
               <MousePointer2 size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No Offer Selected</h3>
            <p className="text-sm mt-2">Click an offer on the left to edit, or create a new one.</p>
          </div>
        )}
      </div>

      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center">
            <AlertCircle size={32} className="text-[#1ABC9C] mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verify Changes</h2>
            <p className="text-sm text-gray-500 mb-6">You are applying a <span className="text-[#1ABC9C] font-bold">{formData.discount_percent}% discount</span> using the Stripe coupon code <span className="font-mono bg-gray-100 px-1 rounded">{formData.stripe_coupon_id}</span>.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowVerifyModal(false)} className="flex-1 font-bold text-gray-400 hover:text-gray-600 transition-colors">Back</button>
              <button onClick={confirmFinalSave} className="flex-1 bg-[#114A3F] hover:bg-[#0a2e27] text-white rounded-2xl py-3 font-bold transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}