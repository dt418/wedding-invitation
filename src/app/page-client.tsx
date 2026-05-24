"use client";

import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { useState, useEffect } from "react";
import { useInView } from "@/lib/useInView";
import { Button } from "@/components/ui/button";
import { TemplateActionModal } from "@/components/templates/template-action-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Icons } from "@/components/ui/icons";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { translations, type Locale } from "@/lib/i18n";

type HomeTranslations = typeof translations.vi.home;

function getAvatarColor(name: string): string {
  const colors = [
    "bg-rose-200 text-rose-700",
    "bg-amber-200 text-amber-700",
    "bg-emerald-200 text-emerald-700",
    "bg-blue-200 text-blue-700",
    "bg-purple-200 text-purple-700",
    "bg-pink-200 text-pink-700",
    "bg-teal-200 text-teal-700",
    "bg-indigo-200 text-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const parts = name.split(/[\s&]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

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

interface HomePageClientProps {
  locale: Locale;
}

export default function HomePageClient({ locale }: HomePageClientProps) {
  const t = translations[locale].home as unknown as HomeTranslations;
  const auth = translations[locale].auth;
  const dashboard = translations[locale].dashboard;

  return (
    <>
      <Header t={t} auth={auth} dashboard={dashboard} />
      <HeroSection t={t} />
      <TrustStrip t={t} />
      <TemplateShowcase t={t} />
      <HowItWorks t={t} />
      <FeaturesSection t={t} />
      <SocialProof t={t} />
      <ContentPreview t={t} />
      <PricingSection t={t} />
      <TestimonialsSection t={t} />
      <FAQSection t={t} />
      <FinalCTA t={t} />
      <Footer t={t} />
    </>
  );
}

function Header({ t, auth, dashboard }: { t: HomeTranslations; auth: Record<string, string>; dashboard: Record<string, string> }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-rose-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <span className="text-lg font-semibold text-rose-900 font-serif">
            {t.brand}
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#templates" className="text-sm text-zinc-600 hover:text-rose-600 transition-colors">
            {t.templates}
          </Link>
          <Link href="#how-it-works" className="text-sm text-zinc-600 hover:text-rose-600 transition-colors">
            {t.howItWorks}
          </Link>
          <Link href="#features" className="text-sm text-zinc-600 hover:text-rose-600 transition-colors">
            {t.features}
          </Link>
          <Link href="#pricing" className="text-sm text-zinc-600 hover:text-rose-600 transition-colors">
            {t.pricing}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {auth.signIn}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">{dashboard.getStarted}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ t }: { t: HomeTranslations }) {
  return (
    <section className="hero relative min-h-screen overflow-hidden bg-linear-to-b from-rose-50 via-white to-rose-50/50">
      <div className="hero-left relative z-10 max-w-6xl mx-auto px-6 min-h-screen flex items-center py-16 md:py-20">
        <div className="flex-1 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="hero-kicker inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 mb-5">
              {t.kicker}
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold text-rose-900 leading-tight mb-4">
              {t.heroTitle.split("<em>")[0]}<em>{t.heroTitle.split("<em>")[1]?.split("</em>")[0]}</em>
            </h1>
            <p className="hero-sub text-lg text-zinc-600 max-w-xl mb-8">
              {t.heroSubtitle}
            </p>
            <div className="hero-actions flex flex-col sm:flex-row items-center gap-4 mb-8">
              <Link href="#templates" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 text-white font-medium text-sm hover:bg-rose-700 transition-colors">
                {t.createFree}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <a href="#how-it-works" className="btn-ghost inline-flex items-center gap-2 px-6 py-3 rounded-full border border-rose-200 text-rose-700 font-medium text-sm hover:bg-rose-50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" /><path d="M6.5 5.5L10.5 8l-4 2.5V5.5z" fill="currentColor" /></svg>
                {t.seeHow}
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
                <strong className="text-rose-700">{t.trustCount}</strong> {t.trustLabel}
              </p>
            </div>
          </div>

          <div className="hero-right relative">
            <div className="hero-visual relative">
              <div className="phone-frame relative mx-auto h-115 w-65 max-w-full rounded-[2.5rem] border-4 border-zinc-900 bg-zinc-900 shadow-2xl p-1.5">
                <div className="phone-screen relative h-full rounded-4xl bg-linear-to-b from-rose-50 to-white p-3 overflow-hidden flex flex-col">
                  <div className="phone-notch mx-auto mb-2 h-4 w-20 rounded-full bg-zinc-900/90" />
                  <div className="thiep-preview flex-1 rounded-2xl border border-rose-200 p-5 text-center min-h-35 flex flex-col justify-center" style={{ background: "linear-gradient(135deg,#7a1428,#c4283a)" }}>
                    <div className="thiep-title text-xs tracking-widest mb-2" style={{ color: "#f9e4a0" }}>{t.thiepTitle}</div>
                    <div className="thiep-names font-serif text-2xl leading-tight" style={{ color: "#f9e4a0" }}>
                      {t.thiepNames}
                    </div>
                    <div className="mock-deco w-14 h-px mx-auto my-3" style={{ background: "#f9e4a0" }} />
                    <div className="thiep-date text-xs text-zinc-100">{t.thiepDate}</div>
                    <div className="thiep-date" style={{ marginTop: "0.3rem", fontSize: ".7rem", color: "rgba(249,228,160,.6)" }}>{t.thiepVenue}</div>
                  </div>
                  <div className="phone-info mt-3 w-full bg-white text-xs text-zinc-600 py-4">
                    <div className="phone-info-row flex justify-between py-1">
                      <span>{t.personalMsg}</span><span className="text-rose-700">{t.guestName}</span>
                    </div>
                    <div className="phone-info-row flex justify-between py-1">
                      <span>{t.rsvp}</span><span className="text-emerald-600">✓ {t.attending}</span>
                    </div>
                    <div className="phone-info-row flex justify-between py-1">
                      <span>{t.wishes}</span><span className="text-rose-700">{t.wishesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card fc-1 absolute -left-6 top-20 px-4 py-3 bg-white rounded-xl border border-rose-100 shadow-lg hidden md:block">
              <div className="fc-label text-xs text-zinc-500">{t.viewsToday}</div>
              <div className="fc-value fc-rose text-lg font-semibold text-rose-600">+247 ↑</div>
            </div>
            <div className="floating-card fc-2 absolute -right-6 bottom-16 px-4 py-3 bg-white rounded-xl border border-rose-100 shadow-lg hidden md:block">
              <div className="fc-label text-xs text-zinc-500">{t.confirmed}</div>
              <div className="fc-value text-lg font-semibold text-rose-800">{t.peopleCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <Icons.chevronDown className="w-6 h-6 text-rose-400" />
      </div>
    </section>
  );
}

function TrustStrip({ t }: { t: HomeTranslations }) {
  const stats = [
    { value: "46,000+", label: t.stats.couples, icon: Icons.heart },
    { value: "120,000+", label: t.stats.registrations, icon: Icons.users },
    { value: "340,000+", label: t.stats.invitations, icon: Icons.gift },
    { value: "2.6M+", label: t.stats.views, icon: Icons.star },
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

function TemplateShowcase({ t }: { t: HomeTranslations }) {
  const [templateDetailsBySlug, setTemplateDetailsBySlug] = useState<Record<string, {
    id: string;
    name: string;
    slug: string;
    category: string;
    thumbnailUrl: string | null;
    description: string | null;
    isPremium: boolean;
    metadata?: unknown;
  }>>({});

  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: string;
    name: string;
    slug: string;
    category: string;
    thumbnailUrl: string | null;
    description: string | null;
    isPremium: boolean;
    metadata?: unknown;
  } | null>(null);

  const templates = [
    { id: 1, slug: "song-long-do", name: "Song Long – Đỏ", tags: ["Truyền thống", "Trang trọng"], bg: "linear-gradient(135deg, #7a1428 0%, #c4283a 50%, #7a1428 100%)", accent: "#f9e4a0", label: "TRUYỀN THỐNG", new: false },
    { id: 2, slug: "thanh-diep-xanh", name: "Thanh Diệp – Xanh", tags: ["Thiên nhiên", "Hiện đại"], bg: "linear-gradient(135deg, #1a3a2a, #2d6a4a)", accent: "#d4e8a0", label: "THIÊN NHIÊN", new: false },
    { id: 3, slug: "hoa-lua-nau", name: "Hoa Lụa – Nâu", tags: ["Sang trọng", "Cổ điển"], bg: "linear-gradient(135deg, #4a2010, #9b6432)", accent: "#fde8c0", label: "SANG TRỌNG", new: true },
    { id: 4, slug: "hoang-kim-lam", name: "Hoàng Kim – Lam", tags: ["Hoàng gia", "Trang trọng"], bg: "linear-gradient(135deg, #1a2050, #2d3a8c)", accent: "#c0d0f9", gold: "#c9a96e", label: "HOÀNG GIA", new: true },
    { id: 5, slug: "mai-lan-trang", name: "Mai Lan – Trắng", tags: ["Tối giản", "Tinh tế"], bg: "linear-gradient(135deg, #f0e8e0, #e8d8c8)", accent: "#6b4a30", label: "TỐI GIẢN", new: false },
    { id: 6, slug: "song-phung-do", name: "Song Phụng – Đỏ", tags: ["Truyền thống", "Đỏ"], bg: "linear-gradient(135deg, #5a0a20, #8c1430, #5a0a20)", accent: "#f9e4a0", label: "TRUYỀN THỐNG", new: false },
    { id: 7, slug: "nhat-binh-tim", name: "Nhật Bình – Tím", tags: ["Áo dài", "Phong cách"], bg: "linear-gradient(135deg, #2a1a30, #5a2a70)", accent: "#e8c8f8", gold: "#c9a96e", label: "ÁO DÀI", new: true },
    { id: 8, slug: "vuon-xuan-xanh", name: "Vườn Xuân – Xanh", tags: ["Boho", "Lãng mạn"], bg: "linear-gradient(135deg, #2a4020, #3a6030)", accent: "#d0e8c0", label: "BOHO", new: false },
  ];

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then((data) => {
      const map: Record<string, typeof templateDetailsBySlug[string]> = {};
      for (const tpl of data) {
        map[tpl.slug] = { id: tpl.id, name: tpl.name, slug: tpl.slug, category: tpl.category, thumbnailUrl: tpl.thumbnailUrl ?? null, description: tpl.description ?? null, isPremium: tpl.isPremium ?? false, metadata: tpl.metadata ?? null };
      }
      setTemplateDetailsBySlug(map);
    });
  }, []);

  return (
    <SectionWrapper id="templates" className="bg-linear-to-b from-white to-rose-50/30 [&>div]:max-w-7xl">
      <AnimatedSection>
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Icons.palette className="w-3.5 h-3.5" />
            {t.templates}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">
            {t.templatesTitle}
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            {t.templatesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tmpl, i) => (
            <div key={tmpl.id} onClick={() => { const dbTemplate = templateDetailsBySlug[tmpl.slug]; if (dbTemplate) setSelectedTemplate(dbTemplate); }} className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1" style={{ transitionDelay: `${i * 40}ms` }}>
              <div className="relative h-full rounded-2xl overflow-hidden bg-white border border-rose-100 shadow-sm active:scale-[0.99] hover:shadow-xl transition-all duration-300">
                {tmpl.new && <span className="absolute top-3 left-3 z-10 inline-flex px-2 py-0.5 text-xs font-semibold bg-rose-600 text-white rounded-sm">{t.new}</span>}
                <div className="h-52 flex items-center justify-center relative overflow-hidden" style={{ background: tmpl.bg }}>
                  <div className="w-28 h-40 rounded-sm shadow-2xl -rotate-2 flex flex-col items-center justify-center gap-1 p-2 border border-white/20 backdrop-blur-sm bg-black/10">
                    <span className="text-[10px] tracking-widest" style={{ color: tmpl.accent, opacity: 0.8 }}>{t.kinhMoi}</span>
                    <div className="w-10 h-px" style={{ background: tmpl.gold ?? tmpl.accent, opacity: 0.7 }} />
                    <span className="text-sm font-semibold tracking-wide" style={{ color: tmpl.accent }}>{tmpl.name.split(" – ")[0]}</span>
                    <div className="w-10 h-px" style={{ background: tmpl.gold ?? tmpl.accent, opacity: 0.7 }} />
                    <span className="text-[8px] tracking-widest mt-1" style={{ color: tmpl.accent, opacity: 0.55 }}>{tmpl.label}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-rose-900 mb-2">{tmpl.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.tags.map((tag) => (<span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">{tag}</span>))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/templates" className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer h-14 px-7 text-lg rounded-2xl bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-200/50">
            {t.viewAll} <Icons.arrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AnimatedSection>
      {selectedTemplate && <TemplateActionModal template={selectedTemplate as Parameters<typeof TemplateActionModal>[0]["template"]} onClose={() => setSelectedTemplate(null)} />}
    </SectionWrapper>
  );
}

function HowItWorks({ t }: { t: HomeTranslations }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStepIdx((i) => (i + 1) % 3), 3500);
    return () => clearInterval(id);
  }, []);

  const steps = t.howItWorksSteps;

  return (
    <SectionWrapper id="how-it-works" className="bg-rose-50/50">
      <AnimatedSection>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
          <div>
            <div className="mb-8 text-left">
              <span className="inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 mb-4">
                {t.howItWorks}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 leading-tight mb-3">
                {t.howItWorksTitle.split("<em>")[0]}<em>{t.howItWorksTitle.split("<em>")[1]?.split("</em>")[0]}</em>
              </h2>
              <p className="text-zinc-600 max-w-xl">{t.howItWorksSubtitle}</p>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <article key={step.number} className={`rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${index === stepIdx ? "border-rose-300 shadow-md" : "border-rose-100"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${index === stepIdx ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-700"}`}>{step.number}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-rose-900 mb-1">{step.title}</h3>
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
                  <div className="font-serif text-lg text-zinc-600 mb-6">{steps[0].title}</div>
                  <div className="grid grid-cols-2 gap-3 w-60 mx-auto">
                    <div className="aspect-3/4 rounded-lg opacity-60" style={{ background: "linear-gradient(135deg,#7a1428,#c4283a)" }} />
                    <div className="aspect-3/4 rounded-lg border-[3px] border-[#fb3570] shadow-[0_0_0_2px_#fff]" style={{ background: "linear-gradient(135deg,#1a3a2a,#2d6a4a)" }} />
                    <div className="aspect-3/4 rounded-lg opacity-60" style={{ background: "linear-gradient(135deg,#4a2010,#9b6432)" }} />
                    <div className="aspect-3/4 rounded-lg opacity-60" style={{ background: "linear-gradient(135deg,#1a2050,#2d3a8c)" }} />
                  </div>
                </div>
              )}
              {stepIdx === 1 && (
                <div className="text-center">
                  <div className="font-serif text-lg text-zinc-600 mb-6">{steps[1].title}</div>
                  <div className="mx-auto w-full max-w-xs space-y-3 text-left">
                    <div className="text-xs text-zinc-500">{t.brideGroom}</div>
                    <div className="rounded-lg border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-zinc-800">Nguyễn Minh Quân</div>
                    <div className="rounded-lg border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-zinc-800">Trần Thanh Lan</div>
                    <div className="rounded-lg border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-zinc-800">15/06/2025 · 11:00</div>
                    <button type="button" className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-rose-700 active:scale-[0.99]">{t.previewInvitation} →</button>
                  </div>
                </div>
              )}
              {stepIdx === 2 && (
                <div className="text-center">
                  <div className="font-serif text-lg text-zinc-600 mb-6">{steps[2].title}</div>
                  <div className="mx-auto max-w-xs space-y-3 text-left">
                    <div className="rounded-lg border border-rose-100 bg-white px-4 py-3 text-sm text-zinc-800">
                      <div className="font-medium">{t.inviteLink}</div>
                      <div className="text-xs text-zinc-500 mt-1">{t.linkReady}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs text-zinc-700">✓ {t.sent}: 240</div>
                      <div className="rounded-lg border border-rose-100 bg-rose-50/50 px-3 py-2 text-xs text-zinc-700">✓ {t.confirmed}: 175</div>
                    </div>
                    <button type="button" className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 active:scale-[0.99]">{t.shareVia}</button>
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

function FeaturesSection({ t }: { t: HomeTranslations }) {
  const features = t.featuresList;
  const featureIcons = [
    Icons.checkCircle, // Quản lý RSVP
    Icons.users,       // Nhập danh sách khách
    Icons.link,       // Mã QR & Link chia sẻ
    Icons.gift,       // Link quyên góp quà
    Icons.monitor,    // Đẹp trên mọi thiết bị
    Icons.shield,     // Bảo vệ quyền riêng tư
  ];
  return (
    <SectionWrapper id="features" className="bg-white">
      <AnimatedSection>
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Icons.sparkles className="w-3.5 h-3.5" />
            {t.keyFeatures}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">{t.everythingNeed}</h2>
          <p className="text-zinc-600 max-w-xl mx-auto">{t.featuresSubtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = featureIcons[index] || Icons.calendar;
            return (
              <Card key={feature.title} className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-semibold text-rose-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-600" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(feature.description) }} />
              </Card>
            );
          })}
        </div>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function SocialProof({ t }: { t: HomeTranslations }) {
  return (
    <SectionWrapper className="bg-linear-to-b from-rose-50/50 to-white">
      <AnimatedSection>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">{t.lovedBy}</h2>
          <p className="text-zinc-600 max-w-xl mx-auto">{t.lovedSubtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {t.testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (<Icons.star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />))}
              </div>
              <p className="text-zinc-600 mb-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(testimonial.text) }} />
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(testimonial.name)} text-sm font-semibold flex items-center justify-center`}>{getInitials(testimonial.name)}</div>
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
            <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center shrink-0"><Icons.users className="w-5 h-5 text-rose-500" /></div>
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-rose-900">{t.supportTitle}</h3>
                <span className="text-xs text-zinc-400">{t.online}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
                  <p className="text-rose-900">{t.question1}</p>
                  <span className="text-xs text-zinc-400">Linh · 09:32</span>
                </div>
                <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-3">
                  <p className="text-zinc-700">{t.answer1}</p>
                  <span className="text-xs text-zinc-400">{t.support2} · 09:34</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function ContentPreview({ t }: { t: HomeTranslations }) {
  const articles = t.articles;
  return (
    <SectionWrapper className="bg-rose-50/30">
      <div className="text-center mb-10">
        <Badge variant="outline" className="mb-4">
          <Icons.sparkles className="w-3.5 h-3.5" />
          {t.weddingGuide}
        </Badge>
        <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">{t.tipsTitle}</h2>
        <p className="text-zinc-600 max-w-xl mx-auto">{t.tipsSubtitle}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.title} className="p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-2 text-xs text-rose-500 mb-3">
              <Badge variant="accent" className="text-xs">{article.category}</Badge>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-400">{article.readTime}</span>
            </div>
            <h3 className="font-semibold text-rose-900 mb-2 leading-snug">{article.title}</h3>
            <p className="text-sm text-zinc-600">{article.excerpt}</p>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}

function PricingSection({ t }: { t: HomeTranslations }) {
  return (
    <SectionWrapper id="pricing" className="bg-white">
      <AnimatedSection>
        <div className="text-center mb-10">
          <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 mb-4">{t.pricing}</span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 leading-tight">
            {t.pricingTitle.split("<em>")[0]}<em>{t.pricingTitle.split("<em>")[1]?.split("</em>")[0]}</em>
          </h2>
        </div>
        <Card className="max-w-2xl mx-auto border-rose-200 shadow-lg p-8 md:p-10 text-center">
          <CardContent className="p-0">
            <div className="inline-block rounded-full bg-rose-50 text-rose-700 text-xs font-medium px-4 py-1.5 mb-4">{t.lifetime}</div>
            <div className="text-5xl md:text-6xl font-serif font-semibold text-rose-700 mb-2">
              <span className="text-2xl align-top">₫</span>199<span className="text-2xl">.000</span>
            </div>
            <p className="text-zinc-600 mb-6">{t.oneTime}</p>
            <ul className="text-left space-y-2.5 mb-8">
              {t.pricingFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-700">
                  <Icons.check className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" /><span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" className="inline-flex w-full">
              <Button size="lg" className="w-full justify-center">{t.createFreeBtn} →</Button>
            </Link>
          </CardContent>
        </Card>
      </AnimatedSection>
    </SectionWrapper>
  );
}

function TestimonialsSection({ t }: { t: HomeTranslations }) {
  const testimonials = t.testimonials;
  return (
    <SectionWrapper className="bg-rose-50/40">
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-700 mb-4">{t.reviews}</span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 leading-tight">
            {t.reviewsTitle.split("<em>")[0]}<em>{t.reviewsTitle.split("<em>")[1]?.split("</em>")[0]}</em>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <Card key={item.name} className="p-6 border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Icons.star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 mb-5">&ldquo;{item.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(item.name)} text-sm font-semibold flex items-center justify-center`}>{getInitials(item.name)}</div>
                  <div>
                    <div className="text-sm font-semibold text-rose-900">{item.name}</div>
                    <div className="text-xs text-zinc-500">{item.location}</div>
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

function FAQSection({ t }: { t: HomeTranslations }) {
  const faqs = t.faqs;
  return (
    <SectionWrapper className="bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4"><Icons.heart className="w-3.5 h-3.5" />{t.faq}</Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-rose-900 mb-4">{t.faqTitle}</h2>
          <p className="text-zinc-600">{t.faqSubtitle}</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="rounded-xl border border-rose-100 overflow-hidden group">
              <summary className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-rose-50/50 list-none">
                <button className="font-medium text-rose-900 text-left flex-1" type="button">{faq.q}</button>
                <Icons.chevronDown className="w-4 h-4 text-rose-400 shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-zinc-600 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function FinalCTA({ t }: { t: HomeTranslations }) {
  return (
    <section className="py-24 bg-linear-to-r from-rose-600 to-pink-600 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Icons.heart className="w-12 h-12 mx-auto mb-6 fill-white/20" />
        <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6">{t.ctaTitle}</h2>
        <p className="text-xl text-rose-100 mb-10 max-w-xl mx-auto">{t.ctaSubtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-white text-rose-600 hover:bg-rose-50 shadow-lg">{t.ctaBtn}<Icons.arrowRight className="w-5 h-5" /></Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">{t.learnMore}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer({ t }: { t: HomeTranslations }) {
  return (
    <footer className="bg-rose-950 text-rose-200 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icons.heart className="w-6 h-6 text-rose-400 fill-rose-400" />
              <span className="text-lg font-semibold text-white">{t.footerBrand}</span>
            </div>
            <p className="text-sm text-rose-300">{t.footerDesc}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t.product}</h4>
            <ul className="space-y-2 text-sm text-rose-300">
              <li><a href="#templates" className="hover:text-white transition-colors">{t.templates}</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">{t.pricing}</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">{t.features}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t.support2}</h4>
            <ul className="space-y-2 text-sm text-rose-300">
              <li><a href="#" className="hover:text-white transition-colors">{t.helpCenter}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.contactUs}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.faq}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t.connect}</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-rose-800 flex items-center justify-center hover:bg-rose-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-rose-800 flex items-center justify-center hover:bg-rose-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-rose-800 pt-8 text-center text-sm text-rose-400">
          <p>© 2025 {t.footerBrand}. {t.rights}.</p>
        </div>
      </div>
    </footer>
  );
}