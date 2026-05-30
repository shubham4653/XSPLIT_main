"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Star,
  Heart,
  SplitSquareHorizontal,
  ChevronDown,
  Zap,
  Users,
  Shield,
  BarChart3,
  Link2,
  History,
  Smartphone,
  Brain,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Brand Logo
───────────────────────────────────────────── */
const BrandLogo = ({ className }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.15"/>
    <path d="M12 10C10 10 8 11 8 13V19C8 21 10 22 12 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 10C22 10 24 11 24 13V19C24 21 22 22 20 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="8" x2="16" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

/* ─────────────────────────────────────────────
   Feature data — only uses defined pastel colors
───────────────────────────────────────────── */
const verticalFeatures = [
  {
    id: 0,
    iconEl: <Zap className="w-5 h-5" />,
    tag: "CORE",
    tagClass: "bg-mint-200 text-stone-800",
    headline: "Split any bill in under 2 seconds.",
    body: "Enter the amount, choose who paid, and done. XSPLIT calculates the fairest split instantly so you never have to think about it.",
    image: "/images/feature_split.png",
    accent: "#a8f0c8",
    stat: "₹0 in awkward debt",
    statDot: "bg-mint-300",
  },
  {
    id: 1,
    iconEl: <Brain className="w-5 h-5" />,
    tag: "ALGORITHM",
    tagClass: "bg-peach-200 text-stone-800",
    headline: "Our greedy engine cuts transactions to the minimum.",
    body: "Instead of a messy web of payments, our algorithm reduces the total number of transactions — sometimes 10 down to just 2.",
    image: "/images/illus_algorithm.png",
    accent: "#ffc9a8",
    stat: "Up to 80% fewer payments",
    statDot: "bg-peach-300",
  },
  {
    id: 2,
    iconEl: <Users className="w-5 h-5" />,
    tag: "GROUPS",
    tagClass: "bg-sky-200 text-stone-800",
    headline: "Create a group. Share a link. Done.",
    body: "Invite anyone with a one-click shareable link. XSPLIT also remembers past collaborators so you can add them again instantly.",
    image: "/images/illus_invite.png",
    accent: "#addeff",
    stat: "Up to 20 people per group",
    statDot: "bg-sky-300",
  },
  {
    id: 3,
    iconEl: <Smartphone className="w-5 h-5" />,
    tag: "PAYMENTS",
    tagClass: "bg-blush-200 text-stone-800",
    headline: "Pay directly with UPI. No chasing needed.",
    body: "Store your UPI ID once. XSPLIT surfaces it at settlement time so payers can send ₹ instantly without any back-and-forth.",
    image: "/images/illus_upi.png",
    accent: "#ffc9d9",
    stat: "Works with all UPI apps",
    statDot: "bg-blush-300",
  },
];

const horizontalFeatures = [
  {
    id: 4,
    iconEl: <Shield className="w-5 h-5" />,
    tag: "SECURITY",
    tagClass: "bg-blush-200 text-stone-800",
    headline: "Your ₹ data is encrypted. Always.",
    body: "UPI IDs are encrypted with AES-256-CBC before touching the database. Even in a worst-case breach, your financial details are completely unreadable.",
    image: "/images/feature_security.png",
    accent: "#ffc9d9",
  },
  {
    id: 5,
    iconEl: <BarChart3 className="w-5 h-5" />,
    tag: "INSIGHTS",
    tagClass: "bg-sky-200 text-stone-800",
    headline: "See who owes what at a glance.",
    body: "A real-time dashboard shows group balances, settlement history, and who still needs to pay — all beautifully visualised.",
    image: "/images/illus_dashboard.png",
    accent: "#c7e7ff",
  },
  {
    id: 6,
    iconEl: <History className="w-5 h-5" />,
    tag: "HISTORY",
    tagClass: "bg-peach-200 text-stone-800",
    headline: "Every ₹ tracked. Forever.",
    body: "Full transaction history with timestamps. Never argue about who paid for dinner three weeks ago again.",
    image: "/images/illus_history.png",
    accent: "#ffd9c0",
  },
  {
    id: 7,
    iconEl: <Link2 className="w-5 h-5" />,
    tag: "SMART",
    tagClass: "bg-mint-200 text-stone-800",
    headline: "One tap to add past collaborators.",
    body: "XSPLIT remembers everyone you have shared expenses with. When you make a new group, your past collaborators appear first for one-tap adding.",
    image: "/images/illus_settlement.png",
    accent: "#c3f4d9",
  },
];

const testimonials = [
  { name: "Priya Sharma", role: "College Student", avatar: "P", avatarClass: "bg-mint-200 text-stone-800", text: "XSPLIT completely changed how our friend group handles money. No more awkward conversations!" },
  { name: "Rohit Mehra", role: "Frequent Traveler", avatar: "R", avatarClass: "bg-sky-200 text-stone-800", text: "8 people, 200+ transactions across Rajasthan. Settled in just 4 payments at the end. Insane." },
  { name: "Anika Joshi", role: "Software Engineer", avatar: "A", avatarClass: "bg-blush-200 text-stone-800", text: "Knowing my UPI ID is AES-encrypted before hitting the database gives me peace of mind." },
  { name: "Dev Kapoor", role: "Working Professional", avatar: "D", avatarClass: "bg-peach-200 text-stone-800", text: "The greedy algorithm is genius. It cut our group of 6 from 15 transactions down to just 3." },
];

/* ─────────────────────────────────────────────
   Vertical sticky scroll — features 1–4
───────────────────────────────────────────── */
function VerticalScrollSection({ items }) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(Math.floor(v * items.length), items.length - 1);
    setActive(idx);
  });

  const f = items[active];

  return (
    <section
      ref={containerRef}
      style={{ height: `${items.length * 100}vh` }}
      className="relative w-full"
    >
      <div className="sticky top-0 h-[100svh] w-full flex items-center justify-center overflow-hidden bg-stone-100 pt-20 sm:pt-24 lg:pt-0">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse 55% 60% at 65% 50%, ${f.accent}55 0%, transparent 70%)`,
          }}
        />

        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-16">

            {/* LEFT: Text */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col justify-center">
              {/* Progress dots */}
              <div className="flex gap-2 mb-4 sm:mb-6">
                {items.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: i === active ? 24 : 8,
                      height: 8,
                      background: i === active ? "#242220" : "#d1cfc8",
                    }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Tag pill */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4 ${f.tagClass}`}>
                    {f.iconEl} {f.tag}
                  </span>

                  {/* Headline */}
                  <h2 className="font-serif font-bold text-stone-900 text-[1.7rem] leading-[1.1] sm:text-4xl lg:text-5xl mb-3 sm:mb-4 tracking-tight">
                    {f.headline}
                  </h2>

                  {/* Body */}
                  <p className="text-stone-600 text-sm sm:text-lg leading-relaxed mb-5 sm:mb-6 max-w-md">
                    {f.body}
                  </p>

                  {/* Stat */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-white shadow-sm">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${f.statDot}`} />
                    <span className="font-semibold text-stone-800 text-xs sm:text-sm">{f.stat}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 sm:mt-8">
                <Link href="/login" className="btn-elegant py-3 sm:py-3.5 px-6">
                  Try it free <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </div>

            {/* RIGHT: Illustration */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2 flex justify-center mt-2 lg:mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-${active}`}
                  initial={{ opacity: 0, scale: 0.88, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-[260px] sm:max-w-[380px] lg:max-w-[440px]"
                >
                  <div
                    className="absolute inset-0 rounded-3xl blur-3xl opacity-60"
                    style={{ background: f.accent, transform: "scale(0.85) translateY(10%)" }}
                  />
                  <div className="relative rounded-3xl bg-white/70 backdrop-blur-sm border border-stone-100 p-4 sm:p-8 shadow-xl">
                    <img
                      src={f.image}
                      alt={f.tag}
                      className="w-full h-auto object-contain drop-shadow-lg"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right-side scroll progress indicator — hidden on small screens */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5">
          {items.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: 4,
                height: i === active ? 28 : 10,
                background: i === active ? "#242220" : "#eae8e3",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Horizontal scroll — features 5–8
   On mobile: stacked vertically instead
───────────────────────────────────────────── */
function HorizontalScrollSection({ items }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${(items.length - 1) * 100}vw`]);
  const smoothX = useSpring(x, { stiffness: 80, damping: 25 });

  /* ── Mobile: simple vertical cards ── */
  if (isMobile) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-lg mx-auto space-y-12">
          {items.map((feat, i) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-6"
            >
              {/* Illustration */}
              <div className="relative w-full">
                <div
                  className="absolute inset-0 rounded-2xl blur-2xl opacity-40"
                  style={{ background: feat.accent, transform: "scale(0.9) translateY(8%)" }}
                />
                <div className="relative rounded-2xl bg-white border border-stone-100 p-5 shadow-lg">
                  <img src={feat.image} alt={feat.tag} className="w-full max-w-[240px] mx-auto h-auto" />
                </div>
              </div>
              {/* Text */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3 ${feat.tagClass}`}>
                  {feat.iconEl} {feat.tag}
                </span>
                <h3 className="font-serif font-bold text-stone-900 text-2xl leading-[1.15] mb-3">{feat.headline}</h3>
                <p className="text-stone-600 text-base leading-relaxed">{feat.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  /* ── Desktop: horizontal scroll pan ── */
  return (
    <section
      ref={containerRef}
      style={{ height: `${items.length * 100}vh` }}
      className="relative w-full"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        {/* Labels */}
        <div className="absolute top-6 left-6 z-20">
          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-400">More Features</span>
        </div>
        <div className="absolute top-6 right-6 z-20">
          <span className="text-[11px] font-bold tracking-widest uppercase text-stone-400">↔ Scroll to explore</span>
        </div>

        <motion.div style={{ x: smoothX }} className="flex h-full will-change-transform">
          {items.map((feat, i) => (
            <div
              key={feat.id}
              className="flex-shrink-0 w-screen h-screen flex items-center justify-center px-8 md:px-16 lg:px-24"
              style={{ background: i % 2 === 0 ? "#f5f4f1" : "#ffffff" }}
            >
              <div className="max-w-5xl w-full grid grid-cols-2 gap-14 items-center">
                {/* Illustration */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-15%" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex justify-center"
                >
                  <div className="relative w-full max-w-[360px]">
                    <div
                      className="absolute inset-0 rounded-[32px] blur-2xl opacity-50"
                      style={{ background: feat.accent, transform: "scale(0.88) translateY(10%)" }}
                    />
                    <div className="relative rounded-[32px] bg-white border border-stone-100 p-7 shadow-2xl">
                      <img src={feat.image} alt={feat.tag} className="w-full h-auto drop-shadow-md" />
                    </div>
                  </div>
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-15%" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5 ${feat.tagClass}`}>
                    {feat.iconEl} {feat.tag}
                  </span>
                  <h3 className="font-serif font-bold text-stone-900 text-4xl xl:text-5xl leading-[1.1] mb-5">
                    {feat.headline}
                  </h3>
                  <p className="text-stone-600 text-lg leading-relaxed max-w-sm mb-6">
                    {feat.body}
                  </p>
                  {/* Counter */}
                  <div className="flex items-center gap-3">
                    <span className="text-stone-400 font-bold text-sm">{String(i + 1).padStart(2, "0")}</span>
                    <div className="h-px bg-stone-200 w-16" />
                    <span className="text-stone-300 text-sm">{String(items.length).padStart(2, "0")}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, -60]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans">

      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-stone-100/85 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo className="w-7 h-7 sm:w-8 sm:h-8 text-sky-400" />
            <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-stone-900">XSPLIT</span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link href="/login" className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm sm:text-base hidden sm:block">
              Log in
            </Link>
            <Link href="/login" className="btn-elegant text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 text-center pt-24 pb-32 sm:pt-20 sm:pb-32 overflow-hidden"
      >
        {/* Pastel blob backgrounds */}
        <div className="absolute -top-10 -left-24 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-mint-200/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -right-24 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-blush-200/25 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-sky-200/15 rounded-full blur-[100px] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-200/50 border border-sky-300 text-stone-800 text-xs sm:text-sm font-semibold mb-8 sm:mb-10"
          >
            <Heart className="w-3.5 h-3.5 fill-sky-500 text-sky-500 flex-shrink-0" />
            The friendly way to split ₹ expenses in India
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-bold leading-[1.0] tracking-tight text-stone-900 mb-6 sm:mb-8"
            style={{ fontSize: "clamp(2.6rem, 8vw, 7rem)" }}
          >
            Split smarter.<br />
            <span className="relative inline-block">
              <span className="relative z-10 text-blush-400">Not harder.</span>
              <motion.svg
                className="absolute -bottom-2 sm:-bottom-3 left-0 w-full"
                viewBox="0 0 400 14"
                fill="none"
                style={{ overflow: "visible" }}
              >
                <motion.path
                  d="M4 10 C100 3, 300 3, 396 10"
                  stroke="#FFB3C8"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.9, ease: "easeOut" }}
                />
              </motion.svg>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-stone-600 text-base sm:text-xl leading-relaxed mb-10 sm:mb-12 max-w-xl sm:max-w-2xl mx-auto"
          >
            XSPLIT tracks shared ₹ bills, settles debts with a smart greedy algorithm, and keeps everyone happy — no awkward texts required.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center"
          >
            <Link href="/login" className="btn-elegant text-base sm:text-lg px-7 sm:px-9 py-3.5 sm:py-4 w-full sm:w-auto justify-center shadow-blush">
              Start for free <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Link>
            <a href="#features" className="text-stone-500 font-medium hover:text-stone-900 transition-colors flex items-center gap-2 text-base sm:text-lg">
              Explore features <ChevronDown className="w-4 h-4 animate-bounce" />
            </a>
          </motion.div>


        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] sm:text-xs text-stone-400 font-medium tracking-widest uppercase">Scroll to explore</span>
          <div className="w-5 h-8 border-2 border-stone-300 rounded-full flex items-start justify-center p-1">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ─── Features divider ─── */}
      <div id="features" className="py-10 sm:py-14 px-4 sm:px-6 scroll-mt-20 sm:scroll-mt-24">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
            Everything you need<br className="hidden sm:block" /> to split fairly.
          </h2>
          <p className="text-stone-600 text-base sm:text-lg max-w-xs sm:max-w-sm">
            8 powerful features to make shared expenses completely stress-free.
          </p>
        </div>
      </div>

      {/* ─── Vertical scroll section ─── */}
      <VerticalScrollSection items={verticalFeatures} />

      {/* ─── Horizontal section header ─── */}
      <div className="py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-stone-400">More Features</span>
          <div className="flex-1 h-px bg-stone-300 max-w-24" />
        </div>
      </div>

      {/* ─── Horizontal scroll section ─── */}
      <HorizontalScrollSection items={horizontalFeatures} />

      {/* ─── Stats band ─── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="py-16 sm:py-24 px-4 sm:px-6 bg-stone-100 text-stone-900"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-4 sm:gap-6 text-center">
          {[
            { value: "₹0", label: "Hidden fees", icon: "💸" },
            { value: "0", label: "Ads, ever", icon: "✨" },
            { value: "< 2s", label: "Split time", icon: "⚡" },
            { value: "AES", label: "Encryption", icon: "🔒" },
            { value: "20+", label: "Group limit", icon: "👥" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="flex-1 min-w-[140px] max-w-[200px] bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-default"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blush-300 to-mint-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl sm:text-4xl mb-3">{s.icon}</div>
              <div className="font-serif font-bold text-stone-900 mb-2" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1 }}>{s.value}</div>
              <div className="text-stone-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>



      {/* ─── Final CTA ─── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-stone-100 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blush-200/25 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-[260px] sm:w-[400px] h-[260px] sm:h-[400px] bg-mint-200/25 rounded-full blur-[80px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <h2
            className="font-serif font-bold text-stone-900 mb-5 sm:mb-6 leading-tight tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
          >
            Ready to split smarter?
          </h2>
          <p className="text-stone-600 text-base sm:text-xl mb-8 sm:mb-10 leading-relaxed max-w-xl mx-auto">
            Join thousands of Indians who said goodbye to awkward money conversations.
          </p>
          <Link href="/login" className="btn-elegant text-base sm:text-xl px-8 sm:px-10 py-4 sm:py-5 shadow-blush w-full sm:w-auto justify-center">
            Get started — it is free
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-stone-900 text-stone-400 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <BrandLogo className="w-5 h-5 text-sky-400" />
            <span className="font-serif font-bold text-white text-lg">XSPLIT</span>
          </div>
          <p className="text-xs sm:text-sm">© 2026 XSPLITco. All rights reserved. Made with ♥ in India.</p>
          <Link href="/login" className="text-stone-400 hover:text-white transition-colors text-xs sm:text-sm font-medium">
            Sign in →
          </Link>
        </div>
      </footer>
    </div>
  );
}
