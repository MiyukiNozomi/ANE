module ane.http.server;

import ane.db;
import ane.auth.session;
import ane.auth.account;

import std.socket;
import std.stdio;
import std.process;
import ane.http.message;
import ane.http.endpoints;

const string SOCKET_ADDRESS = "/tmp/jp.ane.auth";

const MAX_REQUEST_LENGTH = 300;

ubyte[] readRequestBuffer(Socket incoming)
{
    ubyte[] buffer;
    long nRead = 1024;
    ubyte[] tempBuffer = new ubyte[nRead];

    while (nRead == 1024)
    {
        nRead = incoming.receive(tempBuffer);

        if (buffer.length > MAX_REQUEST_LENGTH)
            return buffer;

        buffer ~= tempBuffer[0 .. nRead];
    }

    return buffer;
}

void createAuthServer(Database db)
{
    auto socket = new TcpSocket();
    socket.bind(new InternetAddress("localhost", 4050));
    socket.listen(128);

    writeln("Auth server launched at ", socket.localAddress());

    while (socket.isAlive())
    {
        Socket incoming = socket.accept();

        try
        {
            HttpIncomingMessage message = new HttpIncomingMessage(
                cast(string) readRequestBuffer(incoming));

            writeln(message.method, " ", message.path, " ", message.version_);

            handleRequest(db, socket, message).writeTo(incoming);

            incoming.close();
        }
        catch (HttpException er)
        {
            writeln("HTTP exception: " ~ er.msg);
            auto response = new HttpServerResponse();
            response.statusCode = er.statusCode;
            response.setPayload("text/plain; charset=UTF-8", er.msg);
            response.writeTo(incoming);
            incoming.close();
        }
    }
}

HttpServerResponse handleRequest(Database db, Socket socket, HttpIncomingMessage message)
{
    HttpServerResponse res = new HttpServerResponse();
    switch (message.path)
    {
        // Test endpoint
    case "/is-alive":
        res.statusCode = 200;
        res.setPayload("text/plain", "OK");
        return res;
        /**
        Generic endpoints    
        Aka Public API endpoints
    */
    case "/get-account":
        return postOnlyEndpoint(db, res, message, &getAccountEndpoint);
    case "/authorizations/new": // TODO consider if /authorizations/new shouldn't return the same type as get-status..
        return postOnlyEndpoint(db, res, message, &requestAuthorizationEndpoint);
    case "/authorizations/get-status":
        return postOnlyEndpoint(db, res, message, &getAuthorizationStatusEndpoint);
        /**
        Entrance Endpoints
    */
    case "/register":
        return postOnlyEndpoint(db, res, message, &registrationEndpoint);
    case "/login":
        return postOnlyEndpoint(db, res, message, &logInEndpoint);
        /**
        Logged in endpoints
    */
    case "/signed/2fa-enable/step1":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(true, db, res, message, &enable2FAEndpoint);
        });
    case "/signed/2fa-enable/setup":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(true, db, res, message, &verifyAndSetup2FAEndpoint);
        });
    case "/signed/2fa-disable":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(true, db, res, message, &disable2FAEndpoint);
        });
    case "/signed/get-security-info":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(true, db, res, message, &getAccountSecurityInfoEndpoint);
        });
    case "/signed/set-display-name":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(true, db, res, message, &displayNameSetterEndpoint);
        });
        /**
        Session management
    */
    case "/signed/get-sessions":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(true, db, res, message, &accountSessionsEndpoint);
        });
    case "/signed/delete-sessions":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(true, db, res, message, &clearAccountSessionsEndpoint);
        });
        // this only gets us the name, description and basic info of the account, it's fine if a third party session requests it.
    case "/signed/me":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(false, db, res, message, &currentAccountInfo);
        });
        // This endpoint is to authorize external session requests
    case "/signed/authorize":
        return postOnlyEndpoint(db, res, message, (db, res, message) {
            return SignedInEndpointRequirement(true, db, res, message, &giveAuthorizationEndpoint);
        });
    default:
        throw new HttpException(404, "HTTP見つかりません");
    }

    return res;
}

/** We all hope D inlines  all this crap below */
HttpServerResponse postOnlyEndpoint(Database db, HttpServerResponse response, HttpIncomingMessage message,
    void function(Database db, HttpServerResponse response, HttpIncomingMessage message) endpointFunc)
{
    if (message.method != "post")
        throw new HttpException(400, "HTTPポストのみ 「HTTP Post Method Needed」");
    endpointFunc(db, response, message);
    return response;
}

void SignedInEndpointRequirement(
    bool requiresNONthirdPartySession,
    Database db, HttpServerResponse response, HttpIncomingMessage message,
    void function(
        Account account,
        Database db,
        HttpServerResponse response,
        HttpIncomingMessage message) unsecuredEndpoint
)
{
    string sessionToken = message.getAuthorization();
    if (sessionToken == null || sessionToken.length == 0)
    {
        throw new HttpException(401, "認証が必要です 「HTTP Authorization Required」");
    }

    Account account = getSession(db, sessionToken);
    if (account is null)
    {
        return response.databaseError(DB_Errors.EXPIRED_OR_MISSING_SESSION);
    }

    if (account.sessionInfo.isThirdParty && requiresNONthirdPartySession)
    {
        throw new HttpException(403, "アカウントセッションに権限がありません 「ANE Session lacking permission」");
    }

    debug
    {
        writeln("Signed in endpoint request for: ", account.Name, " 「ID ", account.ID, "」 of session: ", sessionToken);
    }
    else
    {
        writeln("Signed in endpoint request for: ", account.Name,
            " 「ID ", account.ID, "」 of session: <truncated(本番ビルド)>");
    }

    unsecuredEndpoint(account, db, response, message);
}
