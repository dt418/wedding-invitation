"use client";

import { useState } from "react";
import { Camera, User, Bell, Shield, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer group">
      <div className="flex-1 min-w-0">
        <span className="block text-base font-medium text-zinc-900 group-hover:text-zinc-700 transition-colors">
          {label}
        </span>
        {description && (
          <span className="block text-sm text-zinc-500 mt-0.5">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2
          ${checked ? "bg-rose-600" : "bg-zinc-200"}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0
            transition-transform duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    emailGuest: true,
    emailRsvp: true,
    emailReminder: false,
    browserGuest: false,
    browserRsvp: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="text-zinc-500 mt-1">
          Manage your account preferences and notifications.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-100">
              <User className="w-5 h-5 text-rose-600" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Profile</h2>
              <p className="text-sm text-zinc-500">Your personal information</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center"
                aria-label="Avatar preview"
              >
                <span className="text-2xl font-medium text-rose-600">T</span>
              </div>
              <button
                type="button"
                aria-label="Upload new avatar"
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors"
              >
                <Camera className="w-4 h-4 text-zinc-500" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-zinc-900">Thanh Nguyen</p>
              <p className="text-sm text-zinc-500">demo@wedding.local</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="text-sm font-medium text-zinc-700">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                defaultValue="Thanh Nguyen"
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900
                  placeholder:text-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
                  hover:border-zinc-300 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                defaultValue="demo@wedding.local"
                autoComplete="email"
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900
                  placeholder:text-zinc-400
                  focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
                  hover:border-zinc-300 transition-colors"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100">
              <Bell className="w-5 h-5 text-amber-600" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Notifications</h2>
              <p className="text-sm text-zinc-500">Control how you receive updates</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-600 uppercase tracking-wide">
              Email notifications
            </h3>
            <div className="space-y-4">
              <Toggle
                label="Guest RSVPs"
                description="Get notified when guests respond to invitations"
                checked={notifications.emailGuest}
                onChange={(v) => setNotifications((n) => ({ ...n, emailGuest: v }))}
              />
              <Toggle
                label="New RSVPs"
                description="Receive alerts for new RSVP submissions"
                checked={notifications.emailRsvp}
                onChange={(v) => setNotifications((n) => ({ ...n, emailRsvp: v }))}
              />
              <Toggle
                label="Event reminders"
                description="Get reminders before your events start"
                checked={notifications.emailReminder}
                onChange={(v) => setNotifications((n) => ({ ...n, emailReminder: v }))}
              />
            </div>
          </div>
          <div className="border-t border-zinc-100 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-600 uppercase tracking-wide">
              Browser notifications
            </h3>
            <div className="space-y-4">
              <Toggle
                label="Guest RSVPs"
                description="Show desktop notifications for new RSVPs"
                checked={notifications.browserGuest}
                onChange={(v) => setNotifications((n) => ({ ...n, browserGuest: v }))}
              />
              <Toggle
                label="RSVP confirmations"
                description="Confirm when guests confirm attendance"
                checked={notifications.browserRsvp}
                onChange={(v) => setNotifications((n) => ({ ...n, browserRsvp: v }))}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </CardFooter>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
              <Shield className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Security</h2>
              <p className="text-sm text-zinc-500">Password and login settings</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3">
            <div className="min-w-0 pr-4">
              <span className="block text-base font-medium text-zinc-900">Password</span>
              <span className="block text-sm text-zinc-500 mt-0.5">Last changed 30 days ago</span>
            </div>
            <Button variant="outline" size="sm">
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100">
              <Trash2 className="w-5 h-5 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-red-600">Danger zone</h2>
              <p className="text-sm text-zinc-500">Irreversible actions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3">
            <div className="min-w-0 pr-4">
              <span className="block text-base font-medium text-zinc-900">Delete account</span>
              <span className="block text-sm text-zinc-500 mt-0.5">
                Permanently remove your account and all data. This cannot be undone.
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}