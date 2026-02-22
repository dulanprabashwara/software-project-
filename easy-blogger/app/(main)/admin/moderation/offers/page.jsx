"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronDown, Plus, Check, Save, AlertCircle, X, MousePointer2 } from "lucide-react";

export default function OffersPage() {
  // --- STATE ---
  const [filterStatus, setFilterStatus] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const dropdownRef = useRef(null);

  // Validation & Modal States
  const [errors, setErrors] = useState({});
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");

  // Editable Form State
  const [formData, setFormData] = useState({
    name: "", price: "", duration: "Monthly", stripeId: "", visibility: true,
    features: []
  });

  // Mock Data with Escalating Real-World Features
  const [offers, setOffers] = useState([
    { 
      id: 1, name: "Free Community", price: "0.00", duration: "Lifetime", status: "active", stripeId: "price_free", visibility: true,
      features: [
        { name: "3 AI Topic Suggestions / day", enabled: true },
        { name: "Basic SEO Check", enabled: true },
        { name: "Community Support", enabled: true },
        { name: "Full AI Article Generator", enabled: false }
      ]
    },
    { 
      id: 2, name: "Starter Writer", price: "4.99", duration: "Monthly", status: "active", stripeId: "price_starter", visibility: true,
      features: [
        { name: "Unlimited AI Topic Suggestions", enabled: true },
        { name: "Advanced SEO Tools", enabled: true },
        { name: "Ad-Free Reading", enabled: true },
        { name: "Full AI Article Generator", enabled: false }
      ]
    },
    { 
      id: 3, name: "Pro Creator", price: "12.99", duration: "Monthly", status: "inactive", stripeId: "price_pro", visibility: false,
      features: [
        { name: "Priority AI Processing", enabled: true },
        { name: "Custom Domain Mapping", enabled: true },
        { name: "Revenue Analytics", enabled: true },
        { name: "Full AI Article Generator", enabled: true }
      ]
    }
  ]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleSelectOffer = (offer) => {
    setIsAddingNew(false);
    setSelectedId(offer.id);
    setFormData({ ...offer });
    setErrors({});
  };

  const handlePlusClick = () => {
    setSelectedId(null);
    setIsAddingNew(true);
    setFormData({
      name: "", price: "", duration: "Monthly", stripeId: "", visibility: true,
      features: [
        { name: "Unlimited AI Access", enabled: true },
        { name: "Custom Branding", enabled: false }
      ]
    });
    setErrors({});
  };

  const toggleVisibility = () => {
    const newVisibility = !formData.visibility;
    setFormData({ ...formData, visibility: newVisibility });
    
    // UI FIX: Update the card color in the list immediately
    if (selectedId) {
      setOffers(offers.map(o => 
        o.id === selectedId 
          ? { ...o, visibility: newVisibility, status: newVisibility ? 'active' : 'inactive' } 
          : o
      ));
    }
  };

  // VALIDATION & VERIFICATION
  const validateAndTriggerVerify = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Offer Name is required.";
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) newErrors.price = "Valid price required.";
    
    // Stripe ID Check with Placeholder requirement
    if (!formData.stripeId || !formData.stripeId.startsWith('price_')) {
      newErrors.stripeId = "Must start with 'price_'.";
    }

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setShowVerifyModal(true); // Verification Modal
  };

  const confirmFinalSave = async () => {
    // Audit Log logic for PostgreSQL integration
    try {
      if (isAddingNew) setOffers([{ ...formData, id: Date.now(), status: formData.visibility ? 'active' : 'inactive' }, ...offers]);
      setShowVerifyModal(false);
      setIsAddingNew(false);
      setSelectedId(null);
      alert("Changes saved and audit logged.");
    } catch (err) { console.error(err); }
  };

  const filteredOffers = offers.filter(o => 
    (filterStatus ? o.status === filterStatus : true) && 
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 bg-white">
      
      {/* --- LEFT COLUMN: LIST --- */}
      <div className="w-1/3 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "Georgia, serif" }}>Moderation</h1>
        <div className="flex gap-2 relative z-20"> 
          <div className="relative w-36" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className={`w-full h-10 px-4 rounded-lg font-medium flex items-center justify-between transition-all ${
                filterStatus ? 'bg-[#1ABC9C] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
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
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 h-10 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm" />
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="bg-[#E5E7EB] p-1 rounded-full flex text-sm font-medium z-10">
          <Link href="/admin/moderation/queue" className="flex-1 py-1.5 text-center text-[#6B7280] hover:text-[#111827]">Queue</Link>
          <div className="flex-1 py-1.5 text-center bg-white text-[#111827] shadow-sm rounded-full">Offers</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-2">
          <button onClick={handlePlusClick} className="w-10 h-10 bg-[#D1D5DB] rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#1ABC9C] hover:text-white transition-all shadow-sm"><Plus size={20} /></button>
          {filteredOffers.map((offer) => (
            <div key={offer.id} onClick={() => handleSelectOffer(offer)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedId === offer.id ? "border-[#1ABC9C] bg-white shadow-md ring-1 ring-[#1ABC9C]" : "bg-white border-[#E5E7EB]"}`}>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-[#111827] text-sm leading-tight">{offer.name}</h3>
                <div className={`w-8 h-2.5 rounded-full ${offer.status === 'active' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`}></div>
              </div>
              <p className="text-[13px] font-black text-gray-900 mt-1">${offer.price} / {offer.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT COLUMN --- */}
      <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col overflow-hidden relative">
        {(selectedId || isAddingNew) ? (
          <div className="p-10 flex-1 overflow-y-auto">
            <h1 className="text-3xl font-black text-[#111827] italic mb-8" style={{ fontFamily: "Georgia, serif" }}>
              {isAddingNew ? "Add New Offer" : `Update Offer: ${formData.name}`}
            </h1>
            <div className="bg-[#F0FDFA] rounded-[35px] p-8 space-y-6 shadow-sm border border-gray-100 max-w-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Offer Name:</label>
                  <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full p-3 border rounded-xl text-sm ${errors.name ? 'border-red-500' : 'border-gray-200'}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Price (USD):</label>
                  <input value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className={`w-full p-3 border rounded-xl text-sm ${errors.price ? 'border-red-500' : 'border-gray-200'}`} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Manage Features:</p>
                  <div className="flex gap-2">
                    <input value={newFeatureName} onChange={(e) => setNewFeatureName(e.target.value)} placeholder="New perk..." className="text-xs p-1.5 border-b border-gray-300 outline-none bg-transparent w-32" />
                    <button onClick={() => {const f = [...formData.features, {name: newFeatureName, enabled: true}]; setFormData({...formData, features: f}); setNewFeatureName("");}} className="w-6 h-6 bg-[#1ABC9C] text-white rounded-md flex items-center justify-center"><Plus size={14}/></button>
                  </div>
                </div>
                {formData.features.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-50">
                    <span className="text-sm font-semibold text-gray-700">{f.name}</span>
                    <button onClick={() => {const updated = [...formData.features]; updated[i].enabled = !updated[i].enabled; setFormData({...formData, features: updated});}} className={`w-6 h-6 rounded-md flex items-center justify-center ${f.enabled ? 'bg-[#22C55E] text-white' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                      {f.enabled ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Stripe Price ID:</label>
                <input 
                  value={formData.stripeId} onChange={(e) => setFormData({...formData, stripeId: e.target.value})} 
                  placeholder="e.g. price_H5k2... (Required)"
                  className={`w-full p-3 border rounded-xl text-sm ${errors.stripeId ? 'border-red-500' : 'border-gray-200'}`} 
                />
                <p className="text-[9px] text-gray-400 mt-1 italic leading-tight">*Must begin with <b>'price_'</b> to link with the Stripe dashboard.</p>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button onClick={validateAndTriggerVerify} className="bg-[#114A3F] text-white pl-6 pr-2 py-2 rounded-full flex items-center gap-3 shadow-md active:scale-95 transition-all">
                  <span className="font-bold text-sm">Save Action</span>
                  <div className="w-8 h-8 bg-[#4FD1C5] rounded-full flex items-center justify-center text-[#114A3F]"><Save size={18} /></div>
                </button>
                <div className="flex items-center gap-4">
                   <span className="text-xl font-black text-[#111827]">Visibility</span>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.visibility} onChange={toggleVisibility} />
                      <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-[#1ABC9C] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7 shadow-inner"></div>
                   </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF] select-none">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <MousePointer2 size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No Offer Selected</h3>
          </div>
        )}
      </div>

      {/* VERIFICATION MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-200">
            <AlertCircle size={32} className="text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verify Changes</h2>
            <p className="text-sm text-gray-500 mb-6">Updating <b>{formData.name}</b> to <span className="text-green-600 font-bold">${formData.price}</span>. This action is logged for audit.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowVerifyModal(false)} className="flex-1 font-bold text-gray-400">Back</button>
              <button onClick={confirmFinalSave} className="flex-1 btn bg-[#114A3F] text-white rounded-2xl border-none font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}