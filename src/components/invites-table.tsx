"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SendInvitesDialog } from "@/components/send-invites-dialog";
import { toast } from "sonner";

interface InviteWithGuest {
  id: string;
  inviteCode: string;
  inviteUrl: string;
  status: string;
  guestName: string;
  guestEmail: string | null;
}

interface InvitesTableProps {
  eventId: string;
  initialInvites: InviteWithGuest[];
}

export function InvitesTable({ eventId, initialInvites }: InvitesTableProps) {
  const [invites] = useState(initialInvites);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSendDialog, setShowSendDialog] = useState(false);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === invites.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invites.map((i) => i.id)));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {selectedIds.size} selected
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSendDialog(true)}
            disabled={selectedIds.size === 0}
          >
            Send Invites
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="w-10 py-3 px-4">
                <Checkbox
                  checked={
                    invites.length > 0 && selectedIds.size === invites.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="text-left py-3 px-4">Guest</th>
              <th className="text-left py-3 px-4">Code</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Link</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite.id} className="border-b last:border-0">
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedIds.has(invite.id)}
                    onCheckedChange={() => toggleSelect(invite.id)}
                  />
                </td>
                <td className="py-3 px-4">
                  <div>{invite.guestName}</div>
                  {invite.guestEmail && (
                    <div className="text-xs text-muted-foreground">
                      {invite.guestEmail}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-xs">
                  {invite.inviteCode}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                      invite.status === "responded"
                        ? "bg-green-100 text-green-700"
                        : invite.status === "opened"
                          ? "bg-blue-100 text-blue-700"
                          : invite.status === "sent"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {invite.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <a
                    href={invite.inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:underline"
                  >
                    Open
                  </a>
                </td>
              </tr>
            ))}
            {invites.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-zinc-500">
                  No invites yet. Import guests to create invites.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SendInvitesDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        eventId={eventId}
        selectedInviteIds={Array.from(selectedIds)}
        onSent={() => {
          setSelectedIds(new Set());
          toast.success("Invitations sent");
        }}
      />
    </div>
  );
}