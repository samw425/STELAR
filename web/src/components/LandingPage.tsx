import { useState, useEffect } from 'react';
import { ChevronDown, Radio } from 'lucide-react';

interface LandingPageProps {
    onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#FF4500]/10 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            {/* Main Content */}
            <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                {/* Logo Mark */}
                <div className="mb-12 flex items-center gap-3 opacity-80">
                    <Radio className="w-6 h-6 text-[#FF4500]" />
                    <span className="text-sm font-bold tracking-[0.3em]">STELAR</span>
                </div>

                {/* Hero Typo */}
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 mix-blend-screen">
                    <span className="block text-white">TRACK THE TOP.</span>
                    <span className="block text-slate-500">DISCOVER THE NEXT.</span>
                </h1>

                {/* Value Props */}
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs md:text-sm font-mono text-slate-400 mb-16 tracking-widest uppercase">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500]"></span>
                        Live Global Rankings
                    </span>
                    <span className="hidden md:inline text-slate-700">•</span>
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        Pre-Viral Signal Detection
                    </span>
                    <span className="hidden md:inline text-slate-700">•</span>
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        3,000+ Verified Artists
                    </span>
                </div>

                {/* Enter Button */}
                <button
                    onClick={onEnter}
                    className="group flex flex-col items-center gap-4 transition-all hover:opacity-80 focus:outline-none"
                    aria-label="Enter Site"
                >
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-all">
                        <ChevronDown className="w-6 h-6 text-white animate-bounce" />
                    </div>
                </button>

                {/* Footer Status */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        System Online • v2.1.0
                    </div>
                </div>
            </div>
        </div>
    );
}
