module ane.security.argon2;

import std.string;
import core.memory : GC;
import std.random : uniform;

import core.stdc.string : strlen;

pragma(lib, "argon2");

private alias uint32_t = uint;

const SALT_SIZE = 16;

string argon2i(string password)
{
    const passwd = toStringz(password);
    const passwdlen = strlen(passwd);

    debug
    {
        import core.stdc.stdio : printf;

        printf("[ARGON2] [DEBUG] Hashing %s\n", passwd);
    }

    ubyte* bytes = cast(ubyte*) GC.malloc(SALT_SIZE * ubyte.sizeof);
    for (size_t i = 0; i < SALT_SIZE; i++)
        bytes[i] = uniform(cast(ubyte) 0, cast(ubyte) 255);

    const hashLen = 256;
    char* hashBuffer = cast(char*) GC.malloc(hashLen * char.sizeof);

    int retVal = argon2i_hash_encoded(
        2, // 2-pass computation
        (1 << 16), // 64 mebibytes memory usage
        1, // number of threads and lanes,
        passwd,
        passwdlen,
        bytes,
        SALT_SIZE,

        32,
        hashBuffer,
        hashLen,
    );

    if (retVal != Argon2_ErrorCodes.ARGON2_OK)
    {
        throw new Exception(format("Fuck!: %s", fromStringz(argon2_error_message(retVal))));
    }

    return cast(string) fromStringz!(char)(hashBuffer);
}

bool verify(string hash, string testPassword)
{
    const char* pwd = toStringz(testPassword);
    int retVal = argon2i_verify(
        toStringz(hash), pwd, strlen(pwd));

    debug
    {
        import core.stdc.stdio : printf;

        printf("[ARGON2] [DEBUG] Error %s\n", argon2_error_message(retVal));
    }

    return retVal == Argon2_ErrorCodes.ARGON2_OK;
}

enum Argon2_ErrorCodes
{
    ARGON2_OK = 0,

    ARGON2_OUTPUT_PTR_NULL = -1,

    ARGON2_OUTPUT_TOO_SHORT = -2,
    ARGON2_OUTPUT_TOO_LONG = -3,

    ARGON2_PWD_TOO_SHORT = -4,
    ARGON2_PWD_TOO_LONG = -5,

    ARGON2_SALT_TOO_SHORT = -6,
    ARGON2_SALT_TOO_LONG = -7,

    ARGON2_AD_TOO_SHORT = -8,
    ARGON2_AD_TOO_LONG = -9,

    ARGON2_SECRET_TOO_SHORT = -10,
    ARGON2_SECRET_TOO_LONG = -11,

    ARGON2_TIME_TOO_SMALL = -12,
    ARGON2_TIME_TOO_LARGE = -13,

    ARGON2_MEMORY_TOO_LITTLE = -14,
    ARGON2_MEMORY_TOO_MUCH = -15,

    ARGON2_LANES_TOO_FEW = -16,
    ARGON2_LANES_TOO_MANY = -17,

    ARGON2_PWD_PTR_MISMATCH = -18, /* NULL ptr with non-zero length */
    ARGON2_SALT_PTR_MISMATCH = -19, /* NULL ptr with non-zero length */
    ARGON2_SECRET_PTR_MISMATCH = -20, /* NULL ptr with non-zero length */
    ARGON2_AD_PTR_MISMATCH = -21, /* NULL ptr with non-zero length */

    ARGON2_MEMORY_ALLOCATION_ERROR = -22,

    ARGON2_FREE_MEMORY_CBK_NULL = -23,
    ARGON2_ALLOCATE_MEMORY_CBK_NULL = -24,

    ARGON2_INCORRECT_PARAMETER = -25,
    ARGON2_INCORRECT_TYPE = -26,

    ARGON2_OUT_PTR_MISMATCH = -27,

    ARGON2_THREADS_TOO_FEW = -28,
    ARGON2_THREADS_TOO_MANY = -29,

    ARGON2_MISSING_ARGS = -30,

    ARGON2_ENCODING_FAIL = -31,

    ARGON2_DECODING_FAIL = -32,

    ARGON2_THREAD_FAIL = -33,

    ARGON2_DECODING_LENGTH_FAIL = -34,

    ARGON2_VERIFY_MISMATCH = -35
}

extern (C)
{
    int argon2i_hash_encoded(const uint t_cost,
        const uint m_cost,
        const uint parallelism,
        const void* pwd, const size_t pwdlen,
        const void* salt, const size_t saltlen,
        const size_t hashlen, char* encoded,
        const size_t encodedlen);
    int argon2i_hash_raw(const uint32_t t_cost, const uint32_t m_cost,
        const uint32_t parallelism, const void* pwd,
        const size_t pwdlen, const void* salt,
        const size_t saltlen, void* hash,
        const size_t hashlen);
    int argon2d_hash_encoded(const uint32_t t_cost,
        const uint32_t m_cost,
        const uint32_t parallelism,
        const void* pwd, const size_t pwdlen,
        const void* salt, const size_t saltlen,
        const size_t hashlen, char* encoded,
        const size_t encodedlen);
    int argon2d_hash_raw(const uint32_t t_cost, const uint32_t m_cost,
        const uint32_t parallelism, const void* pwd,
        const size_t pwdlen, const void* salt,
        const size_t saltlen, void* hash,
        const size_t hashlen);
    int argon2id_hash_encoded(const uint32_t t_cost,
        const uint32_t m_cost,
        const uint32_t parallelism,
        const void* pwd, const size_t pwdlen,
        const void* salt, const size_t saltlen,
        const size_t hashlen, char* encoded,
        const size_t encodedlen);
    int argon2id_hash_raw(const uint32_t t_cost,
        const uint32_t m_cost,
        const uint32_t parallelism, const void* pwd,
        const size_t pwdlen, const void* salt,
        const size_t saltlen, void* hash,
        const size_t hashlen);
    int argon2i_verify(const char* encoded, const void* pwd,
        const size_t pwdlen);
    int argon2d_verify(const char* encoded, const void* pwd,
        const size_t pwdlen);
    int argon2id_verify(const char* encoded, const void* pwd,
        const size_t pwdlen);
    const(char)* argon2_error_message(int error_code);
}
