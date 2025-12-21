import z from "zod";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { Backend } from "$lib/server/services";
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  USERNAME_SAFETY_REGEX,
} from "$lib/shared/safety";
import { dev } from "$app/environment";

let requestData = z.object({
  username: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const POST: RequestHandler = async ({ locals, request }) => {
  const obj = await requestData.safeParse(await request.json());
  if (!obj.success) {
    console.log(obj.error);
    return error(400);
  }

  const { username, password } = obj.data;
  if (!USERNAME_SAFETY_REGEX.test(username)) return error(400);

  const res = await Backend.register(username, password);

  if (dev) console.log(res);
  return json(res);
};
