module ane.http.message;

import std.string;
import std.conv;

import std.regex;
import std.algorithm.iteration;
import std.datetime.systime;
import std.socket;
import ane.db;
import std.json;
import ane.auth.account;

class HttpIncomingMessage
{
    string method, path, version_;
    string[string] headers;
    string[string] cookies;
    ubyte[] payload;

    this(string payloadString)
    {
        string[] lines = payloadString.splitLines();

        if (lines.length < 2)
            throw new HttpException(400, "Bad Request");

        string[] statusLine = (lines[0].split(" "));

        if (statusLine.length != 3)
            throw new HttpException(400, "Bad status line");

        this.method = statusLine[0].strip().toLower();
        this.path = statusLine[1].strip();
        this.version_ = statusLine[2].strip();

        if (this.method != "get" && this.method != "post" && this.method != "head")
            throw new HttpException(405, "Method not allowed.");

        if (!this.path.startsWith("/"))
            this.path = '/' ~ this.path;

        if (this.version_ != "HTTP/1.1")
        {
            throw new HttpException(505, "Version Not Supported");
        }

        for (size_t i = 1; i < lines.length; i++)
        {
            string line = lines[i];
            auto id = line.indexOf(":");

            if (id == -1)
                break;

            string headerName = line[0 .. id].strip().toLower();
            string value = line[id + 1 .. $].strip().toLower();

            this.headers[headerName] = value;
        }

        // Handling cookies

        string cookiesHeader = this.getHeaderOrNull("cookie");

        if (cookiesHeader != null && cookiesHeader.length > 0)
        {
            string[] segments = cookiesHeader.split(";");
            foreach (segment; segments)
            {
                string[] tokens = segment.strip().split("=");

                // harsh? not really, the only cookie coming in should be sessionToken
                // and last time i checked UUIDs don't contain semicolons or equal signs.
                if (tokens.length != 2)
                    continue;

                cookies[tokens[0].strip().toLower()] = tokens[1].strip().toLower();
            }

        }
        debug
        {
            import std.stdio : writeln;

            writeln("[DEBUG] Cookies: ", cookies);
            //   writeln("[DEBUG] Headers: ", this.headers);
        }

        // Handling POST bodies

        string* contentSize = "content-length" in this.headers;
        if (contentSize is null)
            return;

        int contentSizeInteger;
        try
        {
            contentSizeInteger = (*contentSize).to!int;
        }
        catch (Throwable er)
        {
            throw new HttpException(400, "Bad content-length");
        }

        if (contentSizeInteger >= payloadString.length || contentSizeInteger < 0)
            throw new HttpException(400, "Content-length surpasses HTTP message length");

        auto offset = payloadString.length - contentSizeInteger;

        this.payload = cast(ubyte[]) payloadString[offset .. $];
    }

    /** self explanatory */
    string getHeaderOrNull(string header)
    {
        string* n = header.toLower() in headers;
        if (n is null)
            return null;
        return *n;
    }
    /** self explanatory */
    string getCookieOrNull(string cookie)
    {
        string* n = cookie.toLower() in cookies;
        if (n is null)
            return null;
        return *n;
    }

    /**
        This function attempts to gather a session token from multiple sources:
            - The cookies header
            - The authorization header

        Returns null if both failed, the requestee session token otherwise.
    */
    string getAuthorization()
    {
        {
            string authorizationHeader = getHeaderOrNull("authorization");
            if (authorizationHeader != null && authorizationHeader.length > 0)
            {
                string[] tokens = authorizationHeader.split(" ");
                debug
                {
                    import std.stdio;

                    writeln("[DEBUG] getAuthorization found an Authorization header, params: ", tokens);
                }

                if (tokens.length == 2 && tokens[0].toLower() == "bearer")
                {
                    return tokens[1]; // should be fine? really? i mean, 
                    // why in god's name would anyone pass a token containing a space? really? 
                    // the secrets are always two random UUIDs without '-'s anyway, there's 0 chance of a space
                    // unless the person is really trying to do something funny, in which case it wont work anyway.
                }
            }
        }

        // either we're lacking an authorization header or the existing one sucks
        return getCookieOrNull("sessiontoken");
    }
}

class HttpServerResponse
{
    int statusCode;
    private string[string] headers;
    string payload;

    this()
    {
        this.payload = "";
        this.statusCode = 404;
        this.setHeader("Server", "suichan httpd");

        immutable string[] WeekDays = [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
        ];

        immutable string[] Months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        auto now = Clock.currTime().toUTC();
        this.setHeader("Date", format("%s, %02d %s %d %02d:%02d:%02d GMT",
                WeekDays[now.dayOfWeek],
                now.day,
                Months[now.month],
                now.year,
                now.hour,
                now.minute,
                now.second
        ));
    }

    void setHeader(string name, string value)
    {
        this.headers[name.toLower()] = value;
    }

    void setPayload(string contentType, string text)
    {
        this.setHeader("Content-Type", contentType);
        this.setHeader("Content-Length", text.length.to!string);
        this.payload = text;
    }

    /**
        Outputs a generic JSON message as a response
        This version takes in a generic associative array.    
    */
    void jsonMessage(string[string] v)
    {
        JSONValue json = v;
        this.jsonMessage(json);
    }

    /**
        Outputs a generic JSON message as a response
        This version takes in a finished JSON.
    */
    void jsonMessage(JSONValue json)
    {
        this.statusCode = 200;
        this.setPayload("application/json", json.toString());
    }

    /**
        Outputs essentially an {ok: true}
    */
    void jsonOK()
    {
        JSONValue v = ["ok": true];
        this.jsonMessage(v);
    }

    /**
        Outputs a standardized session JSON with everything needed
        by the front end web server

        Ensure this is consistent with the SvelteKit front end.
    */
    void session(Account account, string sessionToken)
    {
        JSONValue o = [
            "sessionToken": sessionToken,
            "username": account.Name
        ];
        o["ID"] = account.ID();
        o["accountInfo"] = account.asJSONData();
        this.jsonMessage(o);
    }

    /**
        Makes this server response output a JSON containg an error: specified by the parameter @error.
    */
    void databaseError(DB_Errors error)
    {
        this.jsonMessage(["error": format("%s", error)]);
    }

    /**
        !!!DO NOT CALL THIS
        unless you're working on server.d

        if you call it inside endpoints.d IT WILL EXPLODE!
        and will result in a nasty DM message directly from me
        maybe some 5.56x51mm rounds at 6300 feet per second flying directly towards your door too

        - Miyuki
    */
    void writeTo(Socket socket)
    {
        ubyte[] buffer;
        buffer ~= cast(ubyte[])(format("HTTP/1.1 %d %s\r\n", statusCode, getStatusText(statusCode)));

        foreach (headerName; headers.byKey)
        {
            buffer ~= cast(ubyte[])(format("%s: %s\r\n", headerName, headers[headerName]));
        }
        buffer ~= "\r\n";
        buffer ~= payload;

        socket.send(buffer);
    }
}

class HttpException : Exception
{
    int statusCode;

    this(int statusCode, string msg, string file = __FILE__, size_t line = __LINE__,
        Throwable nextInChain = null) pure nothrow @nogc @safe
    {
        super(msg, file, line, nextInChain);
        this.statusCode = statusCode;
    }
}

private string getStatusText(int code)
{
    immutable statusTexts = [
        100: "Continue",
        101: "Switching Protocols",
        200: "OK",
        201: "Created",
        202: "Accepted",
        204: "No Content",
        301: "Moved Permanently",
        302: "Found",
        304: "Not Modified",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        412: "Precondition Failed",
        500: "Internal Server Error",
        501: "Not Implemented",
        502: "Bad Gateway",
        503: "Service Unavailable",
        505: "HTTP Version Not Supported"
    ];

    return code in statusTexts ? statusTexts[code] : "Unknown Status Code";
}
