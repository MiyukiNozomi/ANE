import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
    if (!locals.sessionToken)
        return error(401);
    return json(locals.account!);
};