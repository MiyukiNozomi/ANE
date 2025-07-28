module ane.http.endpoints.authorizations;

import std.json;

import ane.db;

import ane.http.params;
import ane.http.message;

import ane.auth.account;
import ane.auth.session;
import ane.auth.authorizations;

void requestAuthorizationEndpoint(Database db, HttpServerResponse response, HttpIncomingMessage message)
{

    string sharedSecret;
    string realm;

    validateParameters(message, (json) {
        sharedSecret = json.getStringSafe("shared-secret");
        realm = json.getStringSafe("realm");
    });

    auto rq = getAuthorizationRequest(db, sharedSecret);
    if (rq !is null)
        throw new HttpException(400, "重複申請 「Duplicate Requisition」");

    string id = createAuthorizationRequest(db, sharedSecret, realm);

    response.jsonMessage([
        "request-code": id
    ]);
}

void getAuthorizationStatusEndpoint(Database db, HttpServerResponse response, HttpIncomingMessage message)
{

    string sharedSecret;
    string requestCode;

    validateParameters(message, (json) {
        sharedSecret = json.getStringSafe("shared-secret", ("request-code" in json) is null);
        requestCode = json.getStringSafe("request-code", ("shared-secret" in json) is null);
    });

    bool isFromRequestCode = requestCode !is null && requestCode.length > 0;

    ThirdPartySessionRequest requesition = (isFromRequestCode) ?
        getAuthorizationRequestByCode(db, requestCode) : getAuthorizationRequest(db, sharedSecret);

    if (requesition is null)
    {
        return response.databaseError(DB_Errors.EXPIRED_OR_MISSING_AUTHORIZATION_REQUEST);
    }

    JSONValue resJson = [
        "reqCode": requesition.authorizationRequestCode,
        "realm": requesition.realm
    ];

    resJson["createdAt"] = requesition.createdAt;

    if (!isFromRequestCode)
    {
        resJson["session"] = requesition.sessionIDorNull;
    }
    resJson["sessionStatus"] = requesition.sessionIDorNull == null || requesition
        .sessionIDorNull.length == 0 ?
        "AWAITING_AUTHORIZATION" : "AUTHORIZED";

    response.jsonMessage(resJson);
}
