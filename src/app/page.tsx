"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useInView } from "@/lib/useInView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import {
  Heart,
  Sparkles,
  Users,
  Calendar,
  MapPin,
  Gift,
  ArrowRight,
  Check,
  Shield,
  Zap,
  Palette,
  Star,
  ChevronDown,
} from "@/components/ui/icons";

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        isInView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 motion-reduce:opacity-100 motion-reduce:translate-y-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-rose-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <span className="text-lg font-semibold text-rose-900 font-serif">
            Wedding Invite
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#templates"
            className="text-sm text-zinc-600 hover:text-rose-600 transition-colors"
          >
            Templates
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-zinc-600 hover:text-rose-600 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#features"
            className="text-sm text-zinc-600 hover:text-rose-600 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-zinc-600 hover:text-rose-600 transition-colors"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="hero relative min-h-screen overflow-hidden bg-linear-to-b from-rose-50 via-white to-rose-50/50">
<div className="hero-left relative z-10 max-w-6xl mx-auto px-6 min-h-screen flex items-center py-16 md:py-20">
        <div className="flex-1 grid lg:grid-cols-2 gap-10 items-center">
          <div>
          <div className="hero-kicker inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 mb-5">
            Vietnam’s #1 online wedding invitation platform
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-rose-900 leading-tight mb-4">
            Beautiful wedding <em>invitations</em><br />in 10 minutes
          </h1>
          <p className="hero-sub text-lg text-zinc-600 max-w-xl mb-8">
            Create stunning wedding invitations online without design skills. Choose a template, fill in details, and share via Zalo.
          </p>
          <div className="hero-actions flex flex-col sm:flex-row items-center gap-4 mb-8">
            <Link href="#templates" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 text-white font-medium text-sm hover:bg-rose-700 transition-colors">
              Create Free Invitation
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <a href="#how-it-works" className="btn-ghost inline-flex items-center gap-2 px-6 py-3 rounded-full border border-rose-200 text-rose-700 font-medium text-sm hover:bg-rose-50 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" /><path d="M6.5 5.5L10.5 8l-4 2.5V5.5z" fill="currentColor" /></svg>
              See How It Works
            </a>
          </div>
          <div className="hero-trust flex items-center gap-4">
            <div className="trust-avatars flex -space-x-2">
              {["HN", "TL", "PA", "MK", "+"].map((item) => (
                <span key={item} className="w-8 h-8 rounded-full border-2 border-white bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center">
                  {item}
                </span>
              ))}
            </div>
            <p className="trust-text text-sm text-zinc-600">
              <strong className="text-rose-700">46,000+</strong> couples trust us
            </p>
          </div>
        </div>

        <div className="hero-right relative">
            <div className="hero-visual relative">
              <div className="phone-frame relative mx-auto h-115 w-65 max-w-full rounded-[2.5rem] border-4 border-zinc-900 bg-zinc-900 shadow-2xl p-1.5">
                <div className="phone-screen relative h-full rounded-4xl bg-linear-to-b from-rose-50 to-white p-3 overflow-hidden flex flex-col">
                <div className="phone-notch mx-auto mb-2 h-4 w-20 rounded-full bg-zinc-900/90" />
                <div className="thiep-preview flex-1 rounded-2xl border border-rose-200 p-5 text-center min-h-35 flex flex-col justify-center" style={{ background: "linear-gradient(135deg,#7a1428,#c4283a)" }}>
                  <div className="thiep-title text-xs tracking-widest mb-2" style={{ color: "#f9e4a0" }}>Trân trọng kính mời</div>
                  <div className="thiep-names font-serif text-2xl leading-tight" style={{ color: "#f9e4a0" }}>
                    Minh Quân<span className="thiep-amp text-sm" style={{ color: "#f9e4a0" }}>{'\u0026'}</span> Thanh Lan
                  </div>
                  <div className="mock-deco w-14 h-px mx-auto my-3" style={{ background: "#f9e4a0" }} />
                  <div className="thiep-date text-xs text-zinc-100">15 · 06 · 2025 · 11:00 SA</div>
                  <div className="thiep-date" style={{ marginTop: "0.3rem", fontSize: ".7rem", color: "rgba(249,228,160,.6)" }}>Diamond Palace – Hà Nội</div>
                </div>
                <div className="phone-info mt-3 w-full bg-white text-xs text-zinc-600 py-4">
                  <div className="phone-info-row flex justify-between py-1">
                    <span>Personal message</span><span className="text-rose-700">Anh Tuấn</span>
                  </div>
                  <div className="phone-info-row flex justify-between py-1">
                    <span>RSVP</span><span className="text-emerald-600">✓ Attending</span>
                  </div>
                  <div className="phone-info-row flex justify-between py-1">
                    <span>Wishes</span><span className="text-rose-700">Just received 12</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card fc-1 absolute -left-6 top-20 px-4 py-3 bg-white rounded-xl border border-rose-100 shadow-lg hidden md:block">
              <div className="fc-label text-xs text-zinc-500">Views today</div>
              <div className="fc-value fc-rose text-lg font-semibold text-rose-600">+247 ↑</div>
            </div>
            <div className="floating-card fc-2 absolute -right-6 bottom-16 px-4 py-3 bg-white rounded-xl border border-rose-100 shadow-lg hidden md:block">
              <div className="fc-label text-xs text-zinc-500">Confirmed</div>
              <div className="fc-value text-lg font-semibold text-rose-800">138 people</div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-rose-400" />
      </div>
    </section>
  );
}

function TrustStrip() {
  const stats = [
    { value: "46,000+", label: "couples created invitations", icon: Heart },
    { value: "120,000+", label: "registrations", icon: Users },
    { value: "340,000+", label: "invitations created", icon: Gift },
    { value: "2.6M+", label: "views", icon: Star },
  ];

  return (
    <section className="py-12 bg-white border-y border-rose-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-rose-600 font-serif">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateShowcase() {
  const templates = [
    {
      id: 1,
      name: "Song Long – Đỏ",
      tags: ["Truyền thống", "Trang trọng"],
      bg: "linear-gradient(135deg, #7a1428 0%, #c4283a 50%, #7a1428 100%)",
      accent: "#f9e4a0",  
      label: "TRUYỀN THỐNG",
      new: false,
    },
    {
      id: 2,
      name: "Thanh Diệp – Xanh",
      tags: ["Thiên nhiên", "Hiện đại"],
      bg: "linear-gradient(135deg, #1a3a2a, #2d6a4a)",
      accent: "#d4e8a0",
      label: "THIÊN NHIÊN",
      new: false,
    },
    {
      id: 3,
      name: "Hoa Lụa – Nâu",
      tags: ["Sang trọng", "Cổ điển"],
      bg: "linear-gradient(135deg, #4a2010, #9b6432)",
      accent: "#fde8c0",
      label: "SANG TRỌNG",
      new: true,
    },
    {
      id: 4,
      name: "Hoàng Kim – Lam",
      tags: ["Hoàng gia", "Trang trọng"],
      bg: "linear-gradient(135deg, #1a2050, #2d3a8c)",
      accent: "#c0d0f9",
      gold: "#c9a96e",
      label: "HOÀNG GIA",
      new: true,
    },
    {
      id: 5,
      name: "Mai Lan – Trắng",
      tags: ["Tối giản", "Tinh tế"],
      bg: "linear-gradient(135deg, #f0e8e0, #e8d8c8)",
      accent: "#6b4a30",
      label: "TỐI GIẢN",
      new: false,
    },
    {
      id: 6,
      name: "Song Phụng – Đỏ",
      tags: ["Truyền thống", "Đỏ"],
      bg: "linear-gradient(135deg, #5a0a20, #8c1430, #5a0a20)",
      accent: "#f9e4a0",
      label: "TRUYỀN THỐNG",
      new: false,
    },
    {
      id: 7,
      name: "Nhật Bình – Tím",
      tags: ["Áo dài", "Phong cách"],
      bg: "linear-gradient(135deg, #2a1a30, #5a2a70)",
      accent: "#e8c8f8",
      gold: "#c9a96e",
      label: "ÁO DÀI",
      new: true,
    },
    {
      id: 8,
      name: "Vườn Xuân – Xanh",
      tags: ["Boho", "Lãng mạn"],
      bg: "linear-gradient(135deg, #2a4020, #3a6030)",
      accent: "#d0e8c0",
      label: "BOHO",
      new: false,
    },
  ];

  return (
    <SectionWrapper id="templates" className="bg-gradient-to-b from-white to-rose-50/30">
      <AnimatedSection>
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Palette className="w-3.5 h-3.5" />
            Templates
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">
            Vietnamese at heart,<br className="hidden md:block" /> modern in spirit
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Dozens of templates designed for Vietnamese wedding culture — from traditional to contemporary.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((t, i) => (
            <div
              key={t.id}
              className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <div className="relative h-full rounded-2xl overflow-hidden bg-white border border-rose-100 shadow-sm active:scale-[0.99] hover:shadow-xl transition-all duration-300">
                {t.new && (
                  <span className="absolute top-3 left-3 z-10 inline-flex px-2 py-0.5 text-xs font-semibold bg-rose-600 text-white rounded-sm">
                    Mới
                  </span>
                )}
                <div
                  className="h-52 flex items-center justify-center relative overflow-hidden"
                  style={{ background: t.bg }}
                >
                  <div className="w-28 h-40 rounded-sm shadow-2xl rotate-[-2deg] flex flex-col items-center justify-center gap-1 p-2 border border-white/20 backdrop-blur-sm bg-black/10">
                    <span className="text-[10px] tracking-widest" style={{ color: t.accent, opacity: 0.8 }}>
                      Kính mời
                    </span>
                    <div className="w-10 h-px" style={{ background: t.gold ?? t.accent, opacity: 0.7 }} />
                    <span className="text-sm font-semibold tracking-wide" style={{ color: t.accent }}>
                      {t.name.split(" – ")[0]}
                    </span>
                    <div className="w-10 h-px" style={{ background: t.gold ?? t.accent, opacity: 0.7 }} />
                    <span className="text-[8px] tracking-widest mt-1" style={{ color: t.accent, opacity: 0.55 }}>
                      {t.label}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-rose-900 mb-2">{t.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/templates">
            <Button size="lg">
              View all templates
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function HowItWorks() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx((i) => (i + 1) % 3);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const steps = [
    {
      number: 1,
      title: "Pick your favorite template",
      description:
        "Browse dozens of multi-style templates. From traditional to modern, all are beautiful.",
    },
    {
      number: 2,
      title: "Enter details & wedding photos",
      description:
        "Add names, date, venue and your couple photo. Your invitation updates instantly.",
    },
    {
      number: 3,
      title: "Share via Zalo, Messenger",
      description:
        "Send the invitation link to all guests. Track who viewed and confirmed attendance.",
    },
  ];

  return (
    <SectionWrapper id="how-it-works" className="bg-rose-50/50">
      <AnimatedSection>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
          <div>
            <div className="mb-8 text-left">
              <span className="inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 mb-4">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 leading-tight mb-3">
                Just 3 steps,<br />
                <em>all done</em>
              </h2>
              <p className="text-zinc-600 max-w-xl">
                No design skills needed, no app to install. Just a browser and 10 minutes.
              </p>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <article
                  key={step.number}
                  className={`rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    index === stepIdx
                      ? "border-rose-300 shadow-md"
                      : "border-rose-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        index === stepIdx
                          ? "bg-rose-600 text-white"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-rose-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-zinc-600">{step.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <Card className="p-6 md:p-8 bg-white border-rose-100 shadow-sm">
            <CardContent className="p-0">
              {stepIdx === 0 && (
                <div style={{ textAlign: "center" }}>
                  <div className="font-serif text-lg text-zinc-600 mb-6">Pick your favorite template</div>
                  <div className="grid grid-cols-2 gap-3 w-[240px] mx-auto">
                    <div className="aspect-[3/4] rounded-lg opacity-60" style={{ background: "linear-gradient(135deg,#7a1428,#c4283a)" }} />
                    <div className="aspect-[3/4] rounded-lg border-[3px] border-[#fb3570] shadow-[0_0_0_2px_#fff]" style={{ background: "linear-gradient(135deg,#1a3a2a,#2d6a4a)" }} />
                    <div className="aspect-[3/4] rounded-lg opacity-60" style={{ background: "linear-gradient(135deg,#4a2010,#9b6432)" }} />
                    <div className="aspect-[3/4] rounded-lg opacity-60" style={{ background: "linear-gradient(135deg,#1a2050,#2d3a8c)" }} />
                  </div>
                </div>
              )}

              {stepIdx === 1 && (
                <div className="text-center">
                  <div className="font-serif text-lg text-zinc-600 mb-6">Enter wedding details</div>
                  <div className="mx-auto w-full max-w-xs space-y-3 text-left">
                    <div className="text-xs text-zinc-500">Bride & Groom</div>
                    <div className="rounded-lg border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-zinc-800">Nguyễn Minh Quân</div>
                    <div className="rounded-lg border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-zinc-800">Trần Thanh Lan</div>
                    <div className="rounded-lg border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-zinc-800">15/06/2025 · 11:00</div>
                    <button type="button" className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-rose-700 active:scale-[0.99]">
                      Preview Invitation →
                    </button>
                  </div>
                </div>
              )}

              {stepIdx === 2 && (
                <div className="text-center">
                  <div className="font-serif text-lg text-zinc-600 mb-6">Smart sharing</div>
                  <div className="mx-auto max-w-xs space-y-3 text-left">
                    <div className="rounded-lg border border-rose-100 bg-white px-4 py-3 text-sm text-zinc-800">
                      <div className="font-medium">https://thiepcuoi.vn/mq-tl-1506</div>
                      <div className="text-xs text-zinc-500 mt-1">Invitation link ready to send</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs text-zinc-700">✓ Sent: 240</div>
                      <div className="rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs text-zinc-700">✓ Confirmed: 175</div>
                    </div>
                    <button type="button" className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.99]">
                      Share via Zalo / Messenger
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "RSVP Management",
      description: "Track responses in real time. Know exactly who will attend, dietary preferences, and meal choices.",
      icon: Calendar,
    },
    {
      title: "Guest List Import",
      description: "Import your guest list from CSV or add guests manually. We help keep everything organized.",
      icon: Users,
    },
    {
      title: "QR Code & Share Link",
      description: "Every invitation includes a shareable link and QR code for easy access across printed materials.",
      icon: MapPin,
    },
    {
      title: "Gift Contribution Link",
      description: "Connect contribution links so guests can quickly find and send gifts based on your preferences.",
      icon: Gift,
    },
    {
      title: "Looks Great on Every Device",
      description: "Your invitation looks beautiful on phones, tablets, and desktops for every guest.",
      icon: Zap,
    },
    {
      title: "Privacy Protection",
      description: "Your data stays secure. Control who sees what and protect guest privacy at every step.",
      icon: Shield,
    },
  ];

  return (
    <SectionWrapper id="features" className="bg-white">
      <AnimatedSection>
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Key <em>features</em>
        </Badge>
        <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">
          Everything you need
        </h2>
        <p className="text-zinc-600 max-w-xl mx-auto">
          From beautiful templates to comprehensive guest management, we&apos;ve thought of everything.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-rose-200">
              <feature.icon className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-semibold text-rose-900 mb-2">
              {feature.title}
            </h3>
            <p
              className="text-sm text-zinc-600"
              dangerouslySetInnerHTML={{ __html: feature.description }}
            />
          </Card>
        ))}
      </div>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function SocialProof() {
  return (
    <SectionWrapper className="bg-gradient-to-b from-rose-50/50 to-white">
      <AnimatedSection>
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">
          Loved by Couples Everywhere
        </h2>
        <p className="text-zinc-600 max-w-xl mx-auto">
          Join thousands of happy couples who created their dream wedding
          invitations with us.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          {
            name: "Sarah & Michael",
            location: "New York",
            text: "Creating our wedding invitation was so easy and the result was absolutely stunning. Our guests couldn&apos;t stop complimenting it!",
            rating: 5,
          },
          {
            name: "Emma & James",
            location: "Los Angeles",
            text: "The RSVP tracking saved us so much time. We knew exactly who was coming and their meal preferences within minutes.",
            rating: 5,
          },
          {
            name: "Lisa & David",
            location: "Chicago",
            text: "Beautiful templates, intuitive design, and excellent support. Couldn&apos;t have asked for a better experience.",
            rating: 5,
          },
        ].map((testimonial) => (
          <Card key={testimonial.name} className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-zinc-600 mb-4" dangerouslySetInnerHTML={{ __html: testimonial.text }} />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="font-medium text-rose-900">{testimonial.name}</div>
                <div className="text-sm text-zinc-500">{testimonial.location}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 md:p-8 bg-white border-rose-200 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-rose-500" />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-rose-900">24/7 Customer Support</h3>
              <span className="text-xs text-zinc-400">Online</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
                <p className="text-rose-900">&ldquo;I want to change the font to a classic style, is that possible?&rdquo;</p>
                <span className="text-xs text-zinc-400">Linh · 09:32</span>
              </div>
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3">
                <p className="text-zinc-700">&ldquo;Of course! We&apos;ve sent 3 matching font styles in the Customization section.&rdquo;</p>
                <span className="text-xs text-zinc-400">Support · 09:34</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function ContentPreview() {
  const articles = [
    {
      title: "Wedding invitation trends 2026: Minimal yet elegant",
      category: "Trends",
      readTime: "5 min",
      excerpt: "Explore the most loved wedding invitation styles of 2026, from minimal designs to timeless classics.",
    },
    {
      title: "Wedding planning checklist — What to do 6 months before",
      category: "Guide",
      readTime: "8 min",
      excerpt: "A complete checklist of everything you need for your wedding, organized with a clear timeline.",
    },
    {
      title: "How to write meaningful and memorable wedding invitations",
      category: "Tips",
      readTime: "4 min",
      excerpt: "A practical guide to writing invitation copy, from traditional to modern, for every wedding style.",
    },
  ];

  return (
    <SectionWrapper className="bg-rose-50/30">
      <div className="text-center mb-10">
        <Badge variant="outline" className="mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Wedding Guide
        </Badge>
        <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">
          Tips for Your Big Day
        </h2>
        <p className="text-zinc-600 max-w-xl mx-auto">
          Helpful articles to make your wedding planning smooth and unforgettable
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.title} hover className="p-6 cursor-pointer">
            <div className="flex items-center gap-2 text-xs text-rose-500 mb-3">
              <Badge variant="accent" className="text-xs">{article.category}</Badge>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-400">{article.readTime}</span>
            </div>
            <h3 className="font-semibold text-rose-900 mb-2 leading-snug">
              {article.title}
            </h3>
            <p className="text-sm text-zinc-600">{article.excerpt}</p>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}

function PricingSection() {
  const features = [
    "Free 3-day trial, no credit card required",
    "Send to unlimited guests",
    "Guest list management & RSVP tracking",
    "Receive gift money via bank QR code",
    "Multi-language support (7 languages)",
    "Personalized links for each guest",
    "24/7 support via Messenger",
  ];

  return (
    <SectionWrapper id="pricing" className="bg-white">
      <AnimatedSection>
        <div className="text-center mb-10">
          <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 leading-tight">
            Free to try,<br /> only pay if you <em>love it</em>
          </h2>
        </div>

        <Card className="max-w-2xl mx-auto border-rose-200 shadow-lg p-8 md:p-10 text-center">
          <CardContent className="p-0">
            <div className="inline-block rounded-full bg-rose-50 text-rose-700 text-xs font-medium px-4 py-1.5 mb-4">
              Lifetime · No subscription
            </div>
            <div className="text-5xl md:text-6xl font-serif font-semibold text-rose-700 mb-2">
              <span className="text-2xl align-top">₫</span>199<span className="text-2xl">.000</span>
            </div>
            <p className="text-zinc-600 mb-6">One-time payment · Use forever · Pay only if you love it</p>

            <ul className="text-left space-y-2.5 mb-8">
              {features.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-700">
                  <Check className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/register" className="inline-flex w-full">
              <Button size="lg" className="w-full justify-center">
                Create invitation for free →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      stars: "★★★★★",
      text: "The invitation was absolutely stunning — everyone complimented it. The interface is so easy to use, I finished it in 15 minutes. Support team was incredibly helpful and responsive.",
      avatar: "TL",
      name: "Thanh Lan & Minh Quan",
      info: "Hanoi · March 2025",
    },
    {
      stars: "★★★★★",
      text: "The personalized guest links feature is amazing. My relatives abroad could view the invitation perfectly, and the bilingual version looks fantastic.",
      avatar: "PA",
      name: "Phuong Anh & Tom",
      info: "Ho Chi Minh City · April 2025",
    },
    {
      stars: "★★★★★",
      text: "Great value for the price with quality exceeding expectations. Receiving gift money via QR is so convenient. Will definitely recommend to my sister for her wedding next year.",
      avatar: "HN",
      name: "Ha Nhi & Duc Anh",
      info: "Da Nang · May 2025",
    },
  ];

  return (
    <SectionWrapper className="bg-rose-50/40">
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 mb-4">
            Reviews
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 leading-tight">
            What couples say about<br /> <em>Wedding Invite</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <Card key={item.name} className="p-6 border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="text-amber-500 mb-3">{item.stars}</div>
                <p className="text-sm text-zinc-700 mb-5">&ldquo;{item.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold flex items-center justify-center">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-rose-900">{item.name}</div>
                    <div className="text-xs text-zinc-500">{item.info}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "Is creating a wedding invitation free?",
      a: "You can create a free invitation with basic templates. Premium templates and advanced features start from 79,000 VND/month.",
    },
    {
      q: "Can I customize the invitation templates?",
      a: "Absolutely! All templates are customizable in terms of colors, fonts, images, and text to match your wedding style.",
    },
    {
      q: "How do guests respond to wedding invitations?",
      a: "Guests receive the invitation link via email or message, then can confirm attendance, select meals, and send wishes directly on the invitation.",
    },
    {
      q: "Can I print the wedding invitation?",
      a: "Yes! Invitations are optimized for printing. You can download high-quality PDF files ready to send to guests.",
    },
    {
      q: "How do I send invitations to guests?",
      a: "You can send via email, WhatsApp/Zalo message, or print QR codes on paper invitations. Each invitation has a unique shareable link.",
    },
    {
      q: "Is guest information secure?",
      a: "We are committed to data security. All data is encrypted and you have full control over guest access.",
    },
    {
      q: "Can I edit the invitation after sending it?",
      a: "Yes, you can edit the invitation anytime before the wedding day. The link will automatically update to the latest version.",
    },
    {
      q: "Do wedding invitations display well on mobile?",
      a: "Invitations are designed to be responsive, looking beautiful on all devices from phones to tablets and desktops.",
    },
  ];

  return (
    <SectionWrapper className="bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Heart className="w-3.5 h-3.5" />
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-600">
            Answers to common questions about creating wedding invitations online
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="rounded-xl border border-rose-100 overflow-hidden group">
              <summary className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-rose-50/50 list-none">
                <span className="font-medium text-rose-900">{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-rose-400 shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-zinc-600 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 bg-linear-to-r from-rose-600 to-pink-600 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Heart className="w-12 h-12 mx-auto mb-6 fill-white/20" />
        <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
          Start Your Journey Together
        </h2>
        <p className="text-xl text-rose-100 mb-10 max-w-xl mx-auto">
          Create a beautiful wedding invitation that your guests will remember
          forever. It only takes a few minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-rose-600 hover:bg-rose-50 shadow-lg"
            >
              Create Your Invitation Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10"
            >
              Learn more
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-rose-950 text-rose-200 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
              <span className="text-lg font-semibold text-white font-serif">
                Wedding Invite
              </span>
            </Link>
            <p className="text-sm text-rose-300 mb-4">
              Create beautiful online wedding invitations for your special day.
            </p>
            <div className="flex items-center gap-3 text-xs text-rose-400">
              {["Tiếng Việt", "English", "繁體中文"].map((lang) => (
                <button key={lang} className="hover:text-white transition-colors">
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/templates" className="hover:text-white transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools/qr" className="hover:text-white transition-colors">
                  QR Code Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/countdown" className="hover:text-white transition-colors">
                  Wedding Countdown
                </Link>
              </li>
              <li>
                <Link href="/tools/seating" className="hover:text-white transition-colors">
                  Seating Arrangement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Collaboration</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-rose-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-rose-400">
          <span>© 2026 Wedding Invite. Made with love for couples everywhere.</span>
          <div className="flex items-center gap-4">
            <span> Hotline: 1900 xxx</span>
            <span>·</span>
            <span>support@weddinginvite.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustStrip />
        <TemplateShowcase />
        <HowItWorks />
        <FeaturesSection />
        <SocialProof />
        <PricingSection />
        <TestimonialsSection />
        <ContentPreview />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}