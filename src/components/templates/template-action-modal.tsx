"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Eye, Edit3, ImageIcon, MapPin, Globe, User, Share2, ClipboardCheck, MessageCircle } from "lucide-react";

type Template = {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnailUrl: string | null;
  description: string | null;
  isPremium: boolean;
};

interface TemplateActionModalProps {
  template: Template;
  categoryLabel: string;
  onClose: () => void;
}

const features = [
  { icon: Edit3, label: "Tùy chỉnh nội dung" },
  { icon: ImageIcon, label: "Ảnh không giới hạn" },
  { icon: MapPin, label: "Google Maps" },
  { icon: Globe, label: "Đa ngôn ngữ" },
  { icon: User, label: "Ghi tên khách mời" },
  { icon: Share2, label: "Chia sẻ qua link" },
  { icon: ClipboardCheck, label: "Xác nhận tham dự" },
  { icon: MessageCircle, label: "Nhận lời chúc" },
];

export function TemplateActionModal({
  template,
  categoryLabel,
  onClose,
}: TemplateActionModalProps) {
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative flex flex-row w-[900px] lg:w-[1000px] xl:w-[1100px] max-w-[90vw] h-[600px] lg:h-[680px] xl:h-[750px] max-h-[85vh] m-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/20">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
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
                  width={400}
                  height={812}
                  className="w-full h-auto object-cover object-top"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center text-zinc-400">
                  {template.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0 bg-zinc-50 overflow-y-auto">
          <div className="flex-shrink-0 p-6 lg:p-8 pb-4 lg:pb-6">
            <h2 id="modal-title" className="text-2xl lg:text-3xl font-bold mb-2 pr-8">
              {template.name}
            </h2>
            <p className="text-base lg:text-lg text-zinc-500">{template.description}</p>
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
            <h3 className="text-sm font-medium text-zinc-500 mb-2">Tính năng</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {features.map((feature) => (
                <li key={feature.label} className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <feature.icon className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1" />

          <div className="flex-shrink-0 px-6 lg:px-8 pb-6 lg:pb-8">
            <p className="text-xs text-zinc-400 tracking-wide mb-1">Tạo miễn phí · Thử 3 ngày · Đẹp mới thanh toán</p>
            <p className="text-xs text-zinc-300 mb-3">Bạn có thể đổi mẫu bất cứ lúc nào khi chỉnh sửa</p>
            <div className="flex gap-3">
              <Link
                href={`/events/new?templateId=${template.id}`}
                className="btn btn-primary rounded-xl flex-1 gap-2"
              >
                <Plus className="w-5 h-5" />
                Tạo thiệp
              </Link>
              <Link
                href={`/invite/${template.slug}/demo`}
                className="btn btn-outline rounded-xl flex-1 gap-2"
              >
                <Eye className="w-5 h-5" />
                Xem demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}