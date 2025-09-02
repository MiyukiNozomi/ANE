import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, request }) => {
  return json({ ok: true });
};
