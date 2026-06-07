import "./lib/error-capture";

import { Hono } from "hono";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import apiRoutes from "./api/routes";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Create main Hono app
const app = new Hono();

// Mount API routes
app.route("/", apiRoutes);

// Mount TanStack Start SSR for all other routes
app.all("*", async (c) => {
  try {
    const handler = await getServerEntry();
    let executionCtx: unknown = undefined;
    try {
      executionCtx = (c as any).executionCtx;
    } catch {
      // ignore when executionCtx is unavailable in this runtime
    }
    const response = await handler.fetch(c.req.raw, c.env, executionCtx);
    return await normalizeCatastrophicSsrResponse(response);
  } catch (error) {
    console.error(error);
    return c.text(renderErrorPage(), 500, { "content-type": "text/html; charset=utf-8" });
  }
});

export default app;
