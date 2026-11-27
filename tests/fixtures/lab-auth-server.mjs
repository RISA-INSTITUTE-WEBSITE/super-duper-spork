// Local Playwright-only Auth/Data API fixture. Never used by production code.
import { createServer } from "node:http";

const identities = {
  "fixture-lab-admin": "11111111-1111-4111-8111-111111111111",
  "fixture-lab-learner": "22222222-2222-4222-8222-222222222222",
};

function respondIdentity(response, id) {
  response.statusCode = id ? 200 : 401;
  response.end(
    JSON.stringify(
      id
        ? {
            id,
            email: "fixture@example.invalid",
            email_confirmed_at: "2026-01-01T00:00:00Z",
            user_metadata: { full_name: "Fixture account", role: "admin" },
          }
        : {},
    ),
  );
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:3001");
  const token = (request.headers.authorization ?? "").replace(/^Bearer /, "");
  const id = Object.hasOwn(identities, token) ? identities[token] : null;
  response.setHeader("Content-Type", "application/json");
  if (url.pathname === "/auth/v1/user") {
    respondIdentity(response, id);
    return;
  }
  if (url.pathname === "/rest/v1/risa_user_roles") {
    response.end(
      JSON.stringify(
        token === "fixture-lab-admin" && url.searchParams.get("user_id") === "eq." + id
          ? [{ role: "admin" }]
          : [],
      ),
    );
    return;
  }
  if (request.method === "GET") {
    response.end("[]");
    return;
  }
  response.statusCode = 405;
  response.end("{}");
}).listen(3001, "127.0.0.1");
