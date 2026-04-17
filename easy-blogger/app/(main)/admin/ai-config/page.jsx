"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, X, Check, Edit2, Loader2 } from "lucide-react";

import { auth } from "../../../../lib/firebase"; 
import { api } from "../../../../lib/api";

export default function AdminAIConfig() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultKeywordsMap, setDefaultKeywordsMap] = useState({});
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [urlStatus, setUrlStatus] = useState("idle"); // idle, validating, valid, invalid
  const [modalData, setModalData] = useState({
    id: null, // null means new, string/number means editing
    name: "",
    url: "",
    category: "Technology & Digital Life",
    scrapeWindow: "Last 7 Days",
    minWordCount: 300,
    excludedKeywords: [],
    currentKeywordInput: ""
  });

  const fetchRealSources = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      // Fetch BOTH sources and keywords at the same time
      const [sourcesRes, keywordsRes] = await Promise.all([
        api.getScrapingSources(token),
        api.getDefaultKeywords(token).catch(() => ({ data: { data: {} } })) // Fallback if backend route fails
      ]);

      const sourcesData = Array.isArray(sourcesRes.data) ? sourcesRes.data : (sourcesRes.data?.data || []);
      setSources(sourcesData);
      
      // Store the dictionary (handling Axios/Express nested data objects)
      setDefaultKeywordsMap(keywordsRes.data?.data || keywordsRes.data || {});
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRealSources();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

 // --- REAL URL VALIDATION ---
  const handleUrlChange = async (e) => {
    const val = e.target.value;
    setModalData({ ...modalData, url: val });
  
    //If empty, reset the icon
    if (!val) {
      setUrlStatus("idle");
      return;
    }
  
    // Basic format check (Fail Fast to save backend calls)
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(val)) {
      setUrlStatus("invalid");
      return;
    }
  
    //Show the spinner and ask the backend to ping it
    setUrlStatus("validating"); 
  
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      
      // Call new backend route
      const response = await api.validateUrl({ url: val }, token);
      
      // If the backend successfully reached the website
      if (response.data?.valid) {
        setUrlStatus("valid");
      } else {
        setUrlStatus("invalid");
      }
    } catch (err) {
      console.error("Validation error:", err);
      setUrlStatus("invalid");
    }
  };

  const handleOpenNew = () => {
    const defaultCat = "Technology & Digital Life";
    
    // Combine Global blocks with the specific category blocks
    const globalWords = defaultKeywordsMap["Global"] || [];
    const catWords = defaultKeywordsMap[defaultCat] || [];
    const startingKeywords = [...new Set([...globalWords, ...catWords])];

    setModalData({ id: null, name: "", url: "", category: defaultCat, scrapeWindow: "Last 7 Days", minWordCount: 300, excludedKeywords: startingKeywords, currentKeywordInput: "" });
    setUrlStatus("idle");
    setIsModalOpen(true);
  };

  const handleEdit = (source) => {
    setModalData({ ...source, currentKeywordInput: "" });
    setUrlStatus("valid"); 
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

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const payload = {
        name: modalData.name,
        url: modalData.url,
        category: modalData.category,
        scrapeWindow: modalData.scrapeWindow,
        minWordCount: parseInt(modalData.minWordCount),
        excludedKeywords: modalData.excludedKeywords,
        status: modalData.id ? modalData.status : "active"
      };

      if (modalData.id) {
        // UPDATE EXISTING
        await api.updateScrapingSource(modalData.id, payload, token);
      } else {
        // CREATE NEW
        await api.createScrapingSource(payload, token);
      }

      setIsModalOpen(false);
      await fetchRealSources(); // Refresh the table

    } catch (error) {
      console.error("Failed to save source:", error);
      alert("Failed to save. Check the console.");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Remove this scraping source? It will stop fetching new topics.")) {
      try {
        const user = auth.currentUser;
        const token = await user.getIdToken();
        
        await api.deleteScrapingSource(id, token);
        await fetchRealSources(); // Refresh the table
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    // Optimistic UI update so it feels instant
    setSources(sources.map(s => s.id === id ? { ...s, status: newStatus } : s));
    
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      
      await api.updateScrapingSource(id, { status: newStatus }, token);
    } catch (error) {
      console.error("Failed to toggle status", error);
      // Revert if it fails
      setSources(sources.map(s => s.id === id ? { ...s, status: currentStatus } : s));
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
                  value={modalData.category} 
                  onChange={(e) => {
                    const newCat = e.target.value;
      
                    // If creating a NEW source, auto-swap the keywords
                    if (!modalData.id) {
                      const globalWords = defaultKeywordsMap["Global"] || [];
                      const catWords = defaultKeywordsMap[newCat] || [];
                      setModalData({
                        ...modalData, 
                        category: newCat,
                        excludedKeywords: [...new Set([...globalWords, ...catWords])]
                      });
                    } else {
                      // If editing an existing source, just change category, don't overwrite their saved keywords
                      setModalData({...modalData, category: newCat});
                    }
                  }}
                >
                  <option value="Technology & Digital Life">Technology & Digital Life</option>
                  <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                  <option value="Finance & Money">Finance & Money</option>
                  <option value="Health & Medicine">Health & Medicine</option>
                  <option value="Wellness & Personal Growth">Wellness & Personal Growth</option>
                  <option value="Relationships & Family">Relationships & Family</option>
                  <option value="Education & Learning">Education & Learning</option>
                  <option value="Environment & Nature">Environment & Nature</option>
                  <option value="Food & Cooking">Food & Cooking</option>
                  <option value="Travel & Places">Travel & Places</option>
                  <option value="Lifestyle & Home">Lifestyle & Home</option>
                  <option value="Hobbies & Interests">Hobbies & Interests</option>
                  <option value="Sports & Athletics">Sports & Athletics</option>
                  <option value="Arts, Culture & Entertainment">Arts, Culture & Entertainment</option>
                  <option value="Literature & Writing">Literature & Writing</option>
                  <option value="History">History</option>
                  <option value="Politics & Society">Politics & Society</option>
                  <option value="Religion, Philosophy & Beliefs">Religion, Philosophy & Beliefs</option>
                  <option value="Science & Discovery">Science & Discovery</option>
                  <option value="Career & Professional Life">Career & Professional Life</option>
                  <option value="Agriculture & Rural Life">Agriculture & Rural Life</option>
                  <option value="Industries & Services">Industries & Services</option>
                  <option value="Community & Social Issues">Community & Social Issues</option>
                </select>
              </div>

              {/* Scrape Window replaces Frequency */}
              <div className="flex items-center">
                <label className="w-2/3 text-gray-600 text-lg">Article Age Limit (Only scrape articles published within):</label>
                <select 
                  className="w-1/3 bg-transparent border-none font-bold text-gray-800 outline-none cursor-pointer text-right"
                  value={modalData.scrapeWindow} onChange={e => setModalData({...modalData, scrapeWindow: e.target.value})}
                >
                  <option value="Last 24 Hours">Last 24 Hours</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
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
              <th className="p-5 font-medium text-center">Article Age Limit</th>
              <th className="p-5 font-medium text-center">Safety Rules</th>
              <th className="p-5 font-medium text-center">Status</th>
              <th className="p-5 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading sources...</td></tr>
            ) : sources.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-bold">No sources added yet.</td></tr>
            ): (
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
                      {source.category}
                    </span>
                  </td>

                  {/* Article age limit */}
                  <td className="p-5 text-center">
                    <span className="font-bold text-gray-900 text-sm bg-gray-100 px-3 py-1 rounded-lg">
                      {source.scrapeWindow}
                    </span>
                  </td>

                  {/* Safety Rules */}
                  <td className="p-5 text-center text-xs text-gray-600">
                    <p className="font-semibold text-gray-800">Min: <span className="text-[#1ABC9C]">{source.minWordCount}</span> words</p>
                    <p className="font-semibold text-gray-800 mt-1">Block: <span className="text-red-500">{source.excludedKeywords?.length || 0}</span> keywords</p>
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