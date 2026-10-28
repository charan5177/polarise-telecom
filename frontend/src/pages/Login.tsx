import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Sparkles, ArrowRight, AlertCircle, Compass } from 'lucide-react';

// 3D Antigravity Interactive Canvas Component
const AntigravityCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse antigravity deflector vector
    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // 3D Antigravity Floating Nodes
    interface Node3D {
      x: number;
      y: number;
      z: number;
      radius: number;
      vx: number;
      vy: number;
      vz: number;
      color: string;
      alpha: number;
    }

    const nodeCount = 65;
    const nodes: Node3D[] = [];
    const colors = [
      'rgba(249, 115, 22, ',   // Orange
      'rgba(234, 88, 12, ',    // Deep Orange
      'rgba(251, 146, 60, ',   // Amber/Orange
      'rgba(254, 215, 170, ',  // Cream Warm Milk
      'rgba(20, 184, 166, ',   // Teal accent
      'rgba(244, 114, 182, ',  // Pastel Pink accent
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: Math.random() * height,
        z: Math.random() * 800 + 100, // 3D depth
        radius: Math.random() * 3 + 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.8 + 0.3), // Negative vy = Anti-gravity upward buoyancy
        vz: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.3,
      });
    }

    // 3D Levitating Wireframe Ring / Polyhedron Angles
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotX += 0.003;
      rotY += 0.004;
      rotZ += 0.002;

      const fov = 400; // 3D field of view
      const cx = width / 2;
      const cy = height / 2;

      // Draw 3D Floating Gyroscopic Rings (Antigravity Centerpiece)
      const ringRadius = Math.min(width, height) * 0.32;
      const ringPoints = 32;

      // Outer Levitating Antigravity Ring
      ctx.beginPath();
      for (let i = 0; i <= ringPoints; i++) {
        const theta = (i / ringPoints) * Math.PI * 2;
        // 3D coordinate on rotated ring
        let rx = ringRadius * Math.cos(theta);
        let ry = ringRadius * Math.sin(theta);
        let rz = 0;

        // Apply 3D Rotation matrices
        // Rotate around X
        let y1 = ry * Math.cos(rotX) - rz * Math.sin(rotX);
        let z1 = ry * Math.sin(rotX) + rz * Math.cos(rotX);
        // Rotate around Y
        let x2 = rx * Math.cos(rotY) + z1 * Math.sin(rotY);
        let z2 = -rx * Math.sin(rotY) + z1 * Math.cos(rotY);

        const depth = z2 + 650;
        const scale = fov / depth;
        const screenX = cx + x2 * scale;
        const screenY = cy + y1 * scale;

        if (i === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Counter-Rotating Antigravity Ring
      ctx.beginPath();
      const innerRadius = ringRadius * 0.72;
      for (let i = 0; i <= ringPoints; i++) {
        const theta = (i / ringPoints) * Math.PI * 2;
        let rx = innerRadius * Math.cos(theta);
        let ry = innerRadius * Math.sin(theta);
        let rz = 0;

        // Rotate opposite
        let y1 = ry * Math.cos(-rotX * 1.3) - rz * Math.sin(-rotX * 1.3);
        let z1 = ry * Math.sin(-rotX * 1.3) + rz * Math.cos(-rotX * 1.3);
        let x2 = rx * Math.cos(rotZ * 1.5) + z1 * Math.sin(rotZ * 1.5);
        let z2 = -rx * Math.sin(rotZ * 1.5) + z1 * Math.cos(rotZ * 1.5);

        const depth = z2 + 650;
        const scale = fov / depth;
        const screenX = cx + x2 * scale;
        const screenY = cy + y1 * scale;

        if (i === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Render 3D Antigravity Rising Nodes
      const projectedNodes: { sx: number; sy: number; scale: number; node: Node3D }[] = [];

      nodes.forEach((node) => {
        // Anti-gravity upward buoyancy movement
        node.y += node.vy;
        node.x += node.vx;
        node.z += node.vz;

        // Interactive mouse deflection (Zero-G repulsion)
        if (mouse.active) {
          const scale = fov / (fov + node.z);
          const sx = cx + node.x * scale;
          const sy = cy + node.y * scale;
          const dx = sx - mouse.x;
          const dy = sy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 0) {
            const force = (180 - dist) / 180;
            node.vx += (dx / dist) * force * 0.35;
            node.vy += (dy / dist) * force * 0.35;
          }
        }

        // Friction dampening
        node.vx *= 0.98;
        node.vy = Math.min(-0.25, node.vy * 0.99);

        // Respawn when rising off-screen (Anti-gravity cycle)
        if (node.y < -height * 0.7) {
          node.y = height * 0.7;
          node.x = (Math.random() - 0.5) * width * 1.4;
          node.z = Math.random() * 800 + 100;
        }

        const scale = fov / (fov + node.z);
        const sx = cx + node.x * scale;
        const sy = cy + node.y * scale;

        projectedNodes.push({ sx, sy, scale, node });
      });

      // Draw Constellation Connections between close 3D nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes[j];
          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.22 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.strokeStyle = `rgba(249, 115, 22, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw Nodes with luminous halo
      projectedNodes.forEach(({ sx, sy, scale, node }) => {
        const radius = Math.max(1.2, node.radius * scale);
        
        // Soft outer glow
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 3.5);
        glow.addColorStop(0, `${node.color}${node.alpha * scale})`);
        glow.addColorStop(1, `${node.color}0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Solid core
        ctx.fillStyle = `${node.color}${node.alpha + 0.2})`;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.15))' }}
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
      {/* 3D Antigravity Interactive Background Canvas */}
      <AntigravityCanvas />

      {/* Decorative Warm Milk & Soft Orange Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-orange-400/25 via-amber-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Box (Orange & Milk Theme + Antigravity Levitating Aesthetics) */}
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
            <Compass className="h-3.5 w-3.5 text-orange-600 animate-spin" />
            <span>ANTIGRAVITY TELEPHONY & CLOUD CRM STATION</span>
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

            {/* Administrators - Luxury Mint Green & Teal Blue Palette */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                ADMINISTRATORS (MINT & TEAL LUXURY):
              </div>
              <span className="text-[9px] font-bold text-teal-600 uppercase">3 Portals</span>
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

            {/* Counselors - Pastel Pink & Pastel Blue Palette */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-pink-700">
                COUNSELORS (PASTEL PINK & BLUE PALETTE):
              </div>
              <span className="text-[9px] font-bold text-sky-600 uppercase">10 Staff Lines</span>
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
