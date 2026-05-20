"use client";

import { useState } from "react";
import { StepHeader, StepContent } from "./wizard-components";
import { Icons } from "@/components/ui/icons";
import { DEFAULT_THANK_YOU } from "@/lib/schemas/event-wizard-schema";

interface StepMessagesProps {
  data: {
    thankYouNote: string;
    groomBank: string;
    groomAccount: string;
    brideBank: string;
    brideAccount: string;
  };
  onChange: (field: string, value: string) => void;
}

export function StepMessages({ data, onChange }: StepMessagesProps) {
  const [showBankInfo, setShowBankInfo] = useState(!!(data.groomBank || data.brideBank));

  return (
    <div className="space-y-6">
      <StepHeader
        title="Lời nhắn & Thông tin ngân hàng"
        description="Lời cảm ơn và thông tin nhận mừng cưới"
        step={5}
        totalSteps={7}
      />

      <StepContent>
        <div className="space-y-6">
          {/* Thank You Note */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Lời cảm ơn
            </label>
            <textarea
              value={data.thankYouNote || DEFAULT_THANK_YOU}
              onChange={(e) => onChange("thankYouNote", e.target.value)}
              placeholder="Cảm ơn quý khách đã đến chia vui cùng chúng tôi..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lời cảm ơn sẽ hiển thị ở cuối thiệp cưới
            </p>
          </div>

          {/* Bank Info Section */}
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.creditCard className="w-5 h-5 text-rose-600" />
                <h3 className="font-medium">Thông tin ngân hàng</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tùy chọn</span>
                <button
                  onClick={() => setShowBankInfo(!showBankInfo)}
                  className="text-rose-600 text-sm hover:underline"
                >
                  {showBankInfo ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            {showBankInfo && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Thêm thông tin tài khoản để khách mời chuyển khoản mừng cưới
                </p>

                {/* Groom Bank */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3 text-rose-600">
                    <Icons.user className="w-4 h-4" />
                    <span className="font-medium">Chú rể</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Ngân hàng</label>
                      <input
                        type="text"
                        value={data.groomBank}
                        onChange={(e) => onChange("groomBank", e.target.value)}
                        placeholder="Vietcombank"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        value={data.groomAccount}
                        onChange={(e) => onChange("groomAccount", e.target.value)}
                        placeholder="1234567890"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bride Bank */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3 text-rose-600">
                    <Icons.user className="w-4 h-4" />
                    <span className="font-medium">Cô dâu</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Ngân hàng</label>
                      <input
                        type="text"
                        value={data.brideBank}
                        onChange={(e) => onChange("brideBank", e.target.value)}
                        placeholder="Vietcombank"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        value={data.brideAccount}
                        onChange={(e) => onChange("brideAccount", e.target.value)}
                        placeholder="0987654321"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Icons.lock className="w-3 h-3" />
                  Thông tin được mã hóa và chỉ hiển thị cho khách mời đã xác nhận
                </p>
              </div>
            )}
          </div>
        </div>
      </StepContent>
    </div>
  );
}