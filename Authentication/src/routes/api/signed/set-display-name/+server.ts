import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from '$lib/server/backend';
import { Backend } from '$lib/server/backend-api';
import { error, json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

let requestData = z.object({
    displayName: z.string().min(MIN_USERNAME_LENGTH).max(MAX_USERNAME_LENGTH)
});

export const POST: RequestHandler = async ({ locals, request }) => {
    if (!locals.sessionToken) {
        return error(401);
    }

    const obj = await requestData.safeParse(await request.json());
    if (!obj.success) {
        console.log(obj.error);
        return error(400);
    }

    const { displayName } = obj.data;

    const backendResponse = await Backend.setDisplayName(displayName, locals.sessionToken);
    if (!backendResponse || backendResponse.error)
        return error(500);
    return json({ ok: true });
};