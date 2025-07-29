import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Backend } from '$lib/server/backend-api';

export const POST: RequestHandler = async ({ locals, request }) => {
    if (!locals.sessionToken)
        return error(401);

    const backendRes = await Backend.deleteSingleSession(locals.sessionToken);
    if (!backendRes || backendRes.error)
        return error(500);
    return json({ ok: true });
};