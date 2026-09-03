import React, { useState } from 'react';
import { 
  Camera, Mic, Sparkles, Check, ArrowRight, Home, 
  Package, PlusCircle, User, Share2, Loader2, IndianRupee, 
  ChevronLeft, SlidersHorizontal, ShieldCheck, CheckCircle2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [screen, setScreen] = useState(1);
  const [loadingText, setLoadingText] = useState(null);
  const [capturedImage, setCapturedImage] = useState("https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop");
  
  const [listing, setListing] = useState({
    name: "Handcrafted Terracotta Earthen Vase",
    category: "Clay & Ceramic Crafts",
    material: "Traditional River Clay (Terracotta)",
    colour: "Natural Ochre & Terracotta",
    description_hi: "हाथ से चाक पर तैयार की गई शुद्ध मिट्टी की सुराही। प्राकृतिक रूप से पकाई गई और पर्यावरण के अनुकूल।",
    description_en: "Handmade wheel-thrown terracotta vase crafted from local riverbed clay. Eco-friendly with natural earthen finish.",
    price_min: 750,
    price_max: 1100,
    final_price: 890,
    reasoning: "Material Cost (₹220) + 5 hrs hand-turning + category benchmark markup."
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCapturedImage(URL.createObjectURL(file));
      setScreen(4);
      setLoadingText("AI Image Studio: Isolating craft & enhancing studio lighting...");
      setTimeout(() => setLoadingText(null), 1200);
    }
  };

  const handleVoiceProcess = () => {
    setLoadingText("BHASHINI: Transcribing spoken Hindi & generating bilingual attributes...");
    setTimeout(() => {
      setLoadingText(null);
      setScreen(6);
    }, 1400);
  };

  return (
    <div className="flex justify-center min-h-screen bg-stone-900/10 font-sans antialiased selection:bg-amber-100">
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md bg-[#FFF9F0] text-[#292524] min-h-screen flex flex-col justify-between shadow-2xl relative pb-20 border-x border-stone-200">
        
        {/* Top App Header */}
        <header className="px-5 py-3.5 flex items-center justify-between border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            {screen > 2 && (
              <button onClick={() => setScreen(screen - 1)} className="p-1 -ml-1 text-stone-600 hover:text-black">
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-[#A44932] flex items-center justify-center text-white font-black text-sm shadow-sm">
              श
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-[#292524] text-base block leading-none">ShilpSaathi</span>
              <span className="text-[10px] text-stone-500 font-medium tracking-tight">शिल्पसाथी • Virtual Studio</span>
            </div>
          </div>
          <span className="text-[10px] font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase">
            Ministry MVP
          </span>
        </header>

        {/* AI Transparent State Overlay */}
        {loadingText && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs border border-stone-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#A44932] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#A44932]" />
              </div>
              <p className="text-xs font-semibold text-stone-800 leading-relaxed">{loadingText}</p>
            </div>
          </div>
        )}

        {/* Dynamic Screen Viewport */}
        <main className="p-5 flex-1 flex flex-col justify-center">

          {/* SCREEN 1: Welcome / Onboarding */}
          {screen === 1 && (
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="w-24 h-24 bg-[#A44932] text-[#FFF9F0] rounded-3xl mx-auto flex items-center justify-center font-black text-5xl shadow-xl border-4 border-amber-100/50">
                  श
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#D4A72C] p-2 rounded-xl text-white shadow">
                  <Sparkles size={16} />
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-[#292524]">ShilpSaathi</h1>
                <p className="text-xs font-semibold text-[#A44932] uppercase tracking-widest">Your Craft • Your Story • Your Market</p>
                <p className="text-xs text-stone-600 pt-2 max-w-xs mx-auto">
                  AI-Powered Virtual Business Manager for India's Artisans. Create professional digital listings without typing or photo editing.
                </p>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl border border-stone-200 text-left shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <ShieldCheck size={16} className="text-[#3F7D58]" /> 100% Voice & Visual Driven
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  <ShieldCheck size={16} className="text-[#3F7D58]" /> Multilingual BHASHINI AI Support
                </div>
              </div>

              <button 
                onClick={() => setScreen(2)} 
                className="w-full py-4 bg-[#A44932] text-white rounded-2xl font-bold shadow-lg shadow-[#A44932]/25 hover:bg-[#8e3e29] transition active:scale-[0.99]"
              >
                शुरू करें / Launch Studio
              </button>
            </div>
          )}

          {/* SCREEN 2: Home Dashboard */}
          {screen === 2 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs uppercase font-bold text-[#A44932] tracking-wider">कलाकार डैशबोर्ड</span>
                <h2 className="text-2xl font-black text-[#292524]">Artisan Studio</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[11px] font-bold text-stone-400 uppercase">Live Listings</span>
                  <p className="text-2xl font-black text-[#292524] mt-0.5">3 Items</p>
                  <span className="text-[10px] text-[#3F7D58] font-bold">Active in Catalog</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <span className="text-[11px] font-bold text-stone-400 uppercase">Avg. Benchmark</span>
                  <p className="text-2xl font-black text-[#292524] mt-0.5">₹920</p>
                  <span className="text-[10px] text-amber-700 font-bold">Fair Market Rate</span>
                </div>
              </div>

              <div className="bg-amber-100/60 border border-amber-300/80 p-4 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                  <Sparkles size={14} className="text-[#D4A72C]" /> Smart Assistant Ready
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Have a new craft item ready? Take one clear photo, speak its story in Hindi, and we will prepare a shareable market card.
                </p>
              </div>

              <button 
                onClick={() => setScreen(3)}
                className="w-full py-4 bg-[#A44932] text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#A44932]/20 hover:bg-[#8e3e29] transition active:scale-[0.99]"
              >
                <PlusCircle size={20} /> Add New Craft Item
              </button>
            </div>
          )}

          {/* SCREEN 3: Capture Product */}
          {screen === 3 && (
            <div className="text-center space-y-5">
              <div>
                <h2 className="text-2xl font-black text-[#292524]">Photograph Craft</h2>
                <p className="text-xs text-stone-600 mt-1">Our AI cleans cluttered backgrounds and fixes lighting</p>
              </div>
              
              <div className="border-2 border-dashed border-[#A44932]/40 rounded-3xl p-8 bg-white/70 flex flex-col items-center shadow-inner">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-[#A44932] mb-3 shadow-sm">
                  <Camera size={32} />
                </div>
                <p className="text-xs font-semibold text-stone-700 mb-4">Click photo or select from phone gallery</p>
                <label className="cursor-pointer bg-[#A44932] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#8e3e29] transition active:scale-95">
                  Capture Craft
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <p className="text-[11px] text-stone-400">Supported: Clay, Textiles, Woodwork, Metal & Handmade Crafts</p>
            </div>
          )}

          {/* SCREEN 4: AI Image Studio */}
          {screen === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-1.5">
                    <Sparkles className="text-[#D4A72C]" size={18} /> AI Image Studio
                  </h2>
                  <p className="text-[11px] text-stone-500">Auto background removal + shadow correction</p>
                </div>
                <span className="text-[10px] bg-[#3F7D58]/10 text-[#3F7D58] border border-[#3F7D58]/30 font-bold px-2 py-0.5 rounded-full">
                  Enhanced ✓
                </span>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-white">
                <img src={capturedImage} alt="Enhanced Craft" className="w-full h-64 object-cover" />
                <div className="absolute top-3 left-3 bg-[#3F7D58] text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow">
                  Studio Cleaned
                </div>
              </div>

              <div className="bg-stone-100 p-3 rounded-xl text-center">
                <p className="text-xs text-stone-600 font-medium">✨ Background normalized for e-commerce readiness</p>
              </div>

              <button 
                onClick={() => setScreen(5)} 
                className="w-full py-4 bg-[#A44932] text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-[#8e3e29]"
              >
                Proceed to Voice Cataloging <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* SCREEN 5: Voice Cataloging */}
          {screen === 5 && (
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#292524]">Speak Your Craft's Story</h2>
                <p className="text-xs text-stone-600 mt-1">Speak freely in Hindi. BHASHINI converts voice to catalog data.</p>
              </div>
              
              <div className="my-6">
                <button 
                  onClick={handleVoiceProcess}
                  className="w-32 h-32 rounded-full border-4 border-[#A44932] bg-[#A44932]/10 text-[#A44932] mx-auto flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl"
                >
                  <Mic size={44} />
                  <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">Tap to Speak</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1 text-stone-600 shadow-sm">
                <span className="font-bold text-stone-800 block">Example to speak out loud:</span>
                <p className="italic">"यह एक हस्तनिर्मित मिट्टी का फूलदान है, जिसे पारंपरिक चाक पर बनाया गया है..."</p>
              </div>
            </div>
          )}

          {/* SCREEN 6: AI Generated Catalog */}
          {screen === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black">AI Auto-Catalog</h2>
                <p className="text-xs text-stone-500">Extracted from speech via BHASHINI (Editable)</p>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 text-xs shadow-sm">
                <div>
                  <label className="text-stone-400 font-bold block mb-0.5">Product Title</label>
                  <input 
                    className="w-full font-bold text-stone-800 border-b pb-1 outline-none text-sm focus:border-[#A44932]" 
                    value={listing.name} 
                    onChange={e => setListing({...listing, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-bold block mb-0.5">Material & Craft Technique</label>
                  <input 
                    className="w-full font-medium border-b pb-1 outline-none text-stone-700 focus:border-[#A44932]" 
                    value={listing.material} 
                    onChange={e => setListing({...listing, material: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-bold block mb-0.5">Hindi Description</label>
                  <textarea 
                    className="w-full border rounded-lg p-2 outline-none leading-relaxed text-xs focus:border-[#A44932]" 
                    rows="2" 
                    value={listing.description_hi} 
                    onChange={e => setListing({...listing, description_hi: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-bold block mb-0.5">English Catalog Translation</label>
                  <textarea 
                    className="w-full border rounded-lg p-2 outline-none text-stone-700 leading-relaxed text-xs focus:border-[#A44932]" 
                    rows="2" 
                    value={listing.description_en} 
                    onChange={e => setListing({...listing, description_en: e.target.value})} 
                  />
                </div>
              </div>

              <button 
                onClick={() => setScreen(7)} 
                className="w-full py-4 bg-[#A44932] text-white rounded-2xl font-bold shadow-md hover:bg-[#8e3e29]"
              >
                Calculate Fair Price
              </button>
            </div>
          )}

          {/* SCREEN 7: Pricing Assistant */}
          {screen === 7 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black">AI Pricing Assistant</h2>
                <p className="text-xs text-stone-500">Heuristic price calculation based on artisanal cost standards</p>
              </div>

              <div className="bg-amber-100/70 border border-[#D4A72C]/60 p-5 rounded-3xl text-center space-y-1 shadow-sm">
                <span className="text-[11px] text-amber-900 font-bold uppercase tracking-wider">Suggested Market Range</span>
                <h3 className="text-3xl font-black text-[#292524]">₹{listing.price_min} – ₹{listing.price_max}</h3>
                <p className="text-[11px] text-stone-600 pt-1">{listing.reasoning}</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                <label className="text-xs font-bold text-stone-400 block mb-1">Set Your Final Selling Price (₹)</label>
                <div className="flex items-center gap-1 border-b border-stone-300 pb-1">
                  <span className="text-2xl font-bold text-stone-400">₹</span>
                  <input 
                    type="number" 
                    value={listing.final_price} 
                    onChange={e => setListing({...listing, final_price: e.target.value})}
                    className="w-full text-2xl font-black outline-none text-[#A44932]"
                  />
                </div>
              </div>

              <button 
                onClick={() => setScreen(8)} 
                className="w-full py-4 bg-[#A44932] text-white rounded-2xl font-bold shadow-md hover:bg-[#8e3e29]"
              >
                Review Listing
              </button>
            </div>
          )}

          {/* SCREEN 8: Review Listing */}
          {screen === 8 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-black">Verify Your Listing</h2>
                <p className="text-xs text-stone-500">Full control: verify before sharing</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 text-xs shadow-sm">
                <img src={capturedImage} alt="Review" className="w-full h-36 object-cover rounded-xl" />
                <div>
                  <span className="text-[10px] font-bold text-[#D4A72C] uppercase">{listing.category}</span>
                  <h3 className="font-bold text-sm text-[#292524]">{listing.name}</h3>
                </div>
                <p className="text-stone-600">{listing.description_en}</p>
                <div className="flex justify-between items-center pt-2 border-t text-xs">
                  <span className="text-stone-500 font-bold">Publish Price:</span>
                  <span className="text-xl font-black text-[#A44932]">₹{listing.final_price}</span>
                </div>
              </div>

              <button 
                onClick={() => setScreen(9)} 
                className="w-full py-4 bg-[#3F7D58] text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-[#3F7D58]/25 hover:bg-[#326647]"
              >
                <CheckCircle2 size={20} /> Publish Digital Listing
              </button>
            </div>
          )}

          {/* SCREEN 9: Final Product Listing Card */}
          {screen === 9 && (
            <div className="space-y-4 text-center">
              <div className="inline-flex p-3 bg-green-100 rounded-full text-[#3F7D58]">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black">Listing Published!</h2>
                <p className="text-xs text-stone-500">Your craft is now digital and ready to share</p>
              </div>
              
              <div className="bg-white p-4 rounded-3xl border border-stone-200 text-left shadow-lg space-y-2">
                <img src={capturedImage} alt="Final" className="w-full h-48 object-cover rounded-2xl" />
                <span className="text-[10px] font-bold text-[#D4A72C] uppercase tracking-wide block">{listing.category}</span>
                <h3 className="font-bold text-base leading-snug">{listing.name}</h3>
                <p className="text-xs text-stone-500 line-clamp-2">{listing.description_hi}</p>
                <div className="flex items-baseline justify-between pt-1">
                  <p className="text-2xl font-black text-[#A44932]">₹{listing.final_price}</p>
                  <span className="text-[10px] text-[#3F7D58] font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-200">Ready to Order</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => alert("WhatsApp catalogue link copied to clipboard!")}
                  className="flex-1 py-4 bg-[#A44932] text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-xs shadow-md hover:bg-[#8e3e29]"
                >
                  <Share2 size={16} /> Share on WhatsApp
                </button>
                <button 
                  onClick={() => setScreen(2)} 
                  className="px-5 py-4 bg-stone-200 hover:bg-stone-300 rounded-2xl font-bold text-xs"
                >
                  Home
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Global Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-stone-200 flex items-center justify-around text-stone-400 z-10">
          <button onClick={() => setScreen(2)} className={`flex flex-col items-center ${screen === 2 ? 'text-[#A44932] font-bold' : ''}`}>
            <Home size={20} /><span className="text-[10px] mt-0.5">Studio</span>
          </button>
          <button onClick={() => setScreen(8)} className="flex flex-col items-center">
            <Package size={20} /><span className="text-[10px] mt-0.5">Catalog</span>
          </button>
          <button onClick={() => setScreen(3)} className={`flex flex-col items-center ${screen === 3 ? 'text-[#A44932] font-bold' : ''}`}>
            <PlusCircle size={20} /><span className="text-[10px] mt-0.5">Add</span>
          </button>
          <button onClick={() => setScreen(1)} className="flex flex-col items-center">
            <User size={20} /><span className="text-[10px] mt-0.5">Profile</span>
          </button>
        </nav>

      </div>
    </div>
  );
}