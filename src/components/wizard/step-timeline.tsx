"use client";

import { StepHeader, StepContent } from "./wizard-components";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { timelineTypes } from "@/lib/schemas/event-wizard-schema";

interface TimelineItem {
  time: string;
  type: string;
  title: string;
  description: string;
}

interface StepTimelineProps {
  data: TimelineItem[];
  onChange: (data: TimelineItem[]) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  arrival: <Icons.users className="w-4 h-4" />,
  ceremony: <Icons.heart className="w-4 h-4" />,
  reception: <Icons.utensils className="w-4 h-4" />,
  cake: <Icons.cake className="w-4 h-4" />,
  dance: <Icons.music className="w-4 h-4" />,
  end: <Icons.check className="w-4 h-4" />,
  custom: <Icons.star className="w-4 h-4" />,
};

export function StepTimeline({ data, onChange }: StepTimelineProps) {
  const defaultItems: TimelineItem[] = [
    { time: "17:00", type: "arrival", title: "Đón khách", description: "Tiếp đón khách mời" },
    { time: "18:00", type: "ceremony", title: "Lễ nghi", description: "Lễ thành hôn" },
    { time: "18:30", type: "reception", title: "Khai tiệc", description: "Bắt đầu tiệc cưới" },
    { time: "21:00", type: "end", title: "Kết thúc", description: "Kết thúc tiệc" },
  ];
  const items = data.length > 0 ? data : defaultItems;

  const addItem = () => {
    onChange([...items, { time: "19:00", type: "custom", title: "Hoạt động mới", description: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof TimelineItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    ) {
      return;
    }
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onChange(newItems);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Lịch trình ngày cưới"
        description="Thêm các hoạt động trong ngày cưới để khách mời biết thời gian"
        step={3}
        totalSteps={7}
      />

      <StepContent>
        <div className="space-y-4">
          {/* Timeline Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 bg-muted/50 rounded-lg border group"
              >
                {/* Time Input */}
                <div className="w-24 shrink-0">
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => updateItem(index, "time", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-center font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Type & Title */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(index, "type", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {timelineTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder="Tiêu đề hoạt động"
                    className="px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Description */}
                <div className="w-48 shrink-0">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Mô tả (tùy chọn)"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                  >
                    <Icons.arrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === items.length - 1}
                  >
                    <Icons.arrowDown className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Icons.trash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          {items.length < 10 && (
            <Button
              variant="outline"
              onClick={addItem}
              className="w-full border-dashed"
            >
              <Icons.plus className="w-4 h-4 mr-2" />
              Thêm hoạt động
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            {items.length}/10 hoạt động
          </p>
        </div>
      </StepContent>

      {/* Timeline Preview */}
      <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-lg border border-rose-100">
        <h4 className="text-sm font-medium mb-3">Xem trước lịch trình</h4>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                {TYPE_ICONS[item.type] || TYPE_ICONS.custom}
              </div>
              <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-rose-600">{item.time}</span>
                  <span className="font-medium">{item.title}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
              {index < items.length - 1 && (
                <div className="absolute left-6 w-px h-4 bg-rose-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}