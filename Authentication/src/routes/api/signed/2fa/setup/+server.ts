import { asLocalResponse, MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from '$lib/server/backend';
import { Backend } from '$lib/server/backend-api';
import { error, json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

let requestData = z.object({
    twoFactorCode: z.string().min(6).max(6)
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

    const { twoFactorCode } = obj.data;

    const backendResponse = await Backend.twoFactorEnableFinalStep(twoFactorCode, locals.sessionToken);
    if (!backendResponse)
        return error(500);
    return json(asLocalResponse(backendResponse));
};