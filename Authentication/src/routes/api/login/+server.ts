import z from 'zod';
import type { RequestHandler } from './$types';
import { asLocalResponse, DB_Errors, isUsernameValid, MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MIN_USERNAME_LENGTH, translateDatabaseError } from '$lib/server/backend';
import { error, json } from '@sveltejs/kit';
import { Backend } from '$lib/server/backend-api';

let requestData = z.object({
    username: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    totpCode: z.string().min(6).max(6).optional()
});

export const POST: RequestHandler = async ({ locals, request }) => {
    const obj = await requestData.safeParse(await request.json());
    if (!obj.success) {
        console.log(obj.error);
        return error(400);
    }
    const { username, password, totpCode } = obj.data;
    if (!isUsernameValid(username))
        return error(400);

    const backendResponse = await Backend.login(username, password, totpCode ?? undefined);
    if (!backendResponse)
        return error(500);
    return json(asLocalResponse(backendResponse));
};