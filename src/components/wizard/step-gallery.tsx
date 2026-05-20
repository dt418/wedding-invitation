"use client";

import { useState, useRef } from "react";
import { StepHeader, StepContent } from "./wizard-components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

interface GalleryItem {
  url: string;
  caption: string;
}

interface StepGalleryProps {
  data: GalleryItem[];
  onChange: (data: GalleryItem[]) => void;
}

export function StepGallery({ data, onChange }: StepGalleryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newItems: GalleryItem[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newItems.push({
            url: e.target?.result as string,
            caption: "",
          });
          if (newItems.length === files.length) {
            onChange([...data, ...newItems]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const addFromUrl = (url: string) => {
    if (url.trim()) {
      onChange([...data, { url: url.trim(), caption: "" }]);
    }
  };

  const updateItem = (index: number, field: keyof GalleryItem, value: string) => {
    const newItems = [...data];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Album ảnh cưới"
        description="Thêm ảnh cưới để khách mời xem những khoảnh khắc đẹp"
        step={4}
        totalSteps={7}
      />

      {/* Upload Area */}
      <StepContent>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging ? "border-rose-500 bg-rose-50" : "border-muted-foreground/25 hover:border-rose-300 hover:bg-muted/50"}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <Icons.upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">Kéo thả ảnh vào đây</p>
          <p className="text-sm text-muted-foreground mt-1">hoặc click để chọn file</p>
        </div>

        {/* URL Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="url"
            placeholder="Hoặc dán URL ảnh..."
            className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addFromUrl((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => {
              const input = document.querySelector('input[placeholder="Hoặc dán URL ảnh..."]') as HTMLInputElement;
              if (input?.value) {
                addFromUrl(input.value);
                input.value = "";
              }
            }}
          >
            Thêm
          </Button>
        </div>
      </StepContent>

      {/* Gallery Grid */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((item, index) => (
            <Card
              key={index}
              className="overflow-hidden group relative"
            >
              <div className="aspect-square relative bg-muted">
                {item.url.startsWith("data:") ? (
                  // Base64 image
                  <img
                    src={item.url}
                    alt={item.caption || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : item.url ? (
                  // URL image
                  <img
                    src={item.url}
                    alt={item.caption || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).className = "hidden";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icons.image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => removeItem(index)}
                    className="bg-white hover:bg-red-50 hover:text-red-500"
                  >
                    <Icons.trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Caption */}
              <div className="p-2">
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) => updateItem(index, "caption", e.target.value)}
                  placeholder="Chú thích..."
                  className="w-full px-2 py-1 text-xs rounded border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Icons.image className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có ảnh nào</p>
          <p className="text-sm">Thêm ảnh cưới để hiển thị trên thiệp</p>
        </div>
      )}
    </div>
  );
}