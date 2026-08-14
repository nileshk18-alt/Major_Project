import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CarFront, Search, UserRound, Menu, X, Sparkles, CalendarDays, MapPin, ShieldCheck, Zap, Heart, Gauge, Fuel, Settings2, Luggage, Star, ArrowRight, LogOut, CreditCard, Download, Gift, KeyRound, MapPinned, FileCheck2, MessageCircle, Leaf, Crown } from "lucide-react";
import { api, API, downloadInvoice } from "./api.js";

const FALLBACK_CAR_IMAGE = "/images/cars/scorpio.jpeg";
function SafeCarImage({ src, alt, className = "", ...props }) {
  const [failed, setFailed] = useState(false);
  return <img src={failed || !src ? FALLBACK_CAR_IMAGE : src} alt={alt || "DriveLux vehicle"} className={className} onError={() => setFailed(true)} {...props} />;
}


const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("drivelux_user") || "null"); } catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("drivelux_token")));

  const login = (payload) => {
    localStorage.setItem("drivelux_token", payload.token);
    localStorage.setItem("drivelux_user", JSON.stringify(payload.user));
    setUser(payload.user);
  };
  const logout = () => {
    localStorage.removeItem("drivelux_token");
    localStorage.removeItem("drivelux_user");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("drivelux_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem("drivelux_user", JSON.stringify(user));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-loader">Loading your DriveLux account…</div>;
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

function App() {
  return <AuthProvider><Layout /></AuthProvider>;
}

function Layout() {
  const { user, logout } = useAuth();
  const [mobile, setMobile] = useState(false);
  return (
    <div className="app-shell">
      <header className="nav-wrap">
        <nav className="navbar">
          <Link to="/" className="brand"><span className="brand-mark"><CarFront size={21}/></span><span>Drive<span>Lux</span></span></Link>
          <button className="mobile-menu" onClick={() => setMobile(!mobile)}>{mobile ? <X/> : <Menu/>}</button>
          <div className={`nav-links ${mobile ? "open" : ""}`}>
            <NavLink to="/" onClick={() => setMobile(false)}>Home</NavLink>
            <NavLink to="/fleet" onClick={() => setMobile(false)}>Fleet</NavLink>
            <NavLink to="/ai" onClick={() => setMobile(false)}>AI Concierge</NavLink>
            <NavLink to="/experiences" onClick={() => setMobile(false)}>Experiences</NavLink>
            {user && <NavLink to="/dashboard" onClick={() => setMobile(false)}>Dashboard</NavLink>}
          </div>
          <div className="nav-actions">
            {user ? <><Link className="avatar-btn" to="/dashboard"><UserRound size={18}/><span>{user.name.split(" ")[0]}</span></Link><button className="icon-btn" onClick={logout} title="Logout"><LogOut size={17}/></button></> : <Link className="login-btn" to="/login">Sign in</Link>}
          </div>
        </nav>
      </header>

      <main><Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/fleet" element={<Fleet/>}/>
        <Route path="/vehicle/:id" element={<VehicleDetails/>}/>
        <Route path="/ai" element={<AIConcierge/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/checkout/:id" element={<Checkout/>}/>
        <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
        <Route path="/experiences" element={<Experiences/>}/>
        <Route path="*" element={<Home/>}/>
      </Routes></main>

      <footer className="footer">
        <div className="footer-grid">
          <div><Link to="/" className="brand"><span className="brand-mark"><CarFront size={18}/></span><span>Drive<span>Lux</span></span></Link><p>Premium cars. Intelligent rentals. Effortless journeys.</p></div>
          <div><h4>Explore</h4><Link to="/fleet">Fleet</Link><Link to="/ai">AI Concierge</Link><Link to="/experiences">Experiences</Link></div>
          <div><h4>Trust</h4><span>Verified fleet</span><span>Secure checkout</span><span>24/7 assistance</span></div>
          <div><h4>Support</h4><span>support@drivelux.demo</span><span>+91 90000 00000</span></div>
        </div>
        <div className="footer-bottom">© 2026 DriveLux. Demo production-style MERN application.</div>
      </footer>

      <div className="mobile-bottom">
        <Link to="/"><CarFront size={19}/><span>Home</span></Link>
        <Link to="/fleet"><Search size={19}/><span>Fleet</span></Link>
        <Link to="/ai"><Sparkles size={19}/><span>AI</span></Link>
        <Link to={user ? "/dashboard" : "/login"}><UserRound size={19}/><span>Account</span></Link>
      </div>
    </div>
  );
}

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Login/>;
}

function Home() {
  const [vehicles, setVehicles] = useState([]);
  useEffect(() => { api.get("/vehicles").then(setVehicles).catch(console.error); }, []);
  return <>
    <section className="hero">
      <div className="hero-glow glow-one"/><div className="hero-glow glow-two"/>
      <div className="hero-content">
        <div className="eyebrow"><span className="live-dot"/> Premium mobility, reimagined</div>
        <h1>Drive what <em>moves</em> you.</h1>
        <p>From smart city rides to supercar weekends, discover a curated fleet with transparent pricing and an AI concierge.</p>
        <div className="hero-ctas"><Link className="btn primary" to="/fleet">Explore the fleet <ArrowRight size={18}/></Link><Link className="btn ghost" to="/ai"><Sparkles size={17}/> Ask AI concierge</Link></div>
      </div>
      <BookingWidget/>
    </section>

    <section className="section">
      <div className="section-head"><div><span className="eyebrow">Curated collection</span><h2>Find your next <em>favorite</em>.</h2></div><Link className="text-link" to="/fleet">View all cars <ArrowRight size={16}/></Link></div>
      <div className="fleet-grid home-fleet">{vehicles.slice(0,6).map(v => <VehicleCard key={v._id} vehicle={v}/>)}</div>
    </section>

    <section className="trust-strip"><div><ShieldCheck/><strong>Verified fleet</strong><span>Inspected & maintained</span></div><div><CreditCard/><strong>Transparent checkout</strong><span>No hidden surprises</span></div><div><Sparkles/><strong>AI matched</strong><span>Recommendations for your trip</span></div><div><Zap/><strong>Fast pickup</strong><span>Digital-first handover</span></div></section>

    <section className="section ai-banner">
      <div><div className="ai-orb"><Sparkles size={28}/></div><span className="eyebrow">DriveLux Intelligence</span><h2>Your personal <em>car concierge</em>.</h2><p>Tell us where you're going, who you're travelling with and what matters. Our scoring engine ranks the fleet around your actual needs.</p><Link className="btn primary" to="/ai">Get my recommendation <ArrowRight size={18}/></Link></div>
      <div className="ai-preview"><div className="mini-chat"><span>AI Concierge</span><p>“I'm travelling with 5 people for a weekend getaway.”</p><strong>I'd prioritize the Scorpio-N, Fortuner or Defender for space, luggage and road-trip comfort.</strong></div></div>
    </section>

    <FAQ/>
  </>;
}

function BookingWidget() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("Mumbai Airport");
  const [dropoff, setDropoff] = useState("Mumbai Airport");
  const [start, setStart] = useState(new Date().toISOString().slice(0,10));
  const [end, setEnd] = useState(new Date(Date.now()+86400000).toISOString().slice(0,10));
  const submit = e => { e.preventDefault(); navigate(`/fleet?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}&start=${start}&end=${end}`); };
  return <motion.form initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.15}} className="booking-widget" onSubmit={submit}>
    <div className="widget-top"><div><span className="eyebrow">Book a vehicle</span><h3>Ready when you are.</h3></div><span className="secure-pill"><ShieldCheck size={14}/> Secure</span></div>
    <div className="form-grid">
      <label><span>Pick-up location</span><div className="input-icon"><MapPin size={17}/><input value={pickup} onChange={e=>setPickup(e.target.value)} placeholder="Airport, city or hub"/></div></label>
      <label><span>Drop-off location</span><div className="input-icon"><MapPin size={17}/><input value={dropoff} onChange={e=>setDropoff(e.target.value)} placeholder="Same as pickup"/></div></label>
      <label><span>Pick-up date</span><div className="input-icon"><CalendarDays size={17}/><input type="date" value={start} onChange={e=>setStart(e.target.value)}/></div></label>
      <label><span>Drop-off date</span><div className="input-icon"><CalendarDays size={17}/><input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></div></label>
    </div>
    <button className="btn primary wide">Search premium fleet <Search size={17}/></button>
  </motion.form>;
}

function VehicleCard({ vehicle }) {
  const [fav,setFav] = useState(false);
  return <motion.article whileHover={{y:-6}} className="vehicle-card">
    <div className="vehicle-image-wrap">
      <span className="category-badge">{vehicle.category}</span>
      <button className={`fav-btn ${fav ? "active":""}`} onClick={()=>setFav(!fav)}><Heart size={17} fill={fav ? "currentColor":"none"}/></button>
      <SafeCarImage src={vehicle.image} alt={`${vehicle.brand} ${vehicle.name}`} loading="lazy"/>
      <div className="image-fade"/>
    </div>
    <div className="vehicle-card-body">
      <div className="vehicle-title-row"><div><small>{vehicle.brand}</small><h3>{vehicle.name}</h3></div><div className="rating"><Star size={14} fill="currentColor"/>{vehicle.rating}</div></div>
      <div className="spec-row">
        <span><UserRound size={14}/>{vehicle.seats}</span><span><Fuel size={14}/>{vehicle.fuel}</span><span><Settings2 size={14}/>{vehicle.transmission}</span><span><Luggage size={14}/>{vehicle.luggage}</span>
      </div>
      <div className="card-bottom"><div><small>from</small><strong>₹{vehicle.pricePerDay.toLocaleString("en-IN")}</strong><small>/day</small></div><Link className="card-link" to={`/vehicle/${vehicle._id}`}>View details <ArrowRight size={15}/></Link></div>
    </div>
  </motion.article>;
}

function Fleet() {
  const [vehicles,setVehicles] = useState([]);
  const [filters,setFilters] = useState({category:"All",brand:"All",transmission:"All",maxPrice:""});
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ setLoading(true); api.get(`/vehicles?${new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v])=>v)))}`).then(setVehicles).finally(()=>setLoading(false)); },[filters]);
  const brands = [...new Set(vehicles.map(v=>v.brand))];
  return <section className="section fleet-page"><div className="page-title"><span className="eyebrow">The DriveLux collection</span><h1>Choose your <em>machine.</em></h1><p>Every vehicle is curated for comfort, condition and a premium rental experience.</p></div>
    <div className="filter-bar">
      <div className="filter-scroll">{["All","Economy","Sedan","SUV","Luxury","Sports","Off-Road","Premium"].map(c=><button className={filters.category===c?"selected":""} onClick={()=>setFilters({...filters,category:c})} key={c}>{c}</button>)}</div>
      <select value={filters.brand} onChange={e=>setFilters({...filters,brand:e.target.value})}><option>All</option>{brands.map(b=><option key={b}>{b}</option>)}</select>
      <select value={filters.transmission} onChange={e=>setFilters({...filters,transmission:e.target.value})}><option>All</option><option>Automatic</option><option>Manual</option></select>
      <select value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})}><option value="">Any price</option><option value="2500">Under ₹2,500</option><option value="5000">Under ₹5,000</option><option value="10000">Under ₹10,000</option></select>
    </div>
    {loading ? <div className="loading-grid">{Array.from({length:6}).map((_,i)=><div className="skeleton" key={i}/>)}</div> : <div className="fleet-grid">{vehicles.map(v=><VehicleCard key={v._id} vehicle={v}/>)}</div>}
  </section>;
}

function VehicleDetails() {
  const { id } = useParamsSafe();
  const [vehicle,setVehicle]=useState(null);
  const [tour,setTour]=useState(0);
  useEffect(()=>{api.get(`/vehicles/${id}`).then(setVehicle).catch(console.error)},[id]);
  if(!vehicle) return <div className="center-loader">Loading vehicle…</div>;
  const tourImages = [vehicle.image, vehicle.image, vehicle.image];
  return <section className="section details-page">
    <div className="detail-image"><SafeCarImage src={tourImages[tour]} alt={vehicle.name}/><div className="tour-controls"><button onClick={()=>setTour((tour+2)%3)}>360° view</button><button onClick={()=>setTour((tour+1)%3)}>Next angle</button></div><span className="tour-label"><Gauge size={15}/> Interactive tour</span></div>
    <div className="detail-info"><span className="eyebrow">{vehicle.category} • {vehicle.brand}</span><h1>{vehicle.name}</h1><div className="detail-rating"><Star fill="currentColor" size={16}/>{vehicle.rating} <span>Verified fleet rating</span></div><p>{vehicle.description}</p>
      <div className="detail-specs"><div><UserRound/><b>{vehicle.seats}</b><span>Seats</span></div><div><Fuel/><b>{vehicle.fuel}</b><span>Fuel</span></div><div><Settings2/><b>{vehicle.transmission}</b><span>Transmission</span></div><div><Luggage/><b>{vehicle.luggage}</b><span>Luggage</span></div></div>
      <div className="feature-chips">{vehicle.features.map(f=><span key={f}>{f}</span>)}</div>
      <div className="detail-price"><div><small>from</small><strong>₹{vehicle.pricePerDay.toLocaleString("en-IN")}</strong><span>/day</span></div><Link className="btn primary" to={`/checkout/${vehicle._id}`}>Rent this vehicle <ArrowRight size={18}/></Link></div>
    </div>
  </section>;
}

function useParamsSafe(){ const p = window.location.pathname.split("/"); return {id:p[p.length-1]}; }

function AIConcierge() {
  const [form,setForm]=useState({tripType:"family",passengers:4,budget:5000,fuel:"any",style:"comfort"});
  const [results,setResults]=useState([]);
  const [meta,setMeta]=useState(null);
  const [chat,setChat]=useState("");
  const [messages,setMessages]=useState([{from:"ai",text:"Hi, I'm your DriveLux AI concierge. Tell me about your trip and I’ll narrow the fleet down."}]);
  const run=()=>api.post("/ai/recommend",form).then(d=>{setResults(d.results);setMeta(d)}).catch(e=>alert(e.message));
  const ask=()=>{if(!chat.trim())return; const q=chat; setMessages(m=>[...m,{from:"you",text:q}]); setChat(""); api.post("/ai/chat",{message:q}).then(d=>setMessages(m=>[...m,{from:"ai",text:d.answer}]));};
  return <section className="section ai-page"><div className="page-title"><span className="eyebrow"><Sparkles size={14}/> DriveLux Intelligence</span><h1>Meet your <em>AI concierge.</em></h1><p>A transparent recommendation engine that scores vehicles against capacity, budget, trip type, fuel preference and driving style.</p></div>
    <div className="ai-layout"><div className="ai-panel">
      <div className="panel-head"><div className="ai-orb small"><Sparkles size={20}/></div><div><h3>Smart vehicle match</h3><span>Multi-factor scoring</span></div></div>
      <label>Trip type<select value={form.tripType} onChange={e=>setForm({...form,tripType:e.target.value})}><option value="family">Family</option><option value="corporate">Corporate</option><option value="adventure">Adventure</option><option value="romantic">Romantic</option><option value="city">City</option></select></label>
      <label>Passengers<input type="number" min="1" max="10" value={form.passengers} onChange={e=>setForm({...form,passengers:e.target.value})}/></label>
      <label>Daily budget <strong>₹{Number(form.budget).toLocaleString("en-IN")}</strong><input type="range" min="1000" max="30000" step="500" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></label>
      <label>Fuel<select value={form.fuel} onChange={e=>setForm({...form,fuel:e.target.value})}><option value="any">Any</option><option>Petrol</option><option>Diesel</option></select></label>
      <label>Driving style<select value={form.style} onChange={e=>setForm({...form,style:e.target.value})}><option value="comfort">Comfort</option><option value="performance">Performance</option><option value="balanced">Balanced</option></select></label>
      <button className="btn primary wide" onClick={run}><Sparkles size={17}/> Find my match</button>
    </div>
    <div className="ai-results"><div className="chat-box">{messages.map((m,i)=><div className={`chat-msg ${m.from}`} key={i}>{m.text}</div>)}<div className="chat-input"><input value={chat} onChange={e=>setChat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask: best luxury car for a wedding…"/><button onClick={ask}><MessageCircle size={18}/></button></div></div>
      {meta && <div className="match-meta"><span><Sparkles size={14}/> {meta.confidence}% confidence</span><p>{meta.explanation}</p></div>}
      <div className="recommend-grid">{results.map(({vehicle,score})=><div className="recommend-card" key={vehicle._id}><SafeCarImage src={vehicle.image} alt={vehicle.name}/><div><small>{vehicle.brand} • {vehicle.category}</small><h3>{vehicle.name}</h3><span className="match-score">{score}% fit</span><Link to={`/vehicle/${vehicle._id}`}>View car <ArrowRight size={14}/></Link></div></div>)}</div>
    </div></div>
  </section>;
}

function Checkout() {
  const { id } = useParamsSafe();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle,setVehicle]=useState(null);
  const [form,setForm]=useState({startDate:new Date().toISOString().slice(0,10),endDate:new Date(Date.now()+86400000).toISOString().slice(0,10),pickupLocation:"Mumbai Airport",dropoffLocation:"Mumbai Airport",pickupTime:"10:00",dropoffTime:"10:00",protection:499,addOns:[{name:"Child seat",price:299}],chauffeur:false,carbonOffset:false,paymentMethod:"demo-card"});
  const [quote,setQuote]=useState(null);
  const [paying,setPaying]=useState(false);
  useEffect(()=>{api.get(`/vehicles/${id}`).then(setVehicle)},[id]);
  useEffect(()=>{if(vehicle){const days=Math.max(1,Math.ceil((new Date(form.endDate)-new Date(form.startDate))/86400000));api.post("/vehicles/quote",{vehicleId:id,startDate:form.startDate,days,protection:form.protection,addOns:form.addOns.reduce((a,b)=>a+b.price,0),chauffeur:form.chauffeur?1200*days:0,carbonOffset:form.carbonOffset}).then(setQuote)}},[vehicle,form.startDate,form.endDate,form.protection,form.addOns,form.chauffeur,form.carbonOffset]);
  if(!vehicle)return <div className="center-loader">Loading checkout…</div>;
  if(!user)return <div className="section auth-required"><div className="auth-card"><Sparkles/><h2>One step before checkout</h2><p>Sign in to save bookings, invoices, loyalty points and payment history.</p><Link className="btn primary" to="/login">Sign in to continue</Link></div></div>;
  const set=(k,v)=>setForm({...form,[k]:v});
  const book=async()=>{setPaying(true);try{const days=Math.max(1,Math.ceil((new Date(form.endDate)-new Date(form.startDate))/86400000));const b=await api.post("/bookings",{vehicleId:id,...form,days});navigate("/dashboard",{state:{success:`Booking ${b.bookingCode} confirmed.`}})}catch(e){alert(e.message)}finally{setPaying(false)}};
  return <section className="section checkout-page"><div className="checkout-head"><span className="eyebrow">Secure checkout</span><h1>Complete your <em>journey.</em></h1><div className="checkout-steps"><span className="active">1 Trip</span><span className="active">2 Options</span><span className="active">3 Payment</span></div></div>
    <div className="checkout-grid"><div className="checkout-main">
      <div className="checkout-card vehicle-summary"><SafeCarImage src={vehicle.image} alt={vehicle.name}/><div><small>{vehicle.brand} • {vehicle.category}</small><h2>{vehicle.name}</h2><span><Star size={14} fill="currentColor"/> {vehicle.rating}</span></div></div>
      <div className="checkout-card"><h3>Trip details</h3><div className="two-col"><label>Pick-up<input type="text" value={form.pickupLocation} onChange={e=>set("pickupLocation",e.target.value)}/></label><label>Drop-off<input type="text" value={form.dropoffLocation} onChange={e=>set("dropoffLocation",e.target.value)}/></label><label>Start<input type="date" value={form.startDate} onChange={e=>set("startDate",e.target.value)}/></label><label>End<input type="date" value={form.endDate} onChange={e=>set("endDate",e.target.value)}/></label><label>Pick-up time<input type="time" value={form.pickupTime} onChange={e=>set("pickupTime",e.target.value)}/></label><label>Drop-off time<input type="time" value={form.dropoffTime} onChange={e=>set("dropoffTime",e.target.value)}/></label></div></div>
      <div className="checkout-card"><h3>Protect & personalize</h3><div className="option-grid"><button className={`option ${form.protection?"chosen":""}`} onClick={()=>set("protection",form.protection?0:499)}><ShieldCheck/><span><b>Premium protection</b><small>₹499 per booking</small></span></button><button className={`option ${form.chauffeur?"chosen":""}`} onClick={()=>set("chauffeur",!form.chauffeur)}><UserRound/><span><b>Chauffeur</b><small>₹1,200/day • Aarav</small></span></button><button className={`option ${form.carbonOffset?"chosen":""}`} onClick={()=>set("carbonOffset",!form.carbonOffset)}><Leaf/><span><b>Carbon offset</b><small>₹149/day</small></span></button></div><div className="addon-line"><span>Child seat</span><button onClick={()=>set("addOns",form.addOns.length?[]:[{name:"Child seat",price:299}])}>{form.addOns.length?"Added ✓":"+ Add ₹299"}</button></div></div>
      <div className="checkout-card"><h3>Virtual payment</h3><div className="payment-methods">{[["demo-card","Card",CreditCard],["demo-upi","UPI",Zap],["demo-wallet","Wallet",Gift]].map(([id,label,Icon])=><button key={id} className={form.paymentMethod===id?"chosen":""} onClick={()=>set("paymentMethod",id)}><Icon size={18}/>{label}</button>)}</div><div className="demo-note"><ShieldCheck size={16}/><span><b>Demo secure payment</b><small>No real money is charged. Use this to test the complete booking experience.</small></span></div></div>
    </div>
    <aside className="price-card"><div className="price-card-top"><span>Live price</span><span className="dynamic-pill"><Zap size={13}/> Dynamic rate</span></div><h2>₹{(quote?.total||0).toLocaleString("en-IN")}</h2><small>estimated total including taxes</small><div className="price-lines">{quote&&<><div><span>Base rental</span><b>₹{quote.base.toLocaleString("en-IN")}</b></div><div><span>Protection</span><b>₹{quote.protection.toLocaleString("en-IN")}</b></div><div><span>Add-ons</span><b>₹{quote.addOns.toLocaleString("en-IN")}</b></div><div><span>Chauffeur</span><b>₹{quote.chauffeur.toLocaleString("en-IN")}</b></div><div><span>Carbon offset</span><b>₹{quote.carbonOffset.toLocaleString("en-IN")}</b></div><div><span>Taxes</span><b>₹{quote.taxes.toLocaleString("en-IN")}</b></div><div className="deposit"><span>Refundable deposit</span><b>₹{quote.deposit.toLocaleString("en-IN")}</b></div></>}</div><button className="btn primary wide" disabled={paying} onClick={book}>{paying?"Processing secure payment…":"Pay & confirm booking"} <ArrowRight size={17}/></button><p className="tiny"><ShieldCheck size={13}/> Instant confirmation • PDF invoice • Demo payment</p></aside>
    </div>
  </section>;
}

function Login() {
  const { login } = useAuth(); const nav=useNavigate(); const [mode,setMode]=useState("login"); const [form,setForm]=useState({name:"",email:"",password:"",phone:""}); const [loading,setLoading]=useState(false);
  const submit=async e=>{e.preventDefault();setLoading(true);try{const data=await api.post(`/auth/${mode==="login"?"login":"register"}`,form);login(data);nav("/dashboard")}catch(e){alert(e.message)}finally{setLoading(false)}};
  return <section className="auth-page"><div className="auth-visual"><div className="auth-copy"><span className="eyebrow"><Crown size={14}/> The premium way to move</span><h1>Luxury is a <em>state of mind.</em></h1><p>Book exceptional cars with intelligent recommendations, transparent pricing and a digital-first experience.</p><div className="auth-points"><span><ShieldCheck/> Verified vehicles</span><span><Sparkles/> AI concierge</span><span><CreditCard/> Secure checkout</span></div></div></div>
    <div className="auth-panel"><div className="auth-brand"><span className="brand-mark"><CarFront/></span><span>Drive<span>Lux</span></span></div><div className="auth-form"><span className="eyebrow">{mode==="login"?"Welcome back":"Create your account"}</span><h2>{mode==="login"?"Sign in to DriveLux":"Start your DriveLux journey"}</h2><p>{mode==="login"?"Access bookings, invoices and loyalty rewards.":"Your premium mobility account is one minute away."}</p><form onSubmit={submit}>{mode==="register"&&<input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>}<input type="email" placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><input type="password" placeholder="Password" minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>{mode==="register"&&<input placeholder="Phone (optional)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>}<button className="btn primary wide">{loading?"Please wait…":mode==="login"?"Sign in":"Create account"} <ArrowRight size={17}/></button></form><button className="switch-auth" onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"New here? Create an account":"Already have an account? Sign in"}</button></div></div></section>;
}

function Register(){ return <Login/>; }

function Dashboard() {
  const {user,logout}=useAuth();
  const [bookings,setBookings]=useState([]);
  const [data,setData]=useState(null);
  const [kyc,setKyc]=useState(user?.kycStatus || "pending");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  const loadDashboard = async () => {
    setLoading(true); setError("");
    try {
      const [b,d] = await Promise.all([api.get("/bookings/mine"), api.get("/features/dashboard")]);
      setBookings(Array.isArray(b) ? b : []);
      setData(d || null);
      setKyc(d?.kyc || user?.kycStatus || "pending");
    } catch(e) {
      if (/Authentication|token|expired/i.test(e.message)) logout();
      setError(e.message || "Could not load dashboard.");
    } finally { setLoading(false); }
  };

  useEffect(()=>{ loadDashboard(); },[]);

  const verify = async () => {
    try {
      const d=await api.post("/features/kyc",{});
      setKyc(d.status);
      setData(prev=>({...prev,kyc:d.status}));
    } catch(e) { setError(e.message); }
  };

  if (loading) return <section className="section"><div className="center-loader">Loading dashboard…</div></section>;

  return <section className="section dashboard">
    <div className="dash-head">
      <div><span className="eyebrow">Your DriveLux</span><h1>Welcome, <em>{user?.name?.split(" ")[0] || "Driver"}.</em></h1></div>
      <button className="btn ghost" onClick={logout}><LogOut size={16}/> Sign out</button>
    </div>
    {error && <div className="error-banner">{error}<button onClick={loadDashboard}>Retry</button></div>}

    <div className="dashboard-grid">
      <div className="stat-card loyalty"><div className="stat-icon"><Crown/></div><small>Loyalty tier</small><h2>{data?.loyalty?.tier||"Silver"}</h2><div className="progress"><span style={{width:`${Math.min(100,((data?.loyalty?.points||0)/(data?.loyalty?.nextTierAt||1000))*100)}%`}}/></div><span>{data?.loyalty?.points||0} points • next tier at {data?.loyalty?.nextTierAt||1000}</span></div>
      <div className="stat-card"><div className="stat-icon"><Gift/></div><small>Referral code</small><h2>{data?.referral?.code||"DL-XXXXXX"}</h2><span>Earn ₹{data?.referral?.reward||500} for each eligible referral.</span></div>
      <div className="stat-card"><div className="stat-icon"><KeyRound/></div><small>Keyless entry</small><h2>{data?.keyless?.enabled?"Ready":"Standby"}</h2><span>{data?.keyless?.message||"Available during an eligible rental."}</span></div>
      <div className="stat-card"><div className="stat-icon"><MapPinned/></div><small>Vehicle telemetry</small><h2>{data?.tracking?.battery??84}% battery</h2><span>{data?.tracking?.location||"Pickup hub"} • fuel {data?.tracking?.fuel??72}%</span></div>
    </div>

    <div className="dashboard-grid mini-stats">
      <div className="stat-card"><small>Total bookings</small><h2>{data?.stats?.bookings||0}</h2></div>
      <div className="stat-card"><small>Total paid</small><h2>₹{Number(data?.stats?.spent||0).toLocaleString("en-IN")}</h2></div>
    </div>

    <div className="dash-columns">
      <div className="dash-card"><div className="dash-card-head"><h3>Identity verification</h3><span className={`status ${kyc==="verified"?"success":""}`}>{kyc==="verified"?"Verified":"Pending"}</span></div><p>Complete the demo verification flow. Production can be connected to Stripe Identity or Onfido.</p><button className="btn secondary" disabled={kyc==="verified"} onClick={verify}><FileCheck2 size={16}/> {kyc==="verified"?"Verified":"Verify identity"}</button></div>
      <div className="dash-card"><div className="dash-card-head"><h3>Pre-rental damage report</h3><span className="status">Before pickup</span></div><p>Record existing scratches and dents before starting a rental.</p><button className="btn secondary" onClick={()=>alert("Damage-report workflow ready for camera/file upload integration.")}><FileCheck2 size={16}/> Open damage report</button></div>
    </div>

    <div className="dash-card bookings-card">
      <div className="dash-card-head"><h3>My bookings</h3><span>{bookings.length} total</span></div>
      {bookings.length===0 ? <div className="empty"><CarFront size={28}/><h3>No bookings yet</h3><p>Your next premium drive starts here.</p><Link className="btn primary" to="/fleet">Explore fleet</Link></div> :
      <div className="booking-list">{bookings.map(b=><div className="booking-row" key={b._id}>
        <SafeCarImage src={b.vehicle?.image} alt={b.vehicle?.name}/>
        <div><small>{b.bookingCode} • {b.status}</small><h3>{b.vehicle?.brand} {b.vehicle?.name}</h3><span>{b.startDate?new Date(b.startDate).toLocaleDateString():""} → {b.endDate?new Date(b.endDate).toLocaleDateString():""}</span></div>
        <strong>₹{Number(b.pricing?.total||0).toLocaleString("en-IN")}</strong>
        <button className="icon-btn" title="Download invoice" onClick={()=>downloadInvoice(b._id).catch(e=>setError(e.message))}><Download size={17}/></button>
      </div>)}</div>}
    </div>
  </section>;
}

function Experiences() {
  const cards=[["Weddings","Arrive in a car worthy of the occasion.","Mercedes-Maybach GLS 600"],["Corporate","Executive mobility for meetings, teams and roadshows.","Audi RS5 • Volvo XC60"],["Off-Road","Weekend escapes with trail-ready 4x4s.","Thar • Wrangler • Defender"],["Subscription","Keep a premium car for the month.","Flexible monthly plans"]];
  return <section className="section experiences"><div className="page-title"><span className="eyebrow">Beyond rentals</span><h1>Make the journey <em>the story.</em></h1><p>Premium packages designed around the moments that matter.</p></div><div className="experience-grid">{cards.map(([title,desc,cars],i)=><div className="experience-card" key={title}><span>0{i+1}</span><div><h2>{title}</h2><p>{desc}</p><small>{cars}</small></div><ArrowRight/></div>)}</div></section>;
}

function FAQ() {
  const [open,setOpen]=useState(0); const faqs=[["Can I change my pickup location?","Yes. Pickup and drop-off locations are captured at checkout and can be changed before payment."],["Is the payment real?","This project includes a virtual/demo payment flow. No real money is charged."],["How does AI recommendation work?","The current agent uses weighted scoring across passengers, budget, trip type, fuel, style and vehicle rating. It is structured so a real LLM can be connected later."],["Can I download an invoice?","Yes. Every confirmed booking appears in My Bookings with a PDF invoice button."]];
  return <section className="section faq"><div className="section-head"><div><span className="eyebrow">Good to know</span><h2>Questions, <em>answered.</em></h2></div></div><div className="faq-list">{faqs.map(([q,a],i)=><button className={`faq-item ${open===i?"open":""}`} key={q} onClick={()=>setOpen(open===i?-1:i)}><span>{q}</span><span>{open===i?"−":"+"}</span>{open===i&&<p>{a}</p>}</button>)}</div></section>;
}

export default App;
