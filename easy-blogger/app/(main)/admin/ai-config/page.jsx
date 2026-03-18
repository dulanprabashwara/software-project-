"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, X, Check, Edit2, Loader2 } from "lucide-react";

export default function AdminAIConfig() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [urlStatus, setUrlStatus] = useState("idle"); // idle, validating, valid, invalid
  const [modalData, setModalData] = useState({
    id: null, // null means new, string/number means editing
    name: "",
    url: "",
    category: "Technology",
    frequency: "Standard",
    minWordCount: 300,
    excludedKeywords: [],
    currentKeywordInput: ""
  });

  // --- MOCK API FETCHING ---
  const fetchSources = () => {
    fetch('/api/users?type=scrapingSources')
      .then(res => res.json())
      .then(data => {
        setSources(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSources();
  }, []);

  // --- URL VALIDATION: Real-World Link Check ---
  const handleUrlChange = async (e) => {
    const val = e.target.value;
    setModalData({ ...modalData, url: val });
  
  // Basic format check first to avoid unnecessary API calls
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  if (!urlPattern.test(val)) {
    setUrlStatus("invalid");
    return;
  }
  
  setUrlStatus("validating");

  try {
    // We ask our backend to check if the site actually exists
    const res = await fetch(`/api/users?type=validateUrl&url=${encodeURIComponent(val)}`);
    const data = await res.json();
    
    if (data.valid) {
      setUrlStatus("valid");
    } else {
      setUrlStatus("invalid");
      }
    } catch (err) {
    setUrlStatus("invalid");
    }
  };

  // --- MODAL CONTROLS ---
  const handleOpenNew = () => {
    setModalData({ id: null, name: "", url: "", category: "Technology", frequency: "Standard", minWordCount: 300, excludedKeywords: [], currentKeywordInput: "" });
    setUrlStatus("idle");
    setIsModalOpen(true);
  };

  const handleEdit = (source) => {
    setModalData({ ...source, currentKeywordInput: "" });
    setUrlStatus("valid"); // Assume existing URLs in DB are valid
    setIsModalOpen(true);
  };

  // --- KEYWORD TAGGING LOGIC ---
  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && modalData.currentKeywordInput.trim() !== '') {
      e.preventDefault();
      const newKeyword = modalData.currentKeywordInput.trim();
      if (!modalData.excludedKeywords.includes(newKeyword)) {
        setModalData({
          ...modalData,
          excludedKeywords: [...modalData.excludedKeywords, newKeyword],
          currentKeywordInput: ""
        });
      }
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setModalData({ ...modalData, excludedKeywords: modalData.excludedKeywords.filter(k => k !== keywordToRemove) });
  };

  // --- CRUD OPERATIONS ---
  const handleSaveSource = async () => {
    if (urlStatus === "invalid") {
      alert("Please enter a valid working URL before saving.");
      return;
    }

    const payload = {
      action: modalData.id ? "editSource" : "addSource",
      source: { ...modalData, status: modalData.id ? modalData.status : "active" }
    };

    await fetch('/api/users?action=' + payload.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setIsModalOpen(false);
    fetchSources();
  };

  const handleDelete = async (id) => {
    if(window.confirm("Remove this scraping source? It will stop fetching new topics.")) {
      await fetch('/api/users?action=deleteSource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchSources();
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    // Optimistic UI update
    setSources(sources.map(s => s.id === id ? { ...s, status: newStatus } : s));
    
    await fetch('/api/users?action=toggleSourceStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
  };

  // Helper for UI Subtexts
  const getFrequencySubtext = (freq) => {
    switch(freq) {
      case "Real-time": return "Every Hour";
      case "Standard": return "Every 6 Hours";
      case "Daily": return "Every 24 Hours";
      default: return "Every 7 Days";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "Georgia, serif" }}>AI Configuration</h1>

      {/* TOP SECTION: ADD SOURCE CARD */}
      <div className="bg-white border border-gray-800 rounded-2xl p-8 mb-10 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>AI Content Sources</h2>
          <p className="text-gray-500 text-sm">Manage external websites, scraping schedules, and safety rules.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 bg-[#1ABC9C] hover:bg-[#17a589] text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          <Plus size={18} /> Add New Source
        </button>
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#F8FDFB] w-175 rounded-3xl shadow-2xl p-10 relative">
            <h2 className="text-2xl font-serif text-gray-800 mb-8">
              {modalData.id ? "Edit Scraping Source" : "Configure New Scraping Source"}
            </h2>

            <div className="space-y-6">
              {/* NEW: Website Name Input */}
              <div className="flex items-center">
                <label className="w-1/3 text-gray-600 text-lg">Website Name:</label>
                <input 
                  type="text" placeholder="e.g. TechCrunch" 
                  className="w-2/3 border-b border-gray-300 pb-2 bg-transparent outline-none text-gray-800"
                  value={modalData.name} onChange={e => setModalData({...modalData, name: e.target.value})}
                />
              </div>

              {/* URL Input with Validation Icon */}
              <div className="flex items-center">
                <label className="w-1/3 text-gray-600 text-lg">Website URL:</label>
                <div className="w-2/3 flex items-center gap-4">
                  <input 
                    type="url" placeholder="https://example.com/feed" 
                    className="flex-1 border-b border-gray-300 pb-2 bg-transparent outline-none text-gray-800"
                    value={modalData.url} onChange={handleUrlChange}
                  />
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {urlStatus === "idle" && <div className="w-4 h-4 border-2 border-gray-300 rounded-sm"></div>}
                    {urlStatus === "validating" && <Loader2 size={18} className="animate-spin text-[#1ABC9C]" />}
                    {urlStatus === "valid" && <div className="bg-[#E6F8F3] text-[#1ABC9C] p-1 rounded-md"><Check size={14} strokeWidth={4}/></div>}
                    {urlStatus === "invalid" && <div className="bg-red-100 text-red-500 p-1 rounded-md"><X size={14} strokeWidth={4}/></div>}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-1/3 text-gray-600 text-lg">Content Category:</label>
                <select 
                  className="w-1/3 bg-transparent border-none font-bold text-gray-800 outline-none cursor-pointer"
                  value={modalData.category} onChange={e => setModalData({...modalData, category: e.target.value})}
                >
                  <option value="Technology">Technology</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-2/3 text-gray-600 text-lg">How often should we check for updates?</label>
                <select 
                  className="w-1/3 bg-transparent border-none font-bold text-gray-800 outline-none cursor-pointer text-right"
                  value={modalData.frequency} onChange={e => setModalData({...modalData, frequency: e.target.value})}
                >
                  <option value="Real-time">Real-time</option>
                  <option value="Standard">Standard</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-1/3 text-gray-600 text-lg">Minimum Word Count:</label>
                <input 
                  type="number" placeholder="e.g. 300" 
                  className="w-2/3 border-b border-gray-300 pb-2 bg-transparent outline-none text-gray-800"
                  value={modalData.minWordCount} onChange={e => setModalData({...modalData, minWordCount: e.target.value})}
                />
              </div>

              <div>
                <label className="text-gray-600 text-lg block mb-4">Excluded Keywords:</label>
                <input 
                  type="text" placeholder="Type a word and press Enter..."
                  className="w-2/3 border-b border-gray-300 pb-2 bg-transparent outline-none text-gray-800 mb-4" 
                  value={modalData.currentKeywordInput} onChange={e => setModalData({...modalData, currentKeywordInput: e.target.value})}
                  onKeyDown={handleAddKeyword}
                />
                
                {/* Tag Container */}
                <div className="flex flex-wrap gap-2">
                  {modalData.excludedKeywords.map((keyword, idx) => (
                    <span key={idx} className="flex items-center gap-2 bg-[#2D3748] text-white px-3 py-1 rounded-md text-xs font-medium">
                      {keyword}
                      <button onClick={() => handleRemoveKeyword(keyword)} className="hover:text-red-400"><X size={12} strokeWidth={3}/></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-4 mt-12">
              <button onClick={handleSaveSource} className="flex items-center gap-2 bg-[#1ABC9C] hover:bg-[#17a589] text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all">
                Keep <CheckCircle2 size={18} />
              </button>
              <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all">
                Cancel <XCircle size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: DATA TABLE */}
      <div className="bg-white border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-sm font-serif text-gray-800 bg-gray-50">
              <th className="p-5 font-medium">Source</th>
              <th className="p-5 font-medium text-center">Category</th>
              <th className="p-5 font-medium text-center">Frequency</th>
              <th className="p-5 font-medium text-center">Safety Rules</th>
              <th className="p-5 font-medium text-center">Status</th>
              <th className="p-5 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading sources...</td></tr>
            ) : (
              sources.map((source) => (
                <tr key={source.id} className="hover:bg-gray-50">
                  {/* Name and URL */}
                  <td className="p-5">
                    <p className="font-bold text-gray-900 font-serif text-base">{source.name}</p>
                    <a href={source.url} target="_blank" className="text-xs text-gray-500 underline hover:text-[#1ABC9C]">{source.url}</a>
                  </td>
                  
                  {/* Category Pill */}
                  <td className="p-5 text-center">
                    <span className="inline-block bg-[#E6F8F3] text-[#1ABC9C] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
                      <Check size={12} className="inline mr-1 -mt-0.5" strokeWidth={3}/> 
                      {source.category || 'active'}
                    </span>
                  </td>

                  {/* Frequency */}
                  <td className="p-5 text-center">
                    <p className="font-bold text-gray-900 text-sm">{source.frequency}</p>
                    <p className="text-xs text-gray-500 underline decoration-gray-300 underline-offset-2">{getFrequencySubtext(source.frequency)}</p>
                  </td>

                  {/* Safety Rules */}
                  <td className="p-5 text-center text-xs text-gray-600">
                    <p>Min: {source.minWordCount} words</p>
                    <p>Block: {source.excludedKeywords?.length || 0} keywords</p>
                  </td>

                  {/* Status Toggle */}
                  <td className="p-5 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={source.status === 'active'} 
                        onChange={() => handleToggleStatus(source.id, source.status)} 
                      />
                      <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[#1ABC9C] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:border-white"></div>
                    </label>
                  </td>

                  {/* Actions */}
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => handleEdit(source)} className="text-gray-600 hover:text-gray-900 transition-colors" title="Edit Source">
                        <Edit2 size={16} strokeWidth={2.5}/>
                      </button>
                      <button onClick={() => handleDelete(source.id)} className="text-[#EF4444] hover:text-red-700 transition-colors" title="Delete Source">
                        <Trash2 size={16} strokeWidth={2.5}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}