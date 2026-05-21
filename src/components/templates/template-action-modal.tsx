"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Eye, Edit3, ImageIcon, MapPin, Globe, User, Share2, ClipboardCheck, MessageCircle } from "lucide-react";

type TemplateHighlight = {
  icon: "Edit3" | "ImageIcon" | "MapPin" | "Globe" | "User" | "Share2" | "ClipboardCheck" | "MessageCircle";
  label: string;
};

type TemplateMetadata = {
  highlights?: string[];
  description?: string;
  source?: string;
  colorTokens?: Record<string, string>;
};

type Template = {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailUrl: string | null;
  description: string | null;
  isPremium: boolean;
  metadata?: unknown;
};

const iconMap = {
  Edit3,
  ImageIcon,
  MapPin,
  Globe,
  User,
  Share2,
  ClipboardCheck,
  MessageCircle,
} as const;

const categoryLabels: Record<string, string> = {
  truyen_thong: "Truyền Thống",
  thien_nhien: "Thiên Nhiên",
  hien_dai: "Hiện Đại",
  lang_man: "Lãng Mạn",
  co_phuc: "Cổ Phục",
  sang_trong: "Sang Trọng",
  toi_gian: "Tối Giản",
  typography: "Typography",
  de_thuong: "Dễ Thương",
};

const defaultHighlights: TemplateHighlight[] = [
  { icon: "Edit3", label: "Tùy chỉnh nội dung" },
  { icon: "ImageIcon", label: "Ảnh không giới hạn" },
  { icon: "MapPin", label: "Google Maps" },
  { icon: "Globe", label: "Đa ngôn ngữ" },
  { icon: "User", label: "Ghi tên khách mời" },
  { icon: "Share2", label: "Chia sẻ qua link" },
  { icon: "ClipboardCheck", label: "Xác nhận tham dự" },
  { icon: "MessageCircle", label: "Nhận lời chúc" },
];

interface TemplateActionModalProps {
  template: Template;
  onClose: () => void;
}

export function TemplateActionModal({
  template,
  onClose,
}: TemplateActionModalProps) {
  const categoryLabel = categoryLabels[template.category] ?? template.category;
  const meta = template.metadata as TemplateMetadata | undefined;
  const highlights = meta?.highlights?.slice(0, 3) ?? [];
  const topDescription = meta?.description ?? template.description ?? "";
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [handleEscape]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 [overscroll-behavior:contain] [touch-action:manipulation]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/45 cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative flex flex-row w-[900px] lg:w-[1000px] xl:w-[1100px] max-w-[90vw] h-[600px] lg:h-[680px] xl:h-[750px] max-h-[85vh] m-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/20">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg text-zinc-500 hover:text-zinc-800 transition-all duration-200 cursor-pointer border border-zinc-200/50"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-[340px] lg:w-[380px] xl:w-[420px] flex-shrink-0 p-6 lg:p-8 bg-zinc-50 overflow-hidden flex items-center justify-center">
          <div className="rounded-2xl overflow-hidden bg-white shadow-xl ring-1 ring-black/5 w-full h-full">
            <div className="relative overflow-hidden w-full h-full">
              {template.thumbnailUrl ? (
                <Image
                  src={template.thumbnailUrl}
                  alt={template.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 400px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center text-zinc-400">
                  {template.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
          <div className="overflow-y-auto flex-1">
            <div className="p-6 lg:p-8 pb-4 lg:pb-6">
              <h2 id="modal-title" className="text-2xl lg:text-3xl font-bold mb-2 pr-8">
                {template.name}
              </h2>
              <p className="text-base lg:text-lg text-zinc-500">{topDescription}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="badge badge-sm bg-white/50 border-zinc-200/30 text-zinc-600">
                  {categoryLabel}
                </span>
                {template.isPremium && (
                  <span className="badge badge-sm bg-amber-100 text-amber-700 border-amber-200/30">
                    Premium
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 lg:px-8 py-3">
              {highlights.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-zinc-500 mb-2">Điểm nổi bật</h3>
                  <ul className="space-y-2 mb-4">
                    {highlights.map((highlight, index) => (
                      <li key={index} className="text-sm text-zinc-600 leading-relaxed">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h3 className="text-sm font-medium text-zinc-500 mb-2">Tính năng</h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {defaultHighlights.map((feature) => {
                  const IconComponent = iconMap[feature.icon];
                  return (
                    <li key={feature.label} className="flex items-center gap-1.5 text-xs text-zinc-600">
                      <IconComponent className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span>{feature.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="flex-shrink-0 px-6 lg:px-8 py-4 border-t border-zinc-200/50 bg-white/80">
            <p className="text-xs text-zinc-400 tracking-wide mb-3">Tạo miễn phí · Thử 3 ngày · Đẹp mới thanh toán</p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/events/new?templateId=${template.id}`}
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer h-14 px-7 text-lg rounded-2xl bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-200/50"
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
                Tạo thiệp
              </Link>
              <Link
                href={`/invite/${template.slug}/demo`}
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer h-14 px-7 text-lg rounded-2xl bg-transparent border-2 border-rose-300 text-rose-600 hover:bg-rose-50 active:bg-rose-100"
              >
                <Eye className="w-5 h-5" aria-hidden="true" />
                Xem demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}