"use client";

import { useState } from "react";
import { StepHeader, StepContent } from "./wizard-components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

interface StepPreviewProps {
  data: {
    musicEnabled: boolean;
    musicUrl: string;
    rsvpEnabled: boolean;
    guestbookEnabled: boolean;
  };
  onChange: (field: string, value: boolean | string) => void;
  eventData: {
    groomName: string;
    brideName: string;
    eventDate: string;
    venueName: string;
    timeline: Array<{ time: string; title: string }>;
  };
}

export function StepPreview({ data, onChange, eventData }: StepPreviewProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="space-y-6">
      <StepHeader
        title="Xem trước & Cài đặt"
        description="Kiểm tra thiệp trước khi xuất bản"
        step={6}
        totalSteps={7}
      />

      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setPreviewMode("desktop")}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all
              ${previewMode === "desktop" ? "bg-white shadow-sm" : "hover:bg-white/50"}
            `}
          >
            <Icons.monitor className="w-4 h-4 inline mr-2" />
            Desktop
          </button>
          <button
            onClick={() => setPreviewMode("mobile")}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all
              ${previewMode === "mobile" ? "bg-white shadow-sm" : "hover:bg-white/50"}
            `}
          >
            <Icons.smartphone className="w-4 h-4 inline mr-2" />
            Mobile
          </button>
        </div>

        <Button variant="outline" size="sm">
          <Icons.copy className="w-4 h-4 mr-2" />
          Copy Link
        </Button>
      </div>

      {/* Preview Frame */}
      <Card className="overflow-hidden">
        <div className={`
          mx-auto transition-all duration-300
          ${previewMode === "desktop" ? "w-full" : "w-[375px]"}
        `}>
          {/* Phone Frame for Mobile */}
          {previewMode === "mobile" && (
            <div className="bg-muted px-4 py-2 flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              <div className="w-20 h-2 rounded-full bg-muted-foreground/20" />
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            </div>
          )}

          {/* Preview Content */}
          <div className={`
            bg-gradient-to-br from-rose-50 to-amber-50 min-h-[600px] p-6
            ${previewMode === "mobile" ? "rounded-b-xl" : ""}
          `}>
            {/* Simulated Invitation Preview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-8 text-center">
                <div className="text-4xl mb-4">囍</div>
                <h1 className="text-2xl font-semibold">
                  {eventData.groomName || "Chú rể"} & {eventData.brideName || "Cô dâu"}
                </h1>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Date */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600">
                    {eventData.eventDate ? new Date(eventData.eventDate).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    }) : "Ngày cưới"}
                  </div>
                  {eventData.venueName && (
                    <p className="text-muted-foreground mt-2">
                      <Icons.mapPin className="w-4 h-4 inline mr-1" />
                      {eventData.venueName}
                    </p>
                  )}
                </div>

                {/* Timeline Preview */}
                {eventData.timeline.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-center mb-3">Lịch trình</h3>
                    <div className="space-y-2">
                      {eventData.timeline.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-rose-600">{item.time}</span>
                          <span>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature Toggles Preview */}
                <div className="flex justify-center gap-4 pt-4 border-t">
                  {data.musicEnabled && (
                    <div className="text-center">
                      <Icons.music className="w-5 h-5 mx-auto text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Nhạc</span>
                    </div>
                  )}
                  {data.rsvpEnabled && (
                    <div className="text-center">
                      <Icons.check className="w-5 h-5 mx-auto text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">RSVP</span>
                    </div>
                  )}
                  {data.guestbookEnabled && (
                    <div className="text-center">
                      <Icons.bookOpen className="w-5 h-5 mx-auto text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Lưu bút</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <StepContent>
        <h3 className="font-medium mb-4">Cài đặt bổ sung</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icons.music className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Nhạc nền</div>
                <div className="text-sm text-muted-foreground">Phát nhạc khi mở thiệp</div>
              </div>
            </div>
            <button
              onClick={() => onChange("musicEnabled", !data.musicEnabled)}
              className={`
                relative w-12 h-6 rounded-full transition-colors
                ${data.musicEnabled ? "bg-rose-500" : "bg-muted"}
              `}
            >
              <div
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                  ${data.musicEnabled ? "left-7" : "left-1"}
                `}
              />
            </button>
          </div>

          {data.musicEnabled && (
            <div className="ml-8">
              <input
                type="url"
                value={data.musicUrl}
                onChange={(e) => onChange("musicUrl", e.target.value)}
                placeholder="URL nhạc (mp3, wav...)"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icons.check className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Xác nhận tham dự (RSVP)</div>
                <div className="text-sm text-muted-foreground">Cho phép khách xác nhận tham dự</div>
              </div>
            </div>
            <button
              onClick={() => onChange("rsvpEnabled", !data.rsvpEnabled)}
              className={`
                relative w-12 h-6 rounded-full transition-colors
                ${data.rsvpEnabled ? "bg-rose-500" : "bg-muted"}
              `}
            >
              <div
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                  ${data.rsvpEnabled ? "left-7" : "left-1"}
                `}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icons.bookOpen className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Sổ lưu bút</div>
                <div className="text-sm text-muted-foreground">Cho phép khách gửi lời chúc</div>
              </div>
            </div>
            <button
              onClick={() => onChange("guestbookEnabled", !data.guestbookEnabled)}
              className={`
                relative w-12 h-6 rounded-full transition-colors
                ${data.guestbookEnabled ? "bg-rose-500" : "bg-muted"}
              `}
            >
              <div
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                  ${data.guestbookEnabled ? "left-7" : "left-1"}
                `}
              />
            </button>
          </div>
        </div>
      </StepContent>
    </div>
  );
}