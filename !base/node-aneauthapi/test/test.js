const AuthAPI = require("./../index.js");

(async () => {
    const secret = '<truncated? didnt have to but still>';
    const session = '<truncated>';

    try {
        console.log(await AuthAPI.AuthAPI.getAccountById(0));
        console.log(await AuthAPI.AuthAPI.getAccountById(1));
        console.log(await AuthAPI.AuthAPI.getAccountById(2));


        console.log(await AuthAPI.AuthAPI.getAccountByName("azki"));
        console.log(await AuthAPI.AuthAPI.getAccountByName("suisei"));
        console.log(await AuthAPI.AuthAPI.getAccountByName("miyuki"));
        console.log(await AuthAPI.AuthAPI.getAccountByName("in"));
    } catch (E) {
        console.log(E);
    }

})();