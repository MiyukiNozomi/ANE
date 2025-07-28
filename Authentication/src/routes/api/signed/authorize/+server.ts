import z from 'zod';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { Backend } from '$lib/server/backend-api';
import { asLocalResponse } from '$lib/server/backend';

let requestData = z.object({
    authRequestCode: z.string()
});

export const POST: RequestHandler = async ({ locals, request }) => {
    // the need for a try catch here is to ensure exceptions from zod will result in a 400 and not a 5xx
    if (!locals.sessionToken)
        return error(401);

    const obj = await requestData.safeParse(await request.json());
    if (!obj.success) {
        console.log(obj.error);
        return error(400);
    }

    const { authRequestCode } = obj.data;

    const backendResponse = await Backend.authorize(authRequestCode, locals.sessionToken);
    if (!backendResponse)
        return error(500);
    return json(asLocalResponse(backendResponse));
};