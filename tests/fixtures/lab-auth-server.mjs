// Local Playwright-only Auth/Data API fixture. Never used by production code.
import { createServer } from "node:http";

const identities = {
  "fixture-lab-admin": "11111111-1111-4111-8111-111111111111",
  "fixture-lab-learner": "22222222-2222-4222-8222-222222222222",
};

const studioModules = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    code: "MAT101",
    slug: "mat101",
    title: "Fixture Mathematics",
    programme_slug: "fixture-maths",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    code: "DVE101",
    slug: "dve101",
    title: "Fixture DevOps",
    programme_slug: "fixture-devops",
  },
].map((module) => ({
  ...module,
  description: "",
  level: "1st Year Level",
  is_published: true,
  created_at: "2026-01-01T00:00:00Z",
  thumbnail_path: null,
}));

const studioTopics = [
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    course_id: studioModules[0].id,
    title: "Fixture functions",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    course_id: studioModules[1].id,
    title: "Fixture Linux",
  },
].map((topic) => ({ ...topic, description: "", is_published: true }));

function studioRows(url) {
  switch (url.pathname) {
    case "/rest/v1/risa_programmes":
      return [
        { slug: "fixture-maths", title: "Mathematics" },
        { slug: "fixture-devops", title: "Cloud & DevOps" },
      ].map((programme) => ({ ...programme, description: "", is_published: true }));
    case "/rest/v1/risa_courses":
      return studioModules;
    case "/rest/v1/risa_course_topics":
      return studioTopics.filter(
        (topic) => url.searchParams.get("course_id") === "eq." + topic.course_id,
      );
    case "/rest/v1/risa_study_notes":
      return studioTopics
        .filter((topic) => url.searchParams.get("topic_id") === "eq." + topic.id)
        .map((topic) => ({
          id: topic.id,
          topic_id: topic.id,
          title: topic.title + " note",
          markdown: "# " + topic.title,
          is_published: false,
          updated_at: "2026-01-01T00:00:00Z",
        }));
    default:
      return [];
  }
}

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
    response.end(JSON.stringify(token === "fixture-lab-admin" ? studioRows(url) : []));
    return;
  }
  response.statusCode = 405;
  response.end("{}");
}).listen(3001, "127.0.0.1");
