import { asLocalResponse, isUsernameValid, MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from '$lib/server/backend';
import { Backend } from '$lib/server/backend-api';
import { error, json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

let requestData = z.object({
    username: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH).optional(),
    accountId: z.number().optional()
});

export const POST: RequestHandler = async ({ locals, request }) => {
    const { username, accountId } = await requestData.parseAsync(await request.json());
    if ((!username && !accountId) || (username && !isUsernameValid(username)))
        return error(400);

    const backendResponse = await Backend.getAccount(username ?? undefined, accountId ?? undefined);
    if (!backendResponse)
        return error(500);
    return json(asLocalResponse(backendResponse));
};