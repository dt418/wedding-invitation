"use client";

interface SectionData {
  id: string;
  sectionType: string;
  customContent?: Record<string, unknown>;
  visibility: string;
}

interface RendererProps {
  sections: SectionData[];
  previewMode?: "desktop" | "mobile";
  locale?: string;
}

const CLASSIC_COLORS = {
  red: "rgb(var(--color-z-red))",
  linen: "rgb(var(--color-z-linen))",
  gray: "rgb(var(--color-z-gray))",
};

function getDayName(dateStr: string): string {
  if (!dateStr) return "";
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[new Date(dateStr).getDay()] || "";
}

function getMonthName(dateStr: string): string {
  if (!dateStr) return "";
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  return `THÁNG ${months[new Date(dateStr).getMonth()] || "01"}`;
}

function getDayNumber(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).getDate().toString();
}

function getYear(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).getFullYear().toString();
}

export default function ClassicInviteRenderer({
  sections,
  previewMode = "desktop",
}: RendererProps) {
  const containerClass = previewMode === "mobile" 
    ? "w-[375px] mx-auto border-x" 
    : "w-full max-w-[480px] md:max-w-[900px] md:mx-auto overflow-hidden md:border md:border-[#a31d1622]";

  const content = sections[0]?.customContent || {};
  
  const groomName = (content.groomName as string) || "Chú Rể";
  const brideName = (content.brideName as string) || "Cô Dâu";
  const groomNickname = (content.groomNickname as string) || (content.nicknames as string)?.split(" & ")[0] || "";
  const brideNickname = (content.brideNickname as string) || (content.nicknames as string)?.split(" & ")[1] || "";
  const groomFather = (content.groomFather as string) || "";
  const groomMother = (content.groomMother as string) || "";
  const brideFather = (content.brideFather as string) || "";
  const brideMother = (content.brideMother as string) || "";
  const groomAddress = (content.groomAddress as string) || "";
  const brideAddress = (content.brideAddress as string) || "";
  const eventDate = (content.eventDate as string) || "";
  const eventTime = (content.eventTime as string) || "";
  const ceremonyTime = (content.ceremonyTime as string) || eventTime;
  const venueName = (content.venueName as string) || "";
  const mapUrl = (content.mapUrl as string) || "";

  const showCountdown = false;
  const countdownDays = 0;
  const countdownHours = 0;
  const countdownMinutes = 0;
  const countdownSeconds = 0;

  const CDN_URL = "/images";

  return (
    <div className={containerClass} style={{ backgroundColor: CLASSIC_COLORS.linen, padding: 0 }}>
      {/* Header with dragon pattern */}
      <div className="relative w-full h-12 sm:h-16 md:h-[128px]" style={{ backgroundColor: CLASSIC_COLORS.red }}>
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)" }} />
      </div>

      {/* Couple info section */}
      <div className="relative w-full py-6 sm:py-8 md:py-10 px-2 overflow-hidden" style={{ backgroundColor: CLASSIC_COLORS.linen }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "50%", mixBlendMode: "color-dodge" }} />
        
        {/* Red bar with chu-hy image */}
        <div className="absolute left-0 right-0 h-[40px] sm:h-[50px] md:h-[70px] top-[66px] sm:top-[88px] md:top-[125px] z-10" style={{ backgroundColor: CLASSIC_COLORS.red }}>
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "30%" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] sm:w-[70px] sm:h-[70px] md:w-[96px] md:h-[96px] object-contain" src={`${CDN_URL}/chu-hy.webp`} />
        </div>

        {/* Couple avatars and names */}
        <div className="relative z-20 flex items-start justify-center gap-2 sm:gap-4 pointer-events-none">
          {/* Groom */}
          <div className="flex flex-col items-center flex-1 min-w-0 pointer-events-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="rounded-full w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] md:w-[240px] md:h-[240px] object-cover bg-rose-100" alt={groomName} src={`${CDN_URL}/avatar-placeholder.jpeg`} />
            {groomNickname && <div className="font-light font-helvetica text-xs sm:text-sm md:text-base mt-2 sm:mt-3 md:mt-4" style={{ color: CLASSIC_COLORS.gray }}>{groomNickname}</div>}
            <div className="text-2xl sm:text-3xl md:text-4xl font-fz-aghita whitespace-nowrap" style={{ color: CLASSIC_COLORS.red }}>{groomName}</div>
          </div>
          
          <div className="w-[52px] sm:w-[70px] md:w-[96px] shrink-0"></div>
          
          {/* Bride */}
          <div className="flex flex-col items-center flex-1 min-w-0 pointer-events-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="rounded-full w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] md:w-[240px] md:h-[240px] object-cover bg-rose-100" alt={brideName} src={`${CDN_URL}/avatar-placeholder.jpeg`} />
            {brideNickname && <div className="font-light font-helvetica text-xs sm:text-sm md:text-base mt-2 sm:mt-3 md:mt-4" style={{ color: CLASSIC_COLORS.gray }}>{brideNickname}</div>}
            <div className="text-2xl sm:text-3xl md:text-4xl font-fz-aghita whitespace-nowrap" style={{ color: CLASSIC_COLORS.red }}>{brideName}</div>
          </div>
        </div>
      </div>

      {/* Ceremony Info Header */}
      <div className="w-full py-3 md:py-4" style={{ backgroundColor: CLASSIC_COLORS.red }}>
        <h2 className="font-bold text-[20px] md:text-[24px] text-center uppercase tracking-wide" style={{ color: CLASSIC_COLORS.linen, fontFamily: '"Times New Roman", serif' }}>
          <span>THÔNG TIN LỄ CƯỚI</span>
        </h2>
      </div>

      {/* Parents Info */}
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: CLASSIC_COLORS.linen }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "10%", mixBlendMode: "color-dodge" }} />
        
        <div className="relative z-10">
          {/* Parents names */}
          <div className="w-full flex items-start justify-center gap-3 md:gap-8 mt-6 px-2 sm:px-4" style={{ color: CLASSIC_COLORS.red, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
            <div className="flex-1 flex flex-col items-center gap-1 text-center max-w-[160px] md:max-w-[280px]">
              <span className="text-[14px] md:text-[15px]" style={{ color: CLASSIC_COLORS.gray }}>
                <span>Ông Bà</span>
              </span>
              {groomFather && <span className="text-[14px] md:text-[15px] font-semibold whitespace-nowrap" style={{ color: CLASSIC_COLORS.red }}>{groomFather}</span>}
              {groomMother && <span className="text-[14px] md:text-[15px] font-semibold whitespace-nowrap" style={{ color: CLASSIC_COLORS.red }}>{groomMother}</span>}
              {groomAddress && <div className="text-[12px] md:text-[13px] mt-1 whitespace-pre-line leading-tight flex flex-col" style={{ color: CLASSIC_COLORS.gray }}>{groomAddress}</div>}
            </div>
            
            <div className="w-[1px] h-[60px] self-center" style={{ backgroundColor: CLASSIC_COLORS.red }} />
            
            <div className="flex-1 flex flex-col items-center gap-1 text-center max-w-[160px] md:max-w-[280px]">
              <span className="text-[14px] md:text-[15px]" style={{ color: CLASSIC_COLORS.gray }}>
                <span>Ông Bà</span>
              </span>
              {brideFather && <span className="text-[14px] md:text-[15px] font-semibold whitespace-nowrap" style={{ color: CLASSIC_COLORS.red }}>{brideFather}</span>}
              {brideMother && <span className="text-[14px] md:text-[15px] font-semibold whitespace-nowrap" style={{ color: CLASSIC_COLORS.red }}>{brideMother}</span>}
              {brideAddress && <div className="text-[12px] md:text-[13px] mt-1 whitespace-pre-line leading-tight flex flex-col" style={{ color: CLASSIC_COLORS.gray }}>{brideAddress}</div>}
            </div>
          </div>

          {/* Wedding announcement */}
          <div className="text-center text-[16px] md:text-[20px] uppercase tracking-wider mt-8 px-4 flex flex-col gap-2" style={{ whiteSpace: "pre-line", color: CLASSIC_COLORS.red, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
            <span>TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN CỦA CON CHÚNG TÔI</span>
          </div>

          {/* Couple names announcement */}
          <div className="relative flex flex-col items-center text-center gap-3 md:gap-4 mt-4 mb-6">
            <h3 className="font-fz-qellia w-[80%] flex items-center justify-center text-[32px] md:text-[42px] leading-[50px] md:leading-[100px] whitespace-nowrap" style={{ fontSize: "64px", color: CLASSIC_COLORS.red }}>{groomName}</h3>
            {groomNickname && <div className="text-[12px] md:text-[13px] uppercase tracking-[0.2em]" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif' }}>{groomNickname}</div>}
            <div className="font-fz-qellia text-[30px] md:text-[35px]" style={{ color: CLASSIC_COLORS.gray }}>&</div>
            <h3 className="font-fz-qellia w-[80%] flex items-center justify-center text-[32px] md:text-[42px] leading-[50px] md:leading-[100px] whitespace-nowrap" style={{ fontSize: "64px", color: CLASSIC_COLORS.red }}>{brideName}</h3>
            {brideNickname && <div className="text-[12px] md:text-[13px] uppercase tracking-[0.2em]" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif' }}>{brideNickname}</div>}
          </div>
        </div>
      </div>

      {/* Dragon pattern divider */}
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: CLASSIC_COLORS.linen }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "40%", mixBlendMode: "color-dodge" }} />
      </div>

      {/* Reception Info Header */}
      <div className="w-full py-3 md:py-4" style={{ backgroundColor: CLASSIC_COLORS.red }}>
        <h2 className="font-bold text-[20px] md:text-[24px] text-center uppercase tracking-wide" style={{ color: CLASSIC_COLORS.linen, fontFamily: '"Times New Roman", serif' }}>
          <span>THÔNG TIN TIỆC CƯỚI</span>
        </h2>
      </div>

      {/* Reception Info Content */}
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: CLASSIC_COLORS.linen }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "60%", mixBlendMode: "color-dodge" }} />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-2 sm:px-4 pt-6 pb-8 -mt-[1px]">
          {/* Time */}
          <h3 className="text-[16px] md:text-[20px] text-center uppercase flex flex-col items-center" style={{ color: CLASSIC_COLORS.red, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
            <span>Tiệc cưới sẽ diễn ra vào lúc:</span>
          </h3>
          <div className="text-[20px] md:text-[24px] font-semibold mt-2 text-center" style={{ color: CLASSIC_COLORS.red, fontFamily: 'Baskerville, "Times New Roman", serif' }}>{ceremonyTime || eventTime || "18:00"}</div>

          {/* Date with day/month display */}
          <div className="flex items-center justify-center mt-5" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
            <span className="text-[14px] md:text-[15px] w-[70px] md:w-[85px] uppercase whitespace-nowrap" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif', textAlign: "right" }}>
              {getDayName(eventDate)}
            </span>
            <span className="w-[1px] h-[25px] self-center opacity-50 mx-3 md:mx-4" style={{ backgroundColor: CLASSIC_COLORS.gray }} />
            <span className="text-[32px] md:text-[38px]" style={{ color: CLASSIC_COLORS.red, fontFamily: 'Baskerville, "Times New Roman", serif' }}>{getDayNumber(eventDate) || "27"}</span>
            <span className="w-[1px] h-[25px] self-center opacity-50 mx-3 md:mx-4" style={{ backgroundColor: CLASSIC_COLORS.gray }} />
            <span className="text-[14px] md:text-[15px] w-[70px] md:w-[85px] uppercase whitespace-nowrap" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif', textAlign: "left" }}>
              {getMonthName(eventDate)}
            </span>
          </div>

          {/* Year */}
          <div className="text-[20px] md:text-[22px] mt-2 text-center" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif' }}>{getYear(eventDate) || "2026"}</div>

          {/* Venue */}
          {venueName && (
            <div className="text-[13px] md:text-[14px] text-center mt-4" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
              {venueName}
            </div>
          )}

          {/* Countdown Timer */}
          {showCountdown && (
            <div className="flex items-center justify-center flex-col mt-4">
              <h2 className="text-[20px] uppercase text-center flex flex-col items-center" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
                <span>Cùng đếm ngược</span>
              </h2>
              <div className="text-center mt-2 text-[20px] font-semibold" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
                <p>{countdownDays} ngày {countdownHours} giờ {countdownMinutes} phút {countdownSeconds} giây</p>
              </div>
            </div>
          )}

          {/* Calendar */}
          <div className="w-full max-w-[280px] md:max-w-[310px] mx-auto rounded-lg overflow-hidden border mt-2" style={{ borderColor: `color-mix(in srgb, ${CLASSIC_COLORS.red} 27%, transparent)`, color: CLASSIC_COLORS.red }}>
            <div className="text-center py-2.5 text-[13px] md:text-[14px] font-semibold border-b tracking-wide" style={{ borderColor: `color-mix(in srgb, ${CLASSIC_COLORS.red} 27%, transparent)` }}>
              {getMonthName(eventDate)} / {getYear(eventDate) || "2026"}
            </div>
            <CalendarGrid eventDate={eventDate} />
          </div>

          {/* Add to calendar link */}
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center justify-center text-sm tracking-wider underline underline-offset-4 decoration-1 transition-opacity hover:opacity-70" style={{ color: CLASSIC_COLORS.red, background: "none" }}>
              <span>Thêm vào lịch</span>
            </a>
          )}
        </div>

        {/* RSVP Button */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full pt-2 pb-8 md:pt-2 md:pb-10">
          <button type="button" className="text-sm md:text-base tracking-wider inline-flex items-center justify-center rounded-[10px] px-4 py-2 font-semibold transition-transform hover:scale-[1.03]" style={{ backgroundColor: CLASSIC_COLORS.red, color: CLASSIC_COLORS.linen, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
            <span className="relative z-10 flex min-h-0 items-center justify-center gap-2">
              <span>XÁC NHẬN THAM DỰ</span>
            </span>
          </button>
        </div>
      </div>

      {/* Guestbook Section */}
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: CLASSIC_COLORS.linen }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "70%", mixBlendMode: "color-dodge" }} />
      </div>

      <div className="w-full py-3 md:py-4" style={{ backgroundColor: CLASSIC_COLORS.red }}>
        <h2 className="text-[20px] md:text-[24px] font-bold uppercase tracking-wide text-center flex flex-col items-center" style={{ color: CLASSIC_COLORS.linen, fontFamily: '"Times New Roman", serif' }}>
          <span>Sổ lưu bút</span>
        </h2>
      </div>

      <div className="relative w-full overflow-hidden" style={{ backgroundColor: CLASSIC_COLORS.linen }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "80%", mixBlendMode: "color-dodge" }} />
        
        <section className="relative z-10 flex flex-col items-center justify-center w-full py-8 px-2 sm:px-4" style={{ color: CLASSIC_COLORS.gray }}>
          {/* Guestbook form placeholder */}
          <div className="mt-6 mx-auto w-full max-w-full md:max-w-[600px]">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="mb-4">
                <input placeholder="Nhập tên của bạn*" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none font-helvetica" type="text" />
              </div>
              <textarea placeholder="Nhập lời chúc của bạn*" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 outline-none font-helvetica" rows={4} style={{ resize: "none" }} />
              <div className="mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center text-xs space-x-1" />
                <button type="button" className="px-4 sm:px-8 py-2 sm:py-3 rounded-full text-white font-helvetica font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base" style={{ backgroundColor: CLASSIC_COLORS.red }}>
                  <span>GỬI LỜI CHÚC</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="mt-8 w-full max-h-[500px] space-y-3 overflow-y-auto pr-2 mx-auto max-w-full md:max-w-[600px]">
            <p className="text-center text-sm opacity-70 flex flex-col items-center">
              <span>Chưa có lời chúc nào. Hãy là người đầu tiên!</span>
            </p>
          </div>
        </section>
      </div>

      {/* Thank You Message */}
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: CLASSIC_COLORS.linen }}>
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "85%", mixBlendMode: "color-dodge" }} />
        
        <div className="relative z-10 py-8 text-center max-w-4xl mx-auto px-2 sm:px-4">
          <span className="whitespace-pre-line flex flex-col items-center gap-1 text-xl" style={{ color: CLASSIC_COLORS.gray, fontFamily: 'Baskerville, "Times New Roman", serif' }}>
            <span>Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!</span>
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="relative h-12 sm:h-16" style={{ backgroundColor: CLASSIC_COLORS.red }}>
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url('${CDN_URL}/double-dragon.webp')`, backgroundSize: "clamp(300px, 50vw, 500px)", backgroundPositionY: "75%" }} />
      </div>
    </div>
  );
}

function CalendarGrid({ eventDate }: { eventDate: string }) {
  const year = getYear(eventDate) || "2026";
  const month = parseInt(getMonthName(eventDate).replace("THÁNG ", "")) || 6;
  
  const firstDay = new Date(parseInt(year), month - 1, 1).getDay();
  const daysInMonth = new Date(parseInt(year), month, 0).getDate();
  const eventDay = parseInt(getDayNumber(eventDate) || "27");
  
  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay - 1; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(i);
  }

  return (
    <>
      <div className="grid grid-cols-7 border-b-2" style={{ borderColor: CLASSIC_COLORS.red }}>
        {dayLabels.map((label) => (
          <div key={label} className="text-center py-1.5 text-[10px] md:text-[11px] font-medium opacity-60">{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 px-1 py-2">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center h-[30px] md:h-[34px]">
            {day ? (
              day === eventDay ? (
                <div className="relative w-[26px] h-[24px] md:w-[30px] md:h-[28px] flex items-center justify-center">
                  <svg viewBox="0 0 24 22" className="absolute inset-0 w-full h-full drop-shadow-sm" fill={CLASSIC_COLORS.red}>
                    <path d="M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z" />
                  </svg>
                  <span className="relative z-10 text-[11px] md:text-[12px] font-bold" style={{ color: "rgb(255, 255, 255)" }}>{day}</span>
                </div>
              ) : (
                <span className="text-[12px] md:text-[13px]">{day}</span>
              )
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}