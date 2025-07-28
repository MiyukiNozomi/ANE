module ane.http.params;

import std.json;
import std.stdio;
import std.format;
import std.string;

import ane.http.message;
import ane.security.validation;

string getUsernameSafe(JSONValue json, bool mandatory = true)
{
    string rawusername = json.getStringSafe("username", mandatory).toLower();

    if (rawusername.length == 0 && !mandatory)
        return "";

    if (!isUsernameValid(rawusername))
        throw new HttpException(400, "ユーザー名が不正です 「Bad username」");

    return rawusername;
}

string getPasswordSafe(JSONValue json, bool mandatory = true)
{
    string rawpassword = json.getStringSafe("password", mandatory);

    if (rawpassword.length == 0 && !mandatory)
        return "";
    if (!isPasswordValid(rawpassword))
        throw new HttpException(400, "パスワードが不正です 「Bad password」");

    return rawpassword;
}

string getDisplaynameSafe(JSONValue json, bool mandatory = true)
{
    string displayName = json.getStringSafe("displayname", mandatory);
    if (!isDisplayNameValid(displayName))
        throw new HttpException(400, "表示名が不正です 「Bad display name」");
    return displayName;
}

string getStringSafe(JSONValue value, string name, bool mandatory = true)
{
    JSONValue* str = name in value;
    if (str is null)
    {
        if (mandatory)
            throw new HttpException(400, format(
                    "不正なペイロード：%s が欠落しています", name));

        return "";
    }

    return str.str().strip();
}

/**
    If the value is missing and mandatory is false,
    -1 will be returned instead.
*/
int getIntSafe(JSONValue value, string name, bool mandatory = true)
{
    JSONValue* i = name in value;
    if (i is null)
    {
        if (mandatory)
            throw new HttpException(400, format(
                    "不正なペイロード：%s が欠落しています", name));
        return -1;
    }

    return cast(int) i.integer();
}

void validateParameters(HttpIncomingMessage message, void delegate(JSONValue json) getters)
{
    try
    {
        JSONValue json = parseJSON(cast(string) message.payload);
        getters(json);
    }
    catch (Throwable b)
    {
        writeln("JSON parse exception: ", b.message);
        throw new HttpException(400, "無効なペイロード 「Invalid Payload」");
    }
}
