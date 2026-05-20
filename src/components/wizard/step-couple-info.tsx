"use client";

import { useState } from "react";
import { StepHeader, StepContent } from "./wizard-components";
import { Icons } from "@/components/ui/icons";

interface StepCoupleInfoProps {
  data: {
    groomName: string;
    brideName: string;
    groomFather: string;
    groomMother: string;
    brideFather: string;
    brideMother: string;
    groomAddress: string;
    brideAddress: string;
  };
  onChange: (field: string, value: string) => void;
}

export function StepCoupleInfo({ data, onChange }: StepCoupleInfoProps) {
  const [showParents, setShowParents] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);

  return (
    <div className="space-y-6">
      <StepHeader
        title="Thông tin cặp đôi"
        description="Nhập tên cô dâu và chú rể"
        step={1}
        totalSteps={7}
      />

      <StepContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Groom Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <Icons.user className="w-5 h-5" />
              <h3 className="font-medium">Chú rể</h3>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Họ tên chú rể <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.groomName}
                onChange={(e) => onChange("groomName", e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Bride Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <Icons.user className="w-5 h-5" />
              <h3 className="font-medium">Cô dâu</h3>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Họ tên cô dâu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.brideName}
                onChange={(e) => onChange("brideName", e.target.value)}
                placeholder="Trần Thị B"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Parents Section */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={() => setShowParents(!showParents)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.users className="w-4 h-4" />
              <span className="text-sm font-medium">Thông tin cha mẹ (tùy chọn)</span>
            </div>
            <Icons.chevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${showParents ? "rotate-180" : ""}`}
            />
          </button>

          {showParents && (
            <div className="mt-4 grid md:grid-cols-2 gap-6">
              {/* Groom Parents */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Nhà trai</h4>
                <input
                  type="text"
                  value={data.groomFather}
                  onChange={(e) => onChange("groomFather", e.target.value)}
                  placeholder="Ông Nguyễn Văn X"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="text"
                  value={data.groomMother}
                  onChange={(e) => onChange("groomMother", e.target.value)}
                  placeholder="Bà Nguyễn Thị Y"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Bride Parents */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Nhà gái</h4>
                <input
                  type="text"
                  value={data.brideFather}
                  onChange={(e) => onChange("brideFather", e.target.value)}
                  placeholder="Ông Trần Văn Z"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="text"
                  value={data.brideMother}
                  onChange={(e) => onChange("brideMother", e.target.value)}
                  placeholder="Bà Trần Thị W"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Addresses Section */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={() => setShowAddresses(!showAddresses)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icons.mapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Địa chỉ (tùy chọn)</span>
            </div>
            <Icons.chevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${showAddresses ? "rotate-180" : ""}`}
            />
          </button>

          {showAddresses && (
            <div className="mt-4 grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Địa chỉ nhà trai</label>
                <textarea
                  value={data.groomAddress}
                  onChange={(e) => onChange("groomAddress", e.target.value)}
                  placeholder="123 Đường ABC, Phường X, Quận Y, TP HCM"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Địa chỉ nhà gái</label>
                <textarea
                  value={data.brideAddress}
                  onChange={(e) => onChange("brideAddress", e.target.value)}
                  placeholder="456 Đường DEF, Phường Y, Quận Z, TP HCM"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </StepContent>
    </div>
  );
}