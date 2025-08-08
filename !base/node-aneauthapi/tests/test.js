const AuthAPI = require("./../lib/index.js");

(async() => {
///console.log(await AuthAPI.createAuthorizationRequest("Bananananana"));

console.log(await AuthAPI.getAuthorizationRequest("baf29e45-f07a-4b67-bb37-14ffb6e7ecca"));


})()