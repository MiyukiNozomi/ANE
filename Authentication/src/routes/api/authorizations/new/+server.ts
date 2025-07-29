import z from 'zod';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { Backend } from '$lib/server/backend-api';
import { MAX_REALM_LENGTH, MAX_SECRET_LENGTH, MIN_REALM_LENGTH, MIN_SECRET_LENGTH } from '$lib/server/backend';

const requestData = z.object({
    sharedSecret: z.string().min(MIN_SECRET_LENGTH).max(MAX_SECRET_LENGTH),
    realm: z.string().min(MIN_REALM_LENGTH).max(MAX_REALM_LENGTH)
});

export const POST: RequestHandler = async ({ request }) => {
    const obj = await requestData.safeParse(await request.json());
    if (!obj.success) {
        return error(400);
    }

    const { sharedSecret, realm } = obj.data;

    const res = await Backend.newAuthorizationRequest(sharedSecret, realm);

    if (!res || res.error)
        return error(500);

    return json(res.data!);
};