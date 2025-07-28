import z from 'zod';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { Backend } from '$lib/server/backend-api';

const requestData = z.object({
    sharedSecret: z.string().min(4).max(256),
    realm: z.string().min(1).max(256)
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