const AuthAPI = require("./../index.js");

(async () => {
    const secret = '<truncated? didnt have to but still>';
    const session = '<truncated>';

    try {
        console.log(await AuthAPI.AuthAPI.eraseSession(session));
    } catch (E) {
        console.log(E);
        console.log("ohhh we handled it!");
    }

})();