import z from 'zod';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { Backend } from '$lib/server/backend-api';
import { asLocalResponse, MAX_SECRET_LENGTH, MIN_SECRET_LENGTH } from '$lib/server/backend';

let requestData = z.object({
    sharedSecret: z.string().min(MIN_SECRET_LENGTH).max(MAX_SECRET_LENGTH).optional(),
    authRequestCode: z.string().optional()
});

export const POST: RequestHandler = async ({ locals, request }) => {
    const obj = await requestData.safeParse(await request.json());
    if (!obj.success) {
        console.log(obj.error);
        return error(400);
    }

    const { sharedSecret, authRequestCode } = obj.data;
    if ((!sharedSecret && !authRequestCode))
        return error(400);

    const backendResponse = await Backend.getAuthorizationStatus(sharedSecret ?? undefined, authRequestCode ?? undefined);
    if (!backendResponse)
        return error(500);
    if (backendResponse.error)
        return json(backendResponse);

    return json(backendResponse.data!);
};