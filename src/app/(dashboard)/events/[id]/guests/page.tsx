"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";

interface Result {
  total: number;
  successCount: number;
  failedCount: number;
  successRows: Array<{ row: number; name: string; inviteCode: string; inviteUrl: string }>;
  failedRows: Array<{ row: number; name?: string; error: string }>;
}

export default function GuestsPage() {
  const { id } = useParams<{ id: string }>();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/events/${id}/guests/import`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (res.ok) {
      setResult(await res.json());
    } else {
      const data = await res.json();
      alert(data.error || "Import failed");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-2">Import Guests</h1>
      <p className="text-zinc-500 mb-8">Upload CSV or XLSX file with guest list</p>

      <form onSubmit={handleImport} className="bg-white p-6 rounded-xl border mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Guest File (CSV)</label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx"
            required
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-rose-50 file:text-rose-700 file:font-medium hover:file:bg-rose-100"
          />
        </div>

        <div className="text-sm text-zinc-500 mb-4">
          <p className="font-medium mb-1">Expected columns:</p>
          <code className="text-xs bg-zinc-100 px-2 py-1 rounded">
            name, email, phone, relation, tableNumber, seatCount, groupName, notes
          </code>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {uploading ? "Importing..." : "Import Guests"}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-700">{result.successCount}</p>
              <p className="text-sm text-green-600">Imported</p>
            </div>
            <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-700">{result.failedCount}</p>
              <p className="text-sm text-red-600">Failed</p>
            </div>
            <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-zinc-700">{result.total}</p>
              <p className="text-sm text-zinc-600">Total rows</p>
            </div>
          </div>

          {result.failedRows.length > 0 && (
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-medium mb-3">Failed Rows</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Row</th>
                      <th className="text-left py-2 px-3">Name</th>
                      <th className="text-left py-2 px-3">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failedRows.map((r) => (
                      <tr key={r.row} className="border-b last:border-0">
                        <td className="py-2 px-3 text-zinc-500">{r.row}</td>
                        <td className="py-2 px-3">{r.name || "—"}</td>
                        <td className="py-2 px-3 text-red-600">{r.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
