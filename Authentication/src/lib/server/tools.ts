import { redirect } from "@sveltejs/kit";

export function redirectToLoginPage(rawUrl: string) {
    const url = new URL(rawUrl);
    return redirect(302, "/sign?redir=" + encodeURI(url.pathname + "?" + url.search));
}