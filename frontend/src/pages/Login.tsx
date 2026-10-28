import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Sparkles, ArrowRight, AlertCircle, Waves } from 'lucide-react';

// Chroma Waves: Soft waves of light with moving motion and chromatic shimmer
const ChromaWavesCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse refraction
    let mouse = { x: width / 2, y: height / 2, active: false };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    // Wave configurations with chromatic spectra (shimmer offsets)
    const waveLayers = [
      // 1. Radiant Amber & Tangerine Shimmer Wave
      {
        baseYRatio: 0.52,
        amplitude: 55,
        wavelength: 0.0032,
        speed: 0.012,
        phase: 0,
        color1: 'rgba(249, 115, 22, 0.16)',
        color2: 'rgba(251, 146, 60, 0.02)',
        shimmerColor: 'rgba(251, 191, 36, 0.45)',
        lineWidth: 2.2,
      },
      // 2. Prismatic Rose & Coral Light Wave
      {
        baseYRatio: 0.48,
        amplitude: 65,
        wavelength: 0.0024,
        speed: -0.009,
        phase: 1.8,
        color1: 'rgba(244, 114, 182, 0.14)',
        color2: 'rgba(253, 164, 175, 0.02)',
        shimmerColor: 'rgba(244, 63, 94, 0.40)',
        lineWidth: 1.8,
      },
      // 3. Chromatic Aqua & Soft Teal Dispersion Wave
      {
        baseYRatio: 0.58,
        amplitude: 70,
        wavelength: 0.0028,
        speed: 0.007,
        phase: 3.2,
        color1: 'rgba(45, 212, 191, 0.13)',
        color2: 'rgba(56, 189, 248, 0.02)',
        shimmerColor: 'rgba(20, 184, 166, 0.38)',
        lineWidth: 1.6,
      },
      // 4. Ethereal Violet & Lavender Shimmer Wave
      {
        baseYRatio: 0.42,
        amplitude: 50,
        wavelength: 0.0038,
        speed: -0.014,
        phase: 4.5,
        color1: 'rgba(168, 85, 247, 0.11)',
        color2: 'rgba(192, 132, 252, 0.01)',
        shimmerColor: 'rgba(216, 180, 254, 0.45)',
        lineWidth: 1.5,
      },
      // 5. Warm Golden Milk Light Stream
      {
        baseYRatio: 0.55,
        amplitude: 45,
        wavelength: 0.0042,
        speed: 0.011,
        phase: 0.9,
        color1: 'rgba(254, 215, 170, 0.22)',
        color2: 'rgba(254, 243, 199, 0.01)',
        shimmerColor: 'rgba(255, 255, 255, 0.65)',
        lineWidth: 2.0,
      },
    ];

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      // Draw each chromatic wave ribbon
      waveLayers.forEach((w) => {
        const baseY = height * w.baseYRatio;
        const currentPhase = w.phase + time * w.speed;

        // Path for the filled light curtain
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 4) {
          // Double harmonic harmonic wave
          let y =
            baseY +
            Math.sin(x * w.wavelength + currentPhase) * w.amplitude +
            Math.cos(x * w.wavelength * 0.65 - currentPhase * 0.8) * (w.amplitude * 0.45);

          // Subtle chromatic mouse refraction
          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 220) {
              const repel = (1 - dist / 220) * 35;
              y += Math.sin(dist * 0.05 - time * 0.05) * repel;
            }
          }

          if (x === 0) {
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Soft chromatic gradient underneath wave
        const gradient = ctx.createLinearGradient(0, baseY - w.amplitude, 0, height);
        gradient.addColorStop(0, w.color1);
        gradient.addColorStop(1, w.color2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Shimmering Crest Line (The Chromatic Light Beam)
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          let y =
            baseY +
            Math.sin(x * w.wavelength + currentPhase) * w.amplitude +
            Math.cos(x * w.wavelength * 0.65 - currentPhase * 0.8) * (w.amplitude * 0.45);

          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 220) {
              const repel = (1 - dist / 220) * 35;
              y += Math.sin(dist * 0.05 - time * 0.05) * repel;
            }
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = w.shimmerColor;
        ctx.lineWidth = w.lineWidth;
        ctx.shadowColor = w.shimmerColor;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90"
      style={{ filter: 'blur(0.4px)' }}
    />
  );
};

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (['super_admin', 'operations_admin', 'reporting_admin'].includes(user.role)) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Polaris@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#FFF8EE] to-[#FFF1DE] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 relative select-none overflow-hidden">
      {/* Chroma Waves: Moving soft waves of light with chromatic shimmer */}
      <ChromaWavesCanvas />

      {/* Decorative Warm Milk & Soft Orange Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-orange-400/25 via-amber-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Box */}
      <div className="w-full max-w-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="relative">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-60 blur-lg animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-500 text-white shadow-2xl shadow-orange-500/40">
                <Shield className="h-9 w-9" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950">
            POLARISE TELECOM TECHNOLOGY
          </h1>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-orange-600">
            POLARIS EDUCATIONAL CONSULTANCY
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 rounded-full border border-orange-300/80 bg-orange-50/90 px-3.5 py-1 text-[11px] font-black text-orange-800 shadow-sm">
            <Waves className="h-3.5 w-3.5 text-orange-600" />
            <span>POLARIS CLOUD TELEPHONY & CRM GATEWAY</span>
          </div>
        </div>

        {/* Error Alert Notice */}
        {error && (
          <div className="mb-5 flex items-start space-x-3 rounded-2xl border-2 border-rose-400 bg-rose-50 p-4 text-xs font-black text-rose-800 shadow-md animate-in fade-in zoom-in-95">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {/* Milk Card Container with Bold Orange Accents */}
        <div className="rounded-3xl border-2 border-orange-200/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(234,88,12,0.22)]">
          <div className="text-center pb-4 border-b border-orange-100 mb-6">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
              OPERATOR & ADMIN LOGIN
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              Enter your corporate credentials or select a one-click terminal below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                STAFF CORPORATE EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin1@polarisedu.in or emp01@polarisedu.in"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-[#FFFDF9] py-3 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                SECURITY PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border-2 border-slate-200 bg-[#FFFDF9] py-3 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-orange-500/35 active:scale-[0.98] disabled:opacity-50 transition border-b-4 border-orange-700"
            >
              <span>{loading ? 'AUTHENTICATING STATION...' : 'SIGN IN TO STATION'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-7 pt-5 border-t-2 border-orange-100">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 mb-3">
              <span className="flex items-center space-x-1.5 text-orange-600">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="uppercase tracking-wider">FAST DEMO TERMINAL SWITCHER</span>
              </span>
              <span className="text-[10px] font-mono font-black text-orange-800 bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-300">
                PASSWORD: Polaris@2026
              </span>
            </div>

            {/* Administrators */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-teal-900">
                ADMINISTRATORS (3 ACCOUNTS):
              </div>
              <span className="text-[9px] font-bold text-teal-700 uppercase">3 Portals</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <button
                type="button"
                onClick={() => selectDemoAccount('admin1@polarisedu.in')}
                className="rounded-xl border-2 border-teal-300 bg-teal-50/70 hover:bg-teal-100/90 hover:border-teal-600 py-2 px-1 text-[11px] font-black text-teal-950 transition truncate text-center shadow-sm"
              >
                SUPER ADMIN
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount('admin2@polarisedu.in')}
                className="rounded-xl border-2 border-teal-300 bg-teal-50/70 hover:bg-teal-100/90 hover:border-teal-600 py-2 px-1 text-[11px] font-black text-teal-950 transition truncate text-center shadow-sm"
              >
                OPERATIONS ADMIN
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount('admin3@polarisedu.in')}
                className="rounded-xl border-2 border-teal-300 bg-teal-50/70 hover:bg-teal-100/90 hover:border-teal-600 py-2 px-1 text-[11px] font-black text-teal-950 transition truncate text-center shadow-sm"
              >
                REPORTING ADMIN
              </button>
            </div>

            {/* Telecalling Counselors */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-pink-900">
                TELECALLING COUNSELORS (10 ACCOUNTS):
              </div>
              <span className="text-[9px] font-bold text-sky-700 uppercase">10 Staff Lines</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const pad = num < 10 ? `0${num}` : `${num}`;
                const isPink = num % 2 !== 0;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => selectDemoAccount(`emp${pad}@polarisedu.in`)}
                    className={`rounded-xl border-2 py-1.5 text-[10px] font-black transition text-center shadow-sm ${
                      isPink
                        ? 'border-pink-300 bg-pink-50/80 text-pink-900 hover:bg-pink-100 hover:border-pink-500'
                        : 'border-sky-300 bg-sky-50/80 text-sky-900 hover:bg-sky-100 hover:border-sky-500'
                    }`}
                  >
                    EMP {pad}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center mt-5 text-[11px] font-black uppercase tracking-wider text-slate-400">
          CONFIDENTIAL • POLARIS EDUCATIONAL CONSULTANCY TELEPHONY GATEWAY
        </div>
      </div>
    </div>
  );
};
