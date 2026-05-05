import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'motion/react';
import { useRef, createContext, useContext, useState, useEffect } from 'react';
import { Bone, Heart, ArrowDown, ArrowRight, Volume2, VolumeX } from 'lucide-react';

const SoundContext = createContext({ 
  enabled: false, 
  toggle: () => {}, 
  playBark: () => {}, 
  playJingle: () => {} 
});

function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [sounds, setSounds] = useState<{bark: HTMLAudioElement | null, jingle: HTMLAudioElement | null}>({ bark: null, jingle: null });

  useEffect(() => {
    const bark = new Audio("https://cdn.freesound.org/previews/138/138131_2375824-lq.mp3");
    bark.volume = 0.2;
    const jingle = new Audio("https://cdn.freesound.org/previews/264/264762_4513735-lq.mp3");
    jingle.volume = 0.1;
    setSounds({ bark, jingle });
  }, []);

  const toggle = () => {
    setEnabled(!enabled);
    if (!enabled && sounds.bark) {
      sounds.bark.currentTime = 0;
      sounds.bark.play().catch(e => console.log("Audio unlock failed:", e));
    }
  };

  const playBark = () => {
    if (!enabled || !sounds.bark) return;
    sounds.bark.currentTime = 0;
    sounds.bark.play().catch(() => {});
  };

  const playJingle = () => {
    if (!enabled || !sounds.jingle) return;
    sounds.jingle.currentTime = 0;
    sounds.jingle.play().catch(() => {});
  };

  return (
    <SoundContext.Provider value={{ enabled, toggle, playBark, playJingle }}>
      {children}
      <button 
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 p-4 bg-amber-500 text-stone-900 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
        aria-label="Toggle Sound"
      >
        {enabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>
    </SoundContext.Provider>
  );
}

function ImmersiveStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { playBark } = useContext(SoundContext);
  const [phase, setPhase] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let currentPhase = 0;
    if (latest > 0.2 && latest < 0.45) currentPhase = 1;
    else if (latest >= 0.45 && latest < 0.7) currentPhase = 2;
    else if (latest >= 0.7) currentPhase = 3;

    if (currentPhase !== phase) {
      setPhase(currentPhase);
      if (currentPhase > 0) playBark();
    }
  });

  const scaleImg = useTransform(smoothProgress, [0, 1], [1, 1.2]);

  // Phase opacities and movement (smoother overlaps)
  const op1 = useTransform(smoothProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const y1  = useTransform(smoothProgress, [0, 0.25, 0.35], ["0%", "-5%", "-15%"]);

  const op2 = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [0, 1, 1, 0]);
  const y2  = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], ["15%", "0%", "-5%", "-15%"]);
  const scale2 = useTransform(smoothProgress, [0.25, 0.65], [1.1, 1.05]);

  const op3 = useTransform(smoothProgress, [0.55, 0.65, 0.85, 0.95], [0, 1, 1, 0]);
  const y3  = useTransform(smoothProgress, [0.55, 0.65, 0.85, 0.95], ["15%", "0%", "-5%", "-15%"]);
  const scale3 = useTransform(smoothProgress, [0.55, 0.95], [1.1, 1.05]);

  const op4 = useTransform(smoothProgress, [0.85, 0.95, 1], [0, 1, 1]);
  const y4  = useTransform(smoothProgress, [0.85, 0.95, 1], ["15%", "0%", "0%"]);
  const scale4 = useTransform(smoothProgress, [0.85, 1], [1.1, 1.05]);

  return (
    <div ref={ref} className="h-[300vh] relative bg-stone-950">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden flex flex-col justify-center">

        {/* Floating Parallax Background Layer */}
        <motion.div style={{ y: useTransform(smoothProgress, [0, 1], ["0%", "50%"]) }} className="absolute inset-0 pointer-events-none z-10 flex justify-center items-center">
          <Bone className="w-[120vw] h-[120vw] text-stone-50/5 rotate-12 blur-3xl opacity-50" />
        </motion.div>
        
        <motion.div style={{ y: useTransform(smoothProgress, [0, 1], ["-10vh", "110vh"]), rotate: useTransform(smoothProgress, [0, 1], [0, 180]) }} className="absolute left-[5%] top-[-10%] z-20 pointer-events-none opacity-20">
           <Bone className="w-32 h-32 text-amber-500" />
        </motion.div>

        <motion.div style={{ y: useTransform(smoothProgress, [0, 1], ["100vh", "-30vh"]), rotate: useTransform(smoothProgress, [0, 1], [0, -90]) }} className="absolute right-[10%] bottom-[-20%] z-20 pointer-events-none opacity-20">
           <Heart className="w-40 h-40 text-amber-600" />
        </motion.div>

        <motion.div style={{ y: useTransform(smoothProgress, [0, 1], ["30vh", "-60vh"]), x: useTransform(smoothProgress, [0, 1], ["0vw", "20vw"]), rotate: useTransform(smoothProgress, [0, 1], [45, 135]) }} className="absolute left-[40%] top-[30%] z-20 pointer-events-none opacity-10">
           <Bone className="w-64 h-64 text-stone-100 blur-sm" />
        </motion.div>

        {/* Phase 1: Cucciolo */}
        <motion.div style={{ opacity: op1 }} className="absolute inset-0">
           <motion.img style={{ scale: scaleImg }} src="/1.jpg" className="absolute inset-0 w-full h-full object-cover object-[center_30%]" />
           <div className="absolute inset-0 bg-stone-950/40 mix-blend-multiply"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent"></div>
           <motion.div style={{ y: y1 }} className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
              <span className="text-amber-500 font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase mb-2 md:mb-6 text-xs md:text-sm drop-shadow-xl mt-auto md:mt-0 pt-40 md:pt-0">11 Anni Fa</span>
              <h2 className="text-5xl md:text-[9rem] font-black text-white tracking-tighter leading-[0.85] drop-shadow-2xl">L'Inizio</h2>
              <p className="text-lg md:text-3xl text-stone-200 mt-4 md:mt-8 max-w-2xl font-medium drop-shadow-xl mb-auto md:mb-0">Un batuffolo nero che ci ha rubato il cuore dal primo istante.</p>
           </motion.div>
        </motion.div>

        {/* Phase 2: Esploratore / Neve */}
        <motion.div style={{ opacity: op2 }} className="absolute inset-0 pointer-events-none">
           <motion.img style={{ scale: scale2 }} src="/4.jpg" className="absolute inset-0 w-full h-full object-cover" />
           <div className="absolute inset-0 bg-stone-950/30 mix-blend-multiply"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>
           <motion.div style={{ y: y2 }} className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
              <span className="text-amber-500 font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase mb-2 md:mb-6 text-xs md:text-sm drop-shadow-xl mt-auto md:mt-0 pt-40 md:pt-0">Spirito Libero</span>
              <h2 className="text-5xl md:text-[9rem] font-black text-white tracking-tighter leading-[0.85] drop-shadow-2xl">L'Esploratore</h2>
              <p className="text-lg md:text-3xl text-stone-200 mt-4 md:mt-8 max-w-2xl font-medium drop-shadow-xl mb-auto md:mb-0">Mari, monti, neve. Nessuna avventura lo spaventa.</p>
           </motion.div>
        </motion.div>

        {/* Phase 3: Stazza */}
        <motion.div style={{ opacity: op3 }} className="absolute inset-0 pointer-events-none">
           <motion.img style={{ scale: scale3 }} src="/11.jpg" className="absolute inset-0 w-full h-full object-cover object-[center_30%]" />
           <div className="absolute inset-0 bg-stone-950/40 mix-blend-multiply"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>
           <motion.div style={{ y: y3 }} className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
              <span className="text-amber-500 font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase mb-2 md:mb-6 text-xs md:text-sm drop-shadow-xl mt-auto md:mt-0 pt-40 md:pt-0">32 Kg di Dolcezza</span>
              <h2 className="text-5xl md:text-[9rem] font-black text-white tracking-tighter leading-[0.85] text-center drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">Il Gigante<br/>Buono</h2>
              <p className="text-lg md:text-3xl text-stone-200 mt-4 md:mt-8 max-w-2xl font-medium drop-shadow-xl mb-auto md:mb-0">Stazza da orso, ma si crede ancora minuscolo.</p>
           </motion.div>
        </motion.div>

        {/* Phase 4: Pappina */}
        <motion.div style={{ opacity: op4 }} className="absolute inset-0 pointer-events-none">
           <motion.img style={{ scale: scale4 }} src="/9.jpg" className="absolute inset-0 w-full h-full object-cover object-bottom" />
           <div className="absolute inset-0 bg-stone-950/50 mix-blend-multiply"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent"></div>
           <motion.div style={{ y: y4 }} className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
              <span className="text-amber-500 font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase mb-2 md:mb-6 text-xs md:text-sm drop-shadow-xl mt-auto md:mt-0 pt-40 md:pt-0">La Sua Ossessione</span>
              <h2 className="text-[12vw] md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 tracking-tighter leading-none drop-shadow-[0_0_50px_rgba(245,158,11,0.4)]">Pappina.</h2>
              <p className="text-lg md:text-3xl text-stone-200 mt-4 md:mt-8 max-w-2xl font-medium drop-shadow-xl mb-auto md:mb-0">L'ora del pasto non è mai un optional. Occhioni dolci e sguardi mirati: nessuno resiste.</p>
           </motion.div>
        </motion.div>

      </div>
    </div>
  )
}

function HorizontalGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { playJingle } = useContext(SoundContext);
  const [lastTick, setLastTick] = useState(0);

  const { scrollYProgress } = useScroll({ 
    target: ref,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  });
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const tick = Math.floor(latest * 15);
    if (tick !== lastTick && tick > 0) {
      setLastTick(tick);
      playJingle();
    }
  });

  // x translates the gallery horizontally. "calc(-100% + 100vw)" ensures we slide exactly to the last image.
  const x = useTransform(smoothProgress, [0, 1], ["0%", "calc(-100% + 100vw)"]); 

  // Background parallax layers
  const prlxBg1 = useTransform(smoothProgress, [0, 1], ["-20vh", "30vh"]);
  const prlxBg2 = useTransform(smoothProgress, [0, 1], ["50vh", "-50vh"]);
  const prlxRotate = useTransform(smoothProgress, [0, 1], [0, 360]);

  const images = [
      "/2.jpg",
      "/3.jpg",
      "/5.jpg",
      "/6.jpg",
      "/7.jpg",
      "/8.jpg",
      "/10.jpg",
      "/9d5ce8f5-7fa9-45bd-ae38-da91a0e9f485.jpg",
      "/e22e2d6a-38f6-4a4a-94d6-55de99d1a1a2.jpg"
  ];

  return (
    <div ref={ref} className="h-[250vh] bg-stone-100 relative -mt-[2px]">
      <div className="sticky top-0 h-[100dvh] flex flex-col justify-center overflow-hidden">
        
        {/* Background Parallax for Gallery */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <motion.div style={{ y: prlxBg1, rotate: prlxRotate }} className="absolute top-[10%] left-[5%] opacity-10">
             <Heart className="w-[40vh] h-[40vh] text-stone-400" />
           </motion.div>
           <motion.div style={{ y: prlxBg2, rotate: useTransform(smoothProgress, [0, 1], [45, 180]) }} className="absolute top-[60%] right-[10%] opacity-10">
             <Bone className="w-[50vh] h-[50vh] text-amber-500 blur-sm" />
           </motion.div>
        </div>
        
        <div className="px-6 md:px-20 mb-8 w-full flex justify-between items-end relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-5xl md:text-8xl font-black text-stone-900 tracking-tighter leading-[0.9]">
                I Mille Volti<br/>di <span className="text-amber-600">Nello</span>
              </h2>
            </motion.div>
            <motion.div 
               animate={{ x: [0, 10, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="hidden md:flex items-center gap-4 text-stone-500"
            >
                <span className="text-sm font-bold uppercase tracking-widest hidden lg:block">Scorri per scoprire</span>
                <ArrowRight className="w-12 h-12" />
            </motion.div>
        </div>

        <motion.div style={{ x }} className="flex gap-4 md:gap-12 px-6 md:px-20 w-max items-center relative z-10">
          {images.map((src, i) => (
             <motion.div 
               whileHover={{ scale: 1.05, y: -10, rotateZ: i % 2 === 0 ? 2 : -2 }}
               key={i} 
               className={`w-[80vw] md:w-[45vw] shrink-0 relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 ${i % 2 !== 0 ? 'mt-8 md:mt-12' : ''} ${i % 3 === 0 ? 'aspect-square' : 'aspect-[4/3]'} border-4 border-white grayscale hover:grayscale-0`}
             >
                <img src={src} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-110" alt="Galleria Nello" loading="lazy" />
                <div className="absolute inset-0 bg-stone-900/10 hover:bg-transparent transition-colors duration-500"></div>
             </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5
  });

  const yBg = useTransform(smoothProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(smoothProgress, [0, 1], ["0%", "150%"]);
  const yImg = useTransform(smoothProgress, [0, 1], ["0%", "80%"]);
  const oImg = useTransform(smoothProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-stone-900 border-b-8 border-amber-500 z-10">
      <motion.div style={{ y: yBg }} className="absolute inset-0 opacity-10 pointer-events-none">
         <motion.div 
           animate={{ rotate: 360 }} 
           transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
           className="absolute -top-40 -left-40 origin-center"
          >
            <Bone className="w-[60vw] h-[60vw] text-stone-500 opacity-20" />
         </motion.div>
         {/* Extra parallax elements */}
         <motion.div style={{ y: useTransform(smoothProgress, [0, 1], ["0%", "-300%"]) }} className="absolute bottom-[10%] right-[10%]">
            <Heart className="w-32 h-32 text-amber-500/30 rotate-12 blur-sm" />
         </motion.div>
         <motion.div style={{ y: useTransform(smoothProgress, [0, 1], ["0%", "400%"]) }} className="absolute top-[20%] right-[20%]">
            <Bone className="w-24 h-24 text-stone-400/20 -rotate-45" />
         </motion.div>
      </motion.div>

      <div className="text-center z-10 w-full max-w-5xl flex flex-col items-center">
        <motion.div 
          style={{ y: yImg, opacity: oImg }}
          initial={{ scale: 0, opacity: 0, filter: "blur(20px)", y: 50 }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative mb-6 group flex justify-center mt-10"
        >
          {/* Coda che scodinzola (Wagging tail) */}
          <motion.div
            className="absolute -right-10 bottom-6 origin-bottom-left z-0 text-amber-500 drop-shadow-lg"
            initial={{ rotate: -20 }}
            whileHover={{ rotate: [0, 45, 0, 45, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 22C5 22 2 15 5 10C7 5 13 2 13 2C13 2 16 8 13 15C10 21 5 22 5 22Z" />
            </svg>
          </motion.div>

          {/* Immagine di Nello cut-out */}
          <motion.div 
            whileHover={{ 
              scale: 1.1, 
              rotate: [-5, 5, -5, 5, 0], 
              y: -10 
            }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-amber-500 overflow-hidden shadow-[0_30px_60px_rgba(245,158,11,0.3)] cursor-pointer bg-[#e0dfd5]"
          >
             <img 
               src="/n.png" 
               alt="Nello"
               className="w-full h-full object-cover scale-[1.35] translate-y-4"
             />
          </motion.div>
        </motion.div>

        <motion.div 
          style={{ y: yText }}
          initial={{ y: 150, opacity: 0, filter: "blur(30px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="overflow-hidden"
        >
          <h1 className="text-[22vw] md:text-[16rem] font-black tracking-tighter text-stone-50 mb-2 leading-[0.75] lowercase drop-shadow-xl">
            Nello.
          </h1>
        </motion.div>
        
        <motion.div
          style={{ y: yText }}
          initial={{ scale: 0.9, opacity: 0, filter: "blur(20px)", y: 20 }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
        >
          <p className="text-xl md:text-3xl text-amber-500 font-bold max-w-2xl mx-auto tracking-[0.4em] uppercase mt-4 drop-shadow-md">
             Il Re della Casa
          </p>
        </motion.div>
      </div>
      
      <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 2, duration: 1, ease: "easeOut" }}
         className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-stone-400 z-10"
      >
         <span className="text-[10px] md:text-sm font-bold tracking-[0.4em] uppercase whitespace-nowrap text-stone-500">Scorri per la storia</span>
         <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
           <ArrowDown className="w-6 h-6 text-amber-500" />
         </motion.div>
      </motion.div>
    </section>
  );
}

function FeedNelloGame() {
  const [feeds, setFeeds] = useState(0);
  const [isEating, setIsEating] = useState(false);

  const handleFeed = () => {
    setFeeds(f => f + 1);
    setIsEating(true);
    setTimeout(() => setIsEating(false), 1000);
  };

  return (
    <section className="bg-stone-950 py-32 px-6 flex flex-col items-center justify-center relative overflow-hidden z-30 font-sans">
      {/* Modern abstract glowing background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
           <h2 className="text-4xl md:text-[5rem] leading-[1.1] font-black text-transparent bg-clip-text bg-gradient-to-br from-stone-100 to-stone-500 tracking-tighter mb-4">
              Interactive <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Pappina Experience</span>
           </h2>
           <p className="text-stone-400 text-lg md:text-xl font-medium tracking-wide">
             Nutrire l'ego (e lo stomaco) del re.
           </p>
        </motion.div>
        
        <motion.div 
           className="relative backdrop-blur-2xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col items-center w-full max-w-lg"
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
        >
           <div className="relative w-56 h-56 md:w-64 md:h-64 mb-10">
              {/* Glowing ring behind image */}
              <div className={`absolute inset-[-10px] rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 blur-xl opacity-30 transition-all duration-500 ${isEating ? 'opacity-80 scale-110' : ''}`} />
              
              <motion.div
                animate={isEating ? { scale: [1, 1.15, 0.95, 1.05, 1], rotate: [0, -8, 8, -4, 0], y: [0, -15, 0] } : { y: [0, -8, 0] }}
                transition={{ duration: isEating ? 0.8 : 4, repeat: isEating ? 0 : Infinity, ease: "easeInOut" }}
                className="w-full h-full rounded-[2rem] md:rounded-full border border-white/20 bg-stone-900 overflow-hidden relative z-10 shadow-inner"
              >
                <img src="/n.png" className="w-full h-full object-cover scale-[1.3] translate-y-6 brightness-110" alt="Nello attende la pappina" />
              </motion.div>
              
              {isEating && (
                 <motion.div
                   initial={{ opacity: 0, y: 0, scale: 0.5 }}
                   animate={{ opacity: [0, 1, 0], y: -120, scale: 2 }}
                   transition={{ duration: 1, ease: "easeOut" }}
                   className="absolute top-1/4 left-1/2 -translate-x-1/2 text-5xl drop-shadow-[0_0_20px_rgba(255,165,0,0.8)] z-20"
                 >
                   🦴
                 </motion.div>
              )}
           </div>

           <div className="text-center w-full">
             <div className="flex justify-between items-center mb-8 px-5 py-4 rounded-2xl bg-stone-950/60 border border-white/5 shadow-inner">
                <span className="text-stone-400 font-mono text-sm uppercase tracking-widest font-semibold">Pappine Erogate</span>
                <span className="text-3xl font-black text-amber-500 font-mono drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{feeds}</span>
             </div>
             
             <button 
               onClick={handleFeed}
               disabled={isEating}
               className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 disabled:opacity-50 disabled:grayscale px-8 py-5 rounded-2xl font-black text-xl md:text-2xl transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-3"
             >
               <Bone className={`w-6 h-6 ${isEating ? 'animate-spin' : ''}`} />
               {isEating ? 'Gnam...' : 'Dai la Pappina'}
             </button>
           </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <SoundProvider>
      <MainApp />
    </SoundProvider>
  );
}

function MainApp() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-stone-50 text-stone-900 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-amber-500 origin-left z-50 rounded-r-full"
        style={{ scaleX }}
      />

      {/* Hero */}
      <Hero />

      {/* Immersive Scroll Section replacing basic sections */}
      <ImmersiveStory />

      {/* Spectacular Horizontal Gallery */}
      <HorizontalGallery />

      {/* Feed Nello Game Section */}
      <FeedNelloGame />

      {/* Minimalist Footer */}
      <footer className="bg-stone-950 text-stone-500 py-32 px-6 border-t border-stone-900 relative z-20">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 text-center">
           <motion.div
             initial={{ opacity: 0, scale: 0.5 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1, type: "spring" }}
           >
             <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.8, type: "spring" }} className="p-6 rounded-full bg-stone-900 cursor-pointer shadow-xl">
               <Bone className="w-12 h-12 text-stone-100" />
             </motion.div>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.2 }}
           >
             <p className="text-2xl md:text-5xl font-black flex flex-wrap justify-center items-center gap-4 text-stone-100 tracking-tighter">
               Fatto con <Heart className="w-8 h-8 md:w-12 md:h-12 text-rose-500 fill-rose-500 animate-pulse" /> per Nello.
             </p>
             <p className="mt-8 text-sm uppercase tracking-[0.4em] font-medium text-stone-600">
                11 Anni &bull; 32 Kg &bull; 100% Pappina
             </p>
           </motion.div>
        </div>
      </footer>
    </div>
  );
}
