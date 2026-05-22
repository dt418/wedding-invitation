"use client";

import { StepHeader, StepContent } from "./wizard-components";
import { Icons } from "@/components/ui/icons";
import { ceremonyTypes } from "@/lib/schemas/event-wizard-schema";

interface StepEventDetailsProps {
  data: {
    eventDate: string;
    eventTime: string;
    ceremonyType: string;
    venueName: string;
    venueAddress: string;
    mapUrl: string;
  };
  onChange: (field: string, value: unknown) => void;
}

export function StepEventDetails({ data, onChange }: StepEventDetailsProps) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Chi tiết sự kiện"
        description="Ngày giờ và địa điểm tổ chức tiệc cưới"
        step={2}
        totalSteps={7}
      />

      <StepContent>
        <div className="space-y-6">
          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Ngày cưới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Icons.calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={data.eventDate}
                  onChange={(e) => onChange("eventDate", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Giờ khai tiệc</label>
              <div className="relative">
                <Icons.clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="time"
                  value={data.eventTime}
                  onChange={(e) => onChange("eventTime", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Ceremony Type */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Loại lễ</label>
            <select
              value={data.ceremonyType}
              onChange={(e) => onChange("ceremonyType", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Chọn loại lễ</option>
              {ceremonyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Venue */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium flex items-center gap-2">
              <Icons.mapPin className="w-4 h-4 text-rose-600" />
              Địa điểm tiệc
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Tên nhà hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.venueName}
                onChange={(e) => onChange("venueName", e.target.value)}
                placeholder="Nhà hàng Hoa Sen"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Địa chỉ</label>
              <textarea
                value={data.venueAddress}
                onChange={(e) => onChange("venueAddress", e.target.value)}
                placeholder="123 Đường ABC, Phường X, Quận Y, TP HCM"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Google Maps URL</label>
              <div className="relative">
                <Icons.link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="url"
                  value={data.mapUrl}
                  onChange={(e) => onChange("mapUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Map Preview */}
            {data.mapUrl && (
              <div className="mt-4 rounded-lg overflow-hidden border">
                <iframe
                  src={data.mapUrl.replace("/maps/d/", "/maps/embed/")}
                  className="w-full h-48"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      </StepContent>
    </div>
  );
}