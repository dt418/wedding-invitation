import { NextRequest } from "next/server";
import { db } from "@/db";
import { inviteSendJobs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("wedding_token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: eventId } = await params;
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      sendEvent({ type: "connected", jobId, eventId });

      const pollInterval = setInterval(async () => {
        if (jobId) {
          const job = await db.query.inviteSendJobs.findFirst({
            where: eq(inviteSendJobs.id, jobId),
          });

          if (job) {
            sendEvent({
              type: "job_progress",
              jobId,
              status: job.status,
              successCount: job.successCount,
              failedCount: job.failedCount,
              totalCount: job.totalCount,
            });

            if (job.status === "completed" || job.status === "failed") {
              clearInterval(pollInterval);
              controller.close();
            }
          }
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(pollInterval);
        controller.close();
      }, 300000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}