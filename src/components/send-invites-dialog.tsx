"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { translations, type Locale } from "@/lib/i18n";

function getLocale(): Locale {
  if (typeof document === "undefined") return "vi";
  const match = document.cookie.match(/locale=([^;]+)/);
  return (match?.[1] as Locale) || "vi";
}

interface SendInvitesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  selectedInviteIds: string[];
  onSent: () => void;
}

type Channel = "zalo_bot" | "zalo_mini_app" | "email" | "messenger";
type ZaloChannel = "mini_app" | "bot" | "hybrid";

export function SendInvitesDialog({
  open,
  onOpenChange,
  eventId,
  selectedInviteIds,
  onSent,
}: SendInvitesDialogProps) {
  const [channel, setChannel] = useState<Channel>("zalo_bot");
  const [zaloChannel, setZaloChannel] = useState<ZaloChannel>("hybrid");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);

    try {
      const response = await fetch(`/api/events/${eventId}/invites/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteIds: selectedInviteIds,
          channel,
          zaloChannel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invites");
      }

      const t = translations[getLocale()].toasts;
      toast.success(
        t.invitationsSent.replace("{count}", String(data.successCount))
      );
      onSent();
      onOpenChange(false);
    } catch (error) {
      const t = translations[getLocale()].toasts;
      toast.error(
        error instanceof Error ? error.message : t.failedToSend
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gui thiep moi</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Kenh gui</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v) => setChannel(v as Channel)}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="zalo_bot" id="zalo" />
                <Label htmlFor="zalo" className="cursor-pointer flex-1">
                  <div className="font-medium">Zalo</div>
                  <div className="text-sm text-muted-foreground">Gui qua Zalo OA</div>
                </Label>
                <span className="text-2xl">💬</span>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="cursor-pointer flex-1">
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">Gui qua email</div>
                </Label>
                <span className="text-2xl">📧</span>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="messenger" id="messenger" />
                <Label htmlFor="messenger" className="cursor-pointer flex-1">
                  <div className="font-medium">Messenger</div>
                  <div className="text-sm text-muted-foreground">Chia se qua Facebook</div>
                </Label>
                <span className="text-2xl">💬</span>
              </div>
            </RadioGroup>
          </div>

          {channel === "zalo_bot" && (
            <div>
              <Label className="text-base font-medium">Loai Zalo</Label>
              <RadioGroup
                value={zaloChannel}
                onValueChange={(v) => setZaloChannel(v as ZaloChannel)}
                className="mt-3 space-y-2"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="mini_app" id="mini_app" />
                  <Label htmlFor="mini_app" className="cursor-pointer">Zalo Mini App</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="bot" id="bot" />
                  <Label htmlFor="bot" className="cursor-pointer">Zalo Bot (Deep Link)</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="hybrid" id="hybrid" />
                  <Label htmlFor="hybrid" className="cursor-pointer">Hybrid (Ca hai)</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground">So luong</div>
            <div className="text-2xl font-bold">{selectedInviteIds.length} thiep</div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Huy
            </Button>
            <Button
              className="flex-1"
              onClick={handleSend}
              disabled={sending || selectedInviteIds.length === 0}
            >
              {sending ? "Dang gui..." : "Gui ngay"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}