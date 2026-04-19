import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Shield, Droplets, Leaf, 
  Home, CloudRain, PenTool, BarChart2,
  CheckCircle, AlertTriangle, MessageCircle, Map, PieChart, ArrowLeft,
  Info, Share2, Send, X, Zap, TreePine
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Legend, Tooltip as RechartsTooltip 
} from 'recharts';
import initSqlJs from 'sql.js';

// Utility functions
function uint8ToBase64(uint8Array) {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}


// --- Simulated Headless CMS Content ---
const CMS_CONTENT = {
  hero: {
    badge: "National Infrastructure Project",
    title1: "Safeguarding",
    title2: "Singapore's Future",
    subtitle: "A transformative coastal protection and water resilience initiative designed to defend against rising sea levels while creating new opportunities for generations to come."
  },
  challenge: {
    title: "The Challenge We Face",
    description: "By 2100, sea levels are projected to rise significantly. Long Island is Singapore's comprehensive solution to protect our coastline, secure our water supply, and build a sustainable future.",
    stats:[
      { value: "800 ha", desc: "Of reclaimed land across 3 tracts, acting as a massive coastal barrier against extreme weather.", color: "text-blue-700" },
      { value: "18th", desc: "New freshwater reservoir enclosed by the island, drastically improving national water resilience.", color: "text-cyan-600" },
      { value: "20 km", desc: "Of new waterfront parks, beaches, and recreational destinations for the community.", color: "text-emerald-600" }
    ]
  }
};

// --- Animation Utility Component ---
const FadeIn = ({ children, delay = 0, direction = 'up', className = "" }) => {
  const[isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' }); 

    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  },[]);

  const baseClass = "transition-all duration-1000 ease-out";
  const visibleClass = isVisible ? "opacity-100 translate-y-0 translate-x-0" : "opacity-0";
  
  let dirClass = "";
  if (!isVisible) {
    if (direction === 'up') dirClass = "translate-y-12";
    if (direction === 'down') dirClass = "-translate-y-12";
    if (direction === 'left') dirClass = "-translate-x-12";
    if (direction === 'right') dirClass = "translate-x-12";
  }

  return (
    <div 
      ref={domRef} 
      className={`${baseClass} ${visibleClass} ${dirClass} ${className}`} 
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const InfoTooltip = ({ text }) => (
  <div className="group relative inline-flex items-center justify-center ml-2 cursor-help" tabIndex="0" aria-label="More information">
    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-[10px] font-bold flex items-center justify-center border border-blue-200">
      ?
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-50 font-medium leading-relaxed">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

// --- Reusable Components ---

const Navbar = ({ currentView, setCurrentView }) => (
  <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 border-t-4 border-t-red-600 px-6 py-4 flex items-center justify-between transition-all duration-300" role="navigation">
    <button 
      className="flex items-center gap-3 cursor-pointer group text-left"
      onClick={() => setCurrentView('landing')}
      aria-label="Go to homepage"
    >
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white font-bold w-10 h-10 flex items-center justify-center rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
        LI
      </div>
      <div>
        <h1 className="font-bold text-gray-900 leading-tight tracking-tight">Long Island Singapore</h1>
        <p className="text-xs text-gray-600 font-semibold">Coastal Protection & Water Resilience</p>
      </div>
    </button>
    <div className="hidden md:flex items-center gap-2 text-sm text-gray-700 font-semibold">
      <button 
        onClick={() => setCurrentView('landing')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${currentView === 'landing' ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-100 hover:text-gray-900'}`}
        aria-current={currentView === 'landing' ? 'page' : undefined}
      >
        <Home size={16} aria-hidden="true" /> Home
      </button>
      <button 
        onClick={() => setCurrentView('challenge')}
        className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 ${currentView === 'challenge' ? 'bg-blue-700 text-white shadow-md' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md'}`}
        aria-current={currentView === 'challenge' ? 'page' : undefined}
      >
        <PenTool size={16} aria-hidden="true" /> Design Challenge
      </button>
    </div>
  </nav>
);

const FloatingChat = () => {
  const[isOpen, setIsOpen] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const[inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am the Long Island AI Assistant. How can I help you today?' }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() && chatStep > 1) return;
    
    let userText = inputValue;
    let aiResponse = "";

    if (inputValue.trim().toLowerCase() === 'adminsqlview') {
      userText = inputValue;
      const savedDb = localStorage.getItem('ura_submissions_db');
      if (savedDb) {
        try {
          const uInt8Array = base64ToUint8(savedDb);
        const blob = new Blob([uInt8Array], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'database.sqlite';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        aiResponse = "Downloading database.sqlite to your downloads folder...";
        } catch (err) {
          aiResponse = "Error generating database file.";
        }
      } else {
        aiResponse = "No database found in local storage.";
      }
    } else if (chatStep === 0) {
      userText = "What is the long island project?";
      aiResponse = "The Long Island project is a comprehensive coastal protection and water resilience initiative in Singapore. It involves reclaiming around 800 hectares of land across three tracts to defend against rising sea levels, while also creating Singapore's 18th freshwater reservoir and adding 20km of new waterfront parks.";
      setChatStep(1);
    } else if (chatStep === 1) {
      userText = "Why can't we add even more green spaces?";
      aiResponse = "While green spaces are crucial for biodiversity and recreation, land allocation requires balancing multiple national priorities. We must also ensure sufficient space for water resilience (reservoirs), clean energy (floating solar), and urban development (housing and commercial needs) within a strict national budget.";
      setChatStep(2);
    } else {
      userText = inputValue || "Tell me more!";
      aiResponse = "I'm a hardcoded demo AI, but I hope this interactive platform helps you understand the trade-offs in urban planning!";
    }

    setMessages(prev =>[...prev, { role: 'user', text: userText }]);
    setInputValue('');
    
    setTimeout(() => {
      setMessages(prev =>[...prev, { role: 'ai', text: aiResponse }]);
    }, 600);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span className="font-bold">Long Island AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'ai' ? 'bg-white border border-gray-200 text-gray-800 self-start rounded-tl-sm' : 'bg-blue-600 text-white self-end rounded-tr-sm'}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2 text-sm transition-all"
            />
            <button type="submit" className="bg-blue-700 text-white p-2 rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center w-10 h-10">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-blue-800 transition-all duration-300 hover:-translate-y-1 z-50 focus:ring-4 focus:ring-blue-300"
        aria-label="Open Long Island AI Assistant"
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
      </button>
    </>
  );
};

// --- Landing Page Components ---

const Hero = ({ setCurrentView }) => (
  <div className="relative bg-[#0a1128] text-white overflow-hidden min-h-[90vh] flex items-center">
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <img 
        src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2070&auto=format&fit=crop" 
        alt="Singapore Marina Bay and Coastal Area" 
        className="w-full h-full object-cover opacity-60 mix-blend-overlay scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
        style={{ animation: 'zoomInOut 30s ease-in-out infinite alternate' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1128]/70 via-[#0a1128]/40 to-[#0a1128]"></div>
      <style>{`
        @keyframes zoomInOut {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
      <FadeIn delay={100}>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true"></span>
          {CMS_CONTENT.hero.badge}
        </span>
      </FadeIn>
      
      <FadeIn delay={300}>
        <h1 className="text-5xl md:text-8xl font-extrabold mb-6 tracking-tighter leading-[1.1] text-white drop-shadow-lg">
          {CMS_CONTENT.hero.title1} <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200 drop-shadow-none">
            {CMS_CONTENT.hero.title2}
          </span>
        </h1>
      </FadeIn>

      <FadeIn delay={500}>
        <p className="text-lg md:text-2xl text-blue-50 max-w-2xl mb-12 leading-relaxed font-medium drop-shadow-md">
          {CMS_CONTENT.hero.subtitle}
        </p>
      </FadeIn>

      <FadeIn delay={700}>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setCurrentView('challenge')}
            className="group bg-white text-gray-900 font-bold px-8 py-4 rounded-full flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1 focus:ring-4 focus:ring-blue-300"
          >
            Start Design Challenge 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
        </div>
      </FadeIn>
    </div>
  </div>
);

const Challenge = () => (
  <section className="py-32 bg-cyan-50 text-center px-6 relative overflow-hidden border-b border-cyan-100" aria-labelledby="challenge-heading">
    <div className="max-w-5xl mx-auto relative z-10">
      <FadeIn>
        <h2 id="challenge-heading" className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">{CMS_CONTENT.challenge.title}</h2>
        <p className="text-gray-700 text-xl mb-16 max-w-3xl mx-auto leading-relaxed">
          {CMS_CONTENT.challenge.description}
        </p>
      </FadeIn>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {CMS_CONTENT.challenge.stats.map((stat, idx) => (
          <FadeIn key={idx} delay={100 + (idx * 200)} direction="up" className="h-full">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-cyan-100 text-left hover:-translate-y-2 transition-all duration-500 hover:shadow-xl group h-full flex flex-col">
              <h3 className={`text-5xl font-extrabold ${stat.color} mb-4 group-hover:scale-105 transition-transform origin-left`}>{stat.value}</h3>
              <p className="text-gray-800 text-base leading-relaxed font-medium flex-1">{stat.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

const MasterPlan = () => (
  <section className="py-32 bg-white px-6">
    <div className="max-w-7xl mx-auto">
      <FadeIn>
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-20 tracking-tight">Long Island Master Plan</h2>
      </FadeIn>
      
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="w-full lg:w-1/2">
          <FadeIn direction="left">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-50">
              <img 
                src="\longislandmap.jpeg" 
                alt="Map of Long Island Singapore" 
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </FadeIn>
        </div>
        <div className="w-full lg:w-1/2">
          <FadeIn direction="right" delay={200}>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Engineering Excellence</h3>
            
            <div className="bg-slate-50 border-l-4 border-blue-600 p-6 rounded-r-2xl mb-10 shadow-sm">
              <p className="text-gray-800 text-lg leading-relaxed font-medium">
                Long Island represents a breakthrough in coastal engineering, combining multiple infrastructure systems into a single integrated solution. Built across three tracts of reclaimed land, it will enclose Singapore's 18th reservoir.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-6 group">
                <div className="bg-blue-50 p-4 rounded-2xl h-fit text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-300 border border-blue-100">
                  <Shield size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Elevated Coastal Barrier</h4>
                  <p className="text-gray-700 leading-relaxed">Reclaimed land built at a higher elevation to defend against long-term sea level rise and extreme storm surges.</p>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="bg-cyan-50 p-4 rounded-2xl h-fit text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300 border border-cyan-100">
                  <Droplets size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Advanced Flood Management</h4>
                  <p className="text-gray-700 leading-relaxed">Equipped with state-of-the-art tidal gates and pumping stations for superior inland flood control.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  </section>
);

const Objectives = () => {
  const cards =[
    { icon: <Shield size={24} className="text-blue-700"/>, title: "Coastal Protection", desc: "Reclamation at a higher level so new land can provide protection against sea level rise." },
    { icon: <Droplets size={24} className="text-cyan-600"/>, title: "Flood Resilience", desc: "Two tidal gates and pumping stations for flood management." },
    { icon: <CloudRain size={24} className="text-blue-500"/>, title: "Water Resilience", desc: "New freshwater reservoir to enhance our water supply." },
    { icon: <Home size={24} className="text-orange-500"/>, title: "More Land", desc: "For future land use needs such as waterfront living and supporting amenities." },
    { icon: <Leaf size={24} className="text-green-600"/>, title: "New Opportunities", desc: "Around 20 km of new waterfront parks and new recreational destinations." },
  ];

  return (
    <section className="py-32 bg-gray-100 px-6 border-y border-gray-200">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-6 tracking-tight">Five National Objectives</h2>
          <p className="text-center text-gray-700 text-xl mb-20 max-w-3xl mx-auto">
            Designed to simultaneously address Singapore's most critical infrastructure challenges through a unified approach.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {cards.map((card, idx) => (
            <FadeIn key={idx} delay={idx * 100} className="h-full">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 hover:-translate-y-2 hover:bg-blue-50 hover:border-blue-300 hover:shadow-xl transition-all duration-500 h-full flex flex-col group">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-700 leading-relaxed flex-1">{card.desc}</p>
              </div>
            </FadeIn>
          ))}
          
          <FadeIn delay={500} className="h-full">
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center h-full hover:-translate-y-2 transition-all duration-500">
              <h3 className="text-2xl font-bold mb-4">Integrated Approach</h3>
              <p className="text-blue-50 leading-relaxed font-medium">
                All five objectives work together in a single comprehensive infrastructure solution, maximizing efficiency and value for Singapore.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

const Infrastructure = () => {
  const[selectedItem, setSelectedItem] = useState(null);

  const items =[
    { 
      title: "Waterfront Living", 
      sub: "20km of new recreational spaces", 
      img: "./Longislandimpression.png",
      desc: "The Long Island project will create approximately 20km of new coastal and reservoir parks. This expansive waterfront will offer Singaporeans unprecedented access to water-based activities, scenic promenades, and integrated lifestyle hubs, transforming the East Coast into a premier recreational destination.",
      imgClass: "object-[75%_center]" // Shifts image right
    },
    { 
      title: "18th Reservoir", 
      sub: "New freshwater enclosure", 
      img: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=1928&auto=format&fit=crop",
      desc: "By enclosing the sea space, Long Island will create Singapore's 18th freshwater reservoir. This critical infrastructure will significantly boost the nation's water resilience, providing a massive new catchment area to harvest rainwater and reduce reliance on imported water sources.",
      imgClass: "object-center"
    },
    { 
      title: "Coastal Barrier", 
      sub: "3 tracts of elevated land", 
      img: "/barrier.png",
      desc: "Designed as the ultimate defense against projected sea-level rises, the three tracts of reclaimed land will be built at a significantly higher elevation. This continuous coastal barrier will protect vulnerable low-lying areas in the East Coast from extreme storm surges and long-term climate impacts.",
      imgClass: "object-[75%_center]" // Shifts image right
    },
  ];

  return (
    <section className="py-32 bg-[#121c3a] px-6 relative border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-white mb-20 tracking-tight">Infrastructure Components</h2>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <FadeIn key={idx} delay={idx * 200}>
              <div 
                className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer shadow-lg border border-gray-800 hover:border-blue-500/50 transition-colors duration-500"
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.img} alt={item.title} className={`w-full h-full object-cover transition duration-700 group-hover:scale-110 ${item.imgClass}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121c3a] via-[#121c3a]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-md">{item.title}</h3>
                  <p className="text-blue-200 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 drop-shadow-md">{item.sub}</p>
                </div>
                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <ArrowRight size={20} className="text-white -rotate-45" />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Modal Overlay for Expanded Details */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedItem(null)}
          ></div>
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl animate-[fadeIn_0.3s_ease-out] flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <div className="h-64 sm:h-96 w-full relative shrink-0">
              <img src={selectedItem.img} alt={selectedItem.title} className={`w-full h-full object-cover ${selectedItem.imgClass}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{selectedItem.title}</h3>
                <p className="text-blue-200 font-medium text-lg">{selectedItem.sub}</p>
              </div>
            </div>
            <div className="p-8 overflow-y-auto bg-gray-50">
              <p className="text-gray-700 text-lg leading-relaxed">{selectedItem.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const SeaLevelRiseVisualizer = () => {
  const[year, setYear] = useState(2026);
  
  const yearsPassed = year - 2026;
  const seaLevelRise = (yearsPassed * (1.15 / 74)).toFixed(2); 
  const landConsumed = Math.floor(yearsPassed * 12.5); 
  const damageDone = (yearsPassed * 0.8).toFixed(1); 
  
  const seaCoverage = Math.min(70, (yearsPassed / 124) * 70);

  return (
    <section className="py-32 bg-white px-6 border-t border-gray-200">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-6 tracking-tight">The Cost of Inaction</h2>
          <p className="text-center text-gray-700 text-xl mb-16 max-w-3xl mx-auto leading-relaxed">
            Based on the Third National Climate Change Study, mean sea levels could rise by 1.15m by 2100. Move the timeline to see the projected impact on Singapore's East Coast if Long Island is not built.
          </p>
        </FadeIn>

        <div className="bg-gray-50 p-6 md:p-10 rounded-3xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Year</div>
              <div className="text-4xl font-extrabold text-blue-900">{year}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Land Consumed</div>
              <div className="text-4xl font-extrabold text-red-600">{landConsumed} <span className="text-xl text-red-400">ha</span></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Est. Damage</div>
              <div className="text-4xl font-extrabold text-orange-600">${damageDone} <span className="text-xl text-orange-400">B</span></div>
            </div>
          </div>

          <div className="mb-12">
            <input 
              type="range" 
              min={2026} 
              max={2150} 
              step={1}
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Year slider"
            />
            <div className="flex justify-between text-sm text-gray-500 font-bold mt-3" aria-hidden="true">
              <span>2026</span>
              <span>2150</span>
            </div>
          </div>

          <div className="relative w-full h-80 md:h-96 bg-[#e6e2d3] rounded-2xl overflow-hidden border-4 border-white shadow-lg">
            <div className="absolute inset-0 flex flex-col justify-between p-8 z-10 pointer-events-none">
              <div className="flex justify-around w-full opacity-80">
                <Home size={40} className="text-gray-700" />
                <Home size={48} className="text-gray-700" />
                <Home size={40} className="text-gray-700" />
              </div>
              <div className="flex justify-around w-full opacity-80 mt-8">
                <TreePine size={40} className="text-green-700" />
                <Home size={32} className="text-gray-700" />
                <TreePine size={48} className="text-green-700" />
              </div>
              <div className="flex justify-around w-full opacity-80 mt-auto mb-16">
                <TreePine size={32} className="text-green-700" />
                <TreePine size={32} className="text-green-700" />
                <TreePine size={32} className="text-green-700" />
              </div>
            </div>

            <div className="absolute bottom-0 w-full h-1/5 bg-[#d4c5a9]"></div>

            {/* Animated Wave Water Level */}
            <motion.div 
              className="absolute bottom-0 w-full bg-blue-500/80 backdrop-blur-sm flex items-start justify-center pt-4 border-t-4 border-blue-400/80 shadow-[0_-10px_30px_rgba(59,130,246,0.3)]"
              animate={{ 
                height: `${20 + seaCoverage}%`,
                opacity: 0.8 + (seaCoverage/200)
              }}
              transition={{ type: "tween", duration: 0.5 }}
            >
              <div className="text-white font-bold tracking-widest uppercase text-sm drop-shadow-md">
                Sea Level +{seaLevelRise}m
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTAAndFooter = ({ setCurrentView }) => (
  <>
    <section className="py-32 bg-gradient-to-br from-blue-900 via-blue-800 to-[#0a1128] text-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Explore the Interactive Platform</h2>
          <p className="text-blue-100 text-xl mb-12 font-medium max-w-2xl mx-auto drop-shadow-md">
            Use our interactive tools to understand the design trade-offs and create your own Long Island configuration.
          </p>
          <button 
            onClick={() => setCurrentView('challenge')}
            className="mx-auto bg-white text-gray-900 font-bold px-10 py-5 rounded-full flex items-center justify-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:-translate-y-1"
          >
            Start Design Challenge <ArrowRight size={20} />
          </button>
        </FadeIn>
      </div>
    </section>

    <footer className="bg-[#050814] text-gray-400 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-gray-800 pb-12 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-700 text-white font-bold w-8 h-8 flex items-center justify-center rounded-md">LI</div>
            <h4 className="text-white font-bold text-lg tracking-tight">Long Island</h4>
          </div>
          <p className="text-sm leading-relaxed font-medium max-w-xs text-gray-400">A comprehensive coastal protection and water resilience initiative for Singapore's future.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 tracking-tight">Key Features</h4>
          <ul className="text-sm space-y-3 font-medium text-gray-400">
            <li className="hover:text-blue-400 transition-colors cursor-pointer">800ha Reclaimed Land</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">18th Freshwater Reservoir</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">Floating Solar Integration</li>
            <li className="hover:text-blue-400 transition-colors cursor-pointer">20km Waterfront Parks</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 tracking-tight">Contact</h4>
          <p className="text-sm font-medium leading-relaxed text-gray-400 mb-4">For inquiries about the Long Island development plan, please contact the relevant authorities.</p>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSduQI5sU-3AejLUpWkqfhnEgDpeCk55ii2UuLG248H5JsHc1g/viewform?usp=publish-editor" 
            target="_blank" 
            rel="noreferrer"
            className="inline-block bg-blue-700 hover:bg-blue-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors"
          >
            Take our Survey
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-medium text-gray-500">
        <p>Prototype developed by PW Group 40</p>
        <p className="mt-2 md:mt-0">Educational Platform</p>
      </div>
    </footer>
  </>
);

// --- Game Components ---

const Slider = ({ label, value, min, max, step = 1, unit, onChange, impact, tooltip }) => (
  <div className="mb-6">
    <div className="flex justify-between items-end mb-2">
      <label className="font-semibold text-gray-800 text-sm flex items-center">
        {label} {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <span className="text-blue-600 font-bold text-lg leading-none" aria-live="polite">{value} {unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step}
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label={`${label} slider`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
    />
    <div className="flex justify-between text-xs text-gray-400 mb-3 font-medium" aria-hidden="true">
      <span>{min} {unit}</span>
      <span>{max} {unit}</span>
    </div>
    <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-xs p-2.5 rounded-md leading-relaxed">
      <span className="font-semibold">Impact:</span> {impact}
    </div>
  </div>
);

const ChallengeGame = () => {
  const[gamePhase, setGamePhase] = useState('design');
  const[landArea, setLandArea] = useState(800);
  const[barrierHeight, setBarrierHeight] = useState(5.0);
  const[reservoir, setReservoir] = useState(100);
  const[solar, setSolar] = useState(100);
  const[parks, setParks] = useState(160);
  const[leisure, setLeisure] = useState(160);
  const[housing, setHousing] = useState(230);

  const saveDatabaseToStorage = () => {
    if (dbInstance) {
      const data = dbInstance.export();
      const base64 = uint8ToBase64(data);
      localStorage.setItem('ura_submissions_db', base64);
    }
  };
  
  // Database Mock State
  const [sessionId] = useState(`session_${Date.now()}`);
  const[isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dbInstance, setDbInstance] = useState(null);

  // Initialize sql.js database
useEffect(() => {
    const initDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `https://unpkg.com/sql.js@1.14.1/dist/${file}`
        });
        
        const savedDb = localStorage.getItem('ura_submissions_db');
        let db;
        
        if (savedDb) {
          const uInt8Array = base64ToUint8(savedDb);
          db = new SQL.Database(uInt8Array);
        } else {
          db = new SQL.Database();
          
          db.run(`
            CREATE TABLE IF NOT EXISTS submissions (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              sessionId TEXT,
              landArea REAL, 
              barrierHeight REAL, 
              reservoir REAL, 
              solar REAL, 
              parks REAL, 
              leisure REAL, 
              housing REAL, 
              score REAL
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
          
          const data = db.export();
          const base64 = uint8ToBase64(data);
          localStorage.setItem('ura_submissions_db', base64);
        }
        
        setDbInstance(db);
        console.log("SQLite Database initialized successfully!");
      } catch (err) {
        console.error("Failed to initialize SQLite database:", err);
      }
    };
    
    initDb();

    return () => {
      if (dbInstance) {
        dbInstance.close();
      }
    };
  },[]);

  // Constants & Calculations
  const OFF_LAND = 800; 
  const OFF_BARRIER = 5.0; 
  const OFF_RES = 100; 
  const OFF_SOLAR = 100; 
  const OFF_PARKS = 160;
  const OFF_LEISURE = 160;
  const OFF_HOUSING = 230;

  const reservoirArea = reservoir * 1.5; 
  const solarArea = solar;
  
  const totalUsedArea = reservoirArea + solarArea + parks + leisure + housing;
  const unusedArea = landArea - totalUsedArea;
  const isOverAllocated = unusedArea < 0;
  
  const resPct = Math.max(0, (reservoirArea / landArea) * 100);
  const solarPct = Math.max(0, (solarArea / landArea) * 100);
  const parksPct = Math.max(0, (parks / landArea) * 100);
  const leisurePct = Math.max(0, (leisure / landArea) * 100);
  const housingPct = Math.max(0, (housing / landArea) * 100);
  const unusedPct = Math.max(0, (unusedArea / landArea) * 100);

  // Cost calculation
  const cost = 10 + (landArea/OFF_LAND)*4 + (barrierHeight/OFF_BARRIER)*3 + (reservoir/OFF_RES)*2 + (solar/OFF_SOLAR)*1 + (parks/OFF_PARKS)*0.5 + (leisure/OFF_LEISURE)*0.5 + (housing/OFF_HOUSING)*2;
  const isOverBudget = cost > 25.0; // Hard stop budget constraint
  
  const costPenalty = cost > 23 ? Math.round((cost - 23) * 5) : 0;

  // Main 5 Factors (Max 100 each)
  const coastal = Math.min(100, Math.round((barrierHeight/OFF_BARRIER)*60 + (landArea/OFF_LAND)*40));
  const flood = Math.min(100, Math.round((barrierHeight/OFF_BARRIER)*50 + (reservoir/OFF_RES)*50));
  const water = Math.min(100, Math.round((reservoir/OFF_RES)*100));
  const landScore = Math.min(100, Math.round((housing/OFF_HOUSING)*100)); 
  const opportunities = Math.min(100, Math.round((leisure/OFF_LEISURE)*100));

  // Score Calculations
  const baseAverage = Math.round((coastal + flood + water + landScore + opportunities) / 5);
  const scaledBase = Math.round(baseAverage * 0.9); // Base factors account for up to 90 points
  
  // Side Missions (Max 5 points each)
  const solarPoints = Math.min(5, Math.round((solar / OFF_SOLAR) * 5));
  const greenPoints = Math.min(5, Math.round((parks / OFF_PARKS) * 5));

  const overallUser = Math.min(100, Math.max(0, scaledBase + solarPoints + greenPoints - costPenalty));
  const overallOfficial = 100;

  // Format currency with Intl
  const formattedCost = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(cost);

  const radarData =[
    { subject: 'Coastal Protection', A: coastal, B: 100, fullMark: 100 },
    { subject: 'Flood Resilience', A: flood, B: 100, fullMark: 100 },
    { subject: 'Water Resilience', A: water, B: 100, fullMark: 100 },
    { subject: 'More Land', A: landScore, B: 100, fullMark: 100 },
    { subject: 'New Opportunities', A: opportunities, B: 100, fullMark: 100 },
  ];

  // AI Logic
  const strengths =[]; const weaknesses =[];
  if (coastal >= 95) strengths.push("Exceptional coastal protection");
  if (water >= 95) strengths.push("Highly resilient water supply");
  if (cost <= 20) strengths.push(`Highly cost-effective (${formattedCost}B)`);
  if (opportunities >= 90) strengths.push("Fantastic community & recreational spaces");
  if (unusedArea > 50) strengths.push("Smart use of unused land to save costs");
  if (solar >= 100) strengths.push("Excellent clean energy generation");
  if (parks >= 160) strengths.push("Beautiful Green Island environment");

  if (coastal < 80) weaknesses.push("Vulnerable to extreme storm surges");
  if (cost > 23) weaknesses.push(`Over budget target (${formattedCost}B)`);
  if (solar > 120) weaknesses.push("Excessive solar panels limit water recreation");
  if (leisure < 100) weaknesses.push("Insufficient recreational spaces for residents");
  if (housing < 150) weaknesses.push("Very little land left for housing and commercial use");
  if (parks < 100) weaknesses.push("Lacking sufficient green spaces for biodiversity");

  if (strengths.length === 0) strengths.push("Balanced baseline approach");
  if (weaknesses.length === 0) weaknesses.push("No major critical weaknesses");

  // Handlers
  const handleShare = () => {
    const text = encodeURIComponent(`I just designed Singapore's Long Island and scored ${overallUser}/100! Can you beat my urban planning skills? 🇸🇬 #LongIslandSG #UrbanPlanning`);
    const hashtags = encodeURIComponent("UrbanPlanning,DesignChallenge,LongIslandSG");
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`;
    window.open(shareUrl, "_blank");
  };

  const handleSuggestToURA = async () => {
    setIsSubmitting(true);
    
    try {
      if (dbInstance) {
        dbInstance.run(
          'INSERT INTO submissions (sessionId, landArea, barrierHeight, reservoir, solar, parks, leisure, housing, score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',[sessionId, landArea, barrierHeight, reservoir, solar, parks, leisure, housing, overallUser]
        );
        
        // Export and save to localStorage to persist the database
        const data = dbInstance.export();
        localStorage.setItem('ura_submissions_db', uint8ToBase64(data));
      } else {
        // Fallback if sql.js completely failed to load
        const fallback = JSON.parse(localStorage.getItem('ura_submissions_fallback') || '[]');
        fallback.push({ sessionId, landArea, barrierHeight, reservoir, solar, parks, leisure, housing, score: overallUser });
        localStorage.setItem('ura_submissions_fallback', JSON.stringify(fallback));
      }
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Failed to save submission:", error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 fade-in">
      <style>{`
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .pop-value { animation: pop 0.3s ease-out; }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      `}</style>
      
      <div className="bg-[#0a1128] text-white py-16 px-6 border-b border-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-600/30 border border-blue-500/50 rounded-full text-xs font-semibold backdrop-blur-sm tracking-wider uppercase">
              Interactive Tool
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {gamePhase === 'design' ? 'Configure Your Long Island' : 'Design Analysis & Comparison'}
          </h1>
          <p className="text-blue-200 max-w-2xl text-lg leading-relaxed font-light">
            {gamePhase === 'design' 
              ? 'Balance the trade-offs between coastal protection, water security, land reclamation, and environmental sustainability. Watch your budget and land usage carefully!'
              : 'See how your custom infrastructure configuration stacks up against the official Singapore master plan.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {gamePhase === 'design' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-blue-600"/> Physical Dimensions
                </h2>
                <Slider 
                  label="Reclaimed Land Area" 
                  tooltip="Total area of sand filled into the sea to create the island. More land gives more flexibility but is ecologically disruptive and expensive."
                  value={landArea} min={400} max={1200} step={50} unit="ha" 
                  onChange={setLandArea} 
                  impact="Sets the total available canvas. Larger islands cost more but provide space for facilities and housing."
                />
                <Slider 
                  label="Barrier Wall Height" 
                  tooltip="Height of the sea wall above mean sea level. Crucial for defending against 2100 climate projections."
                  value={barrierHeight} min={3.0} max={7.0} step={0.1} unit="m" 
                  onChange={setBarrierHeight} 
                  impact="Higher barriers offer better protection against extreme sea level rise but cost significantly more."
                />
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Droplets size={20} className="text-cyan-500"/> Water & Energy Infrastructure
                </h2>
                <Slider 
                  label="Reservoir Capacity" 
                  tooltip="Size of the enclosed freshwater body. Singapore currently imports water; this reduces external reliance."
                  value={reservoir} min={50} max={150} step={10} unit="M L/day" 
                  onChange={setReservoir} 
                  impact="Higher capacity improves water resilience but consumes massive amounts of land space."
                />
                <Slider 
                  label="Floating Solar Coverage" 
                  tooltip="Solar panels placed on the reservoir surface. Generates clean energy but can block sunlight for marine life if overused."
                  value={solar} min={0} max={200} step={10} unit="ha" 
                  onChange={setSolar} 
                  impact="Generates clean energy but consumes land/water surface area."
                />
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Leaf size={20} className="text-green-500"/> Environmental & Community
                </h2>
                <Slider 
                  label="Parks & Nature Reserves" 
                  tooltip="Land dedicated to natural parks, mangroves, and biodiversity."
                  value={parks} min={0} max={400} step={10} unit="ha" 
                  onChange={setParks} 
                  impact="Boosts biodiversity and public well-being."
                />
                <Slider 
                  label="Leisure & Amenities" 
                  tooltip="Land for recreational facilities, sports, and community spaces."
                  value={leisure} min={0} max={400} step={10} unit="ha" 
                  onChange={setLeisure} 
                  impact="Increases community engagement and lifestyle quality."
                />
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Home size={20} className="text-orange-500"/> Urban Development
                </h2>
                <Slider 
                  label="Housing & Commercial" 
                  tooltip="Land allocated for residential buildings, commercial zones, and urban infrastructure."
                  value={housing} min={0} max={600} step={10} unit="ha" 
                  onChange={setHousing} 
                  impact="Provides essential living spaces but increases infrastructure costs. Leaving land unused can save budget."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className={`bg-white rounded-2xl shadow-sm border transition-colors duration-300 overflow-hidden sticky top-24 ${isOverBudget ? 'border-red-300' : 'border-gray-100'}`}>
                <div className="bg-gray-50 border-b border-gray-100 p-5 font-bold text-gray-800 flex items-center gap-2">
                  <Map size={18} className="text-gray-500" /> Long Island Visualizer
                </div>
                <div className="p-6">
                  <div className="relative w-full h-28 bg-blue-50/50 rounded-xl border border-blue-100 overflow-hidden flex flex-col justify-center items-center p-4 shadow-inner mb-8">
                    <div className="absolute top-2 left-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Sea</div>
                    
                    <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex shadow-md border border-gray-300 relative">
                      {isOverAllocated && (
                        <div className="absolute inset-0 bg-red-500/20 z-10 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">OVER CAPACITY</span>
                        </div>
                      )}
                      <div style={{width: `${resPct}%`}} className="bg-cyan-400 transition-all duration-500" title="Reservoir" />
                      <div style={{width: `${solarPct}%`}} className="bg-slate-700 transition-all duration-500" title="Solar" />
                      <div style={{width: `${parksPct}%`}} className="bg-green-500 transition-all duration-500" title="Parks" />
                      <div style={{width: `${leisurePct}%`}} className="bg-emerald-300 transition-all duration-500" title="Leisure" />
                      <div style={{width: `${housingPct}%`}} className="bg-orange-400 transition-all duration-500" title="Housing" />
                      <div style={{width: `${unusedPct}%`}} className="bg-gray-100 transition-all duration-500" title="Unused Land" />
                    </div>
                    
                    <div className="absolute bottom-2 right-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Coastline</div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <PieChart size={16} /> Land Allocation
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-400"></div> Reservoir</div>
                      <span className="font-medium">{reservoirArea} ha</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-700"></div> Solar</div>
                      <span className="font-medium">{solarArea} ha</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Parks</div>
                      <span className="font-medium">{parks} ha</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-300"></div> Leisure</div>
                      <span className="font-medium">{leisure} ha</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400"></div> Housing</div>
                      <span className="font-medium">{housing} ha</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></div> Unused Land</div>
                      <span className={`font-bold ${isOverAllocated ? 'text-red-600' : 'text-gray-900'}`}>{unusedArea} ha</span>
                    </div>
                  </div>

                  <div className="mt-6 h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-500 ${isOverAllocated ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${Math.min(100, (totalUsedArea/landArea)*100)}%`}}></div>
                  </div>
                  <div className="mt-2 text-right text-xs font-medium text-gray-500">
                    {Math.round((totalUsedArea/landArea)*100)}% Used
                  </div>

                  {isOverAllocated && (
                    <div className="mt-4 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 flex items-start gap-2" role="alert">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>Not enough land! You have over-allocated facilities. Increase land area or reduce facilities to proceed.</span>
                    </div>
                  )}

                  <div className={`pt-6 mt-6 border-t transition-colors duration-300 ${isOverBudget ? 'border-red-200 bg-red-50 -mx-6 px-6 pb-6 rounded-b-2xl' : 'border-gray-100'}`}>
                    <div className="text-sm text-gray-500 mb-1 font-medium flex items-center gap-1">
                      Estimated Cost <InfoTooltip text="Maximum national budget is $25.0B. Exceeding this prevents project approval." />
                    </div>
                    <div key={cost} className={`text-3xl font-bold tracking-tight pop-value ${isOverBudget ? 'text-red-600' : cost > 23 ? 'text-orange-500' : 'text-gray-900'}`}>
                      {formattedCost}B
                    </div>
                    <div className={`text-xs mt-1 font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-400'}`}>
                      {isOverBudget ? '❌ Exceeds absolute maximum budget ($25B)' : cost > 23 ? '⚠ Warning: Approaching budget limit' : 'USD, preliminary estimates'}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setGamePhase('compare');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={isOverAllocated || isOverBudget}
                    className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                      (isOverAllocated || isOverBudget)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-1'
                    }`}
                    aria-disabled={isOverAllocated || isOverBudget}
                  >
                    Submit & Compare Design <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <button 
                onClick={() => {
                  setGamePhase('design');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-gray-600 font-semibold hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-5 py-2.5 rounded-full focus:ring-2 focus:ring-gray-300"
              >
                <ArrowLeft size={18} aria-hidden="true" /> Modify Design
              </button>

              <div className="flex items-center gap-10">
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Your Score</div>
                  <div className={`text-5xl font-extrabold tracking-tight ${overallUser >= overallOfficial ? 'text-green-500' : 'text-blue-600'}`}>
                    {overallUser} <span className="text-xl text-gray-300 font-medium">/ 100</span>
                  </div>
                </div>
                <div className="h-16 w-px bg-gray-200" aria-hidden="true"></div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Official Plan</div>
                  <div className="text-5xl font-extrabold tracking-tight text-gray-900">
                    {overallOfficial} <span className="text-xl text-gray-300 font-medium">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg mb-2">Performance Comparison</h3>
                <p className="text-sm text-gray-500 mb-6 font-light">Visual balance of your design across 5 national objectives</p>
                
                <div className="w-full" style={{ height: '350px' }} aria-hidden="true">
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid stroke="#f3f4f6" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Your Design" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                      <Radar name="Official Plan" dataKey="B" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                      <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-2">Objective Analysis</h3>
                <p className="text-sm text-gray-500 mb-8 font-light">Detailed breakdown against national priorities</p>
                
                <div className="space-y-6">
                  {radarData.map((metric, idx) => (
                    <div key={idx} className="mb-5">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{metric.subject}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-16">Your Design</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${metric.A}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 w-8 text-right">{metric.A}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-16">Official Plan</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${metric.B}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-green-600 w-8 text-right">{metric.B}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Missions Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                Side Missions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border transition-all duration-500 ${solar >= 100 ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold text-lg flex items-center gap-2 ${solar >= 100 ? 'text-green-800' : 'text-gray-700'}`}>
                      <Zap size={18} className={solar >= 100 ? 'text-green-600' : 'text-gray-400'} /> Clean Energy Pioneer
                    </h4>
                    <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${solar >= 100 ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                      +{solarPoints} / 5 pts
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${solar >= 100 ? 'text-green-700' : 'text-gray-500'}`}>
                    {solar >= 100 ? '✓ Sufficient solar energy generated for the grid.' : 'Deploy at least 100ha of floating solar panels.'}
                  </p>
                </div>
                
                <div className={`p-6 rounded-xl border transition-all duration-500 ${parks >= 160 ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold text-lg flex items-center gap-2 ${parks >= 160 ? 'text-green-800' : 'text-gray-700'}`}>
                      <TreePine size={18} className={parks >= 160 ? 'text-green-600' : 'text-gray-400'} /> Green Island
                    </h4>
                    <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${parks >= 160 ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                      +{greenPoints} / 5 pts
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${parks >= 160 ? 'text-green-700' : 'text-gray-500'}`}>
                    {parks >= 160 ? '✓ Lush green spaces established for biodiversity.' : 'Develop at least 160ha of nature parks.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-600" aria-hidden="true" /> AI Design Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                  <h4 className="text-xs font-bold text-green-800 mb-4 uppercase tracking-widest">Strengths</h4>
                  <div className="space-y-4">
                    {strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-gray-800 font-medium">
                        <CheckCircle size={18} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" /> <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
                  <h4 className="text-xs font-bold text-red-800 mb-4 uppercase tracking-widest">Weaknesses & Risks</h4>
                  <div className="space-y-4">
                    {weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-gray-800 font-medium">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" /> <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
{/* Social Share & Database Submission Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-gray-200">
              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1DA1F2] text-white font-bold rounded-xl shadow-md hover:bg-[#1a8cd8] transition-all duration-300 hover:-translate-y-1 focus:ring-4 focus:ring-blue-300"
              >
                <Share2 size={18} /> Share on X
              </button>
              
              <button 
                onClick={handleSuggestToURA}
                disabled={isSubmitting || submitSuccess}
                className={`flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl shadow-md transition-all duration-300 focus:ring-4 focus:ring-green-300 ${
                  submitSuccess 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-1'
                }`}
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Submitting...</span>
                ) : submitSuccess ? (
                  <><CheckCircle size={18} /> Sent to URA Database</>
                ) : (
                  <><Send size={18} /> Suggest to URA</>
                )}
              </button>

              {/* Survey Button added here */}
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSduQI5sU-3AejLUpWkqfhnEgDpeCk55ii2UuLG248H5JsHc1g/viewform?usp=publish-editor" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-700 text-white font-bold rounded-xl shadow-md hover:bg-blue-600 transition-all duration-300 hover:-translate-y-1 focus:ring-4 focus:ring-blue-300"
              >
                <MessageCircle size={18} /> Fill Survey
              </a>
            </div>

            {submitSuccess && (
              <p className="text-center text-sm text-green-600 font-medium mt-2">
                Your design has been permanently saved to the local sentiment database.
              </p>
            )}

          </div>
        )}
      </div>

      {/* Quick Win 2: Sticky Mobile Summary Bar */}
      {gamePhase === 'design' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500 font-medium">Est. Cost</div>
            <div className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>{formattedCost}B</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-medium">Land Usage</div>
            <div className={`text-lg font-bold ${isOverAllocated ? 'text-red-600' : 'text-gray-900'}`}>
              {Math.round((totalUsedArea/landArea)*100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const[currentView, setCurrentView] = useState('landing');

  useEffect(() => {
    window.scrollTo(0, 0);
  },[currentView]);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-blue-900">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      {currentView === 'landing' ? (
        <main className="fade-in">
          <Hero setCurrentView={setCurrentView} />
          <Challenge />
          <MasterPlan />
          <Objectives />
          <Infrastructure />
          <SeaLevelRiseVisualizer />
          <CTAAndFooter setCurrentView={setCurrentView} />
        </main>
      ) : (
        <ChallengeGame />
      )}
      
      <FloatingChat />
    </div>
  );
}