module ane.security.validation;

import std.ascii;
import std.string;

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 32;

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 200;

bool isUsernameValid(ref string username)
{
    username = username.strip().toLower();
    if (username.length < MIN_USERNAME_LENGTH ||
        username.length > MAX_USERNAME_LENGTH)
        return false;

    for (size_t i = 0; i < username.length; i++)
    {
        char c = username[i];

        if (!isDigit(c) && !isAlpha(c) && c != '_')
        {
            return false;
        }
    }

    return true;
}

bool isDisplayNameValid(ref string displayname)
{
    displayname = displayname.strip();
    return (displayname.length >= MIN_USERNAME_LENGTH &&
            displayname.length <= MAX_USERNAME_LENGTH);
}

bool isPasswordValid(ref string password)
{
    password = password.strip();
    return password.length > MIN_PASSWORD_LENGTH && password
        .length < MAX_PASSWORD_LENGTH;
}
