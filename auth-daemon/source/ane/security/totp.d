module ane.security.totp;

import std.digest.hmac : HMAC;
import std.digest.sha : SHA1, toHexString;
import std.bitmanip : nativeToBigEndian, bigEndianToNative;
import std.string : replace;
import std.uuid : UUID, randomUUID;
import std.format : format;

// stolen from https://github.com/ilmanzo/gauthenticator/blob/master/source/gauthenticator.d
// code adapted from https://github.com/tilaklodha/google-authenticator

// @ane addition
public string genTOTPSecret()
{
    auto uuid = randomUUID();
    auto uuidString = uuid.toString();

    return base32encode(cast(ubyte[]) uuidString.replace("-", ""));
}

/// HMAC-based One Time Password(HOTP)
public string getHOTPToken(const string secret, const ulong interval)
{
    //secret is a base32 encoded string. Converts to a byte array
    auto key = base32decode(secret);
    //Signing the value using HMAC-SHA1 Algorithm
    auto hm = HMAC!SHA1(key);
    hm.put(nativeToBigEndian(interval));
    ubyte[20] sha1sum = hm.finish();
    // We're going to use a subset of the generated hash.
    // Using the last nibble (half-byte) to choose the index to start from.
    // This number is always appropriate as it's maximum decimal 15, the hash will
    // have the maximum index 19 (20 bytes of SHA1) and we need 4 bytes.    
    const int offset = (sha1sum[19] & 15);
    ubyte[4] h = sha1sum[offset .. offset + 4];
    //Ignore most significant bits as per RFC 4226.
    //Takes division from one million to generate a remainder less than < 7 digits    
    const uint h12 = (bigEndianToNative!uint(h) & 0x7fffffff) % 1_000_000;
    return format("%06d", h12);
}

/// Time-based One Time Password(TOTP)
public string getTOTPToken(const string secret)
{
    //The TOTP token is just a HOTP token seeded with every 30 seconds.
    import std.datetime : Clock;

    immutable ulong interval = Clock.currTime().toUnixTime() / 30;
    return getHOTPToken(secret, interval);
}

//RFC 4648 base32 implementation
private ubyte[] base32decode(const string message)
{
    int buffer = 0;
    int bitsLeft = 0;
    ubyte[] result;
    for (int i = 0; i < message.length; i++)
    {
        int ch = message[i];
        if (ch == '=')
            break;
        if (ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n' || ch == '-')
        {
            continue;
        }
        buffer = buffer << 5;

        // Deal with commonly mistyped characters
        if (ch == '0')
        {
            ch = 'O';
        }
        else if (ch == '1')
        {
            ch = 'L';
        }
        else if (ch == '8')
        {
            ch = 'B';
        }

        // Look up one base32 digit
        if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'))
        {
            ch = (ch & 0x1F) - 1;
        }
        else if (ch >= '2' && ch <= '7')
        {
            ch -= ('2' - 26);
        }

        buffer |= ch;
        bitsLeft += 5;
        if (bitsLeft >= 8)
        {
            const c = (buffer >> (bitsLeft - 8));
            result ~= cast(byte)(c & 0xff);
            bitsLeft -= 8;
        }

    }
    return result;

}

//@ane addition
private string base32encode(ubyte[] data)
{
    // Base32 character set (RFC 4648)
    immutable char[] charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    string result;
    int buffer = 0;
    int bitsLeft = 0;

    foreach (byteVal; data)
    {
        buffer = (buffer << 8) | byteVal;
        bitsLeft += 8;

        while (bitsLeft >= 5)
        {
            int index = (buffer >> (bitsLeft - 5)) & 0x1F;
            result ~= charset[index];
            bitsLeft -= 5;
        }
    }

    // Handle padding bits
    if (bitsLeft > 0)
    {
        int index = (buffer << (5 - bitsLeft)) & 0x1F;
        result ~= charset[index];
    }

    // Pad with '=' to make result length a multiple of 8
    while (result.length % 8 != 0)
    {
        result ~= '=';
    }

    return result;

}
