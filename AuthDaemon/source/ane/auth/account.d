module ane.auth.account;

import std.stdio : writeln;
import std.format;

import ane.auth.db;

import etc.c.sqlite3;

import ane.security.totp;
import ane.security.argon2;
import std.json;

class Account
{
    private int id;

    private string displayName;
    private string name;
    private string passwordHash;
    private string totpSecretOrNull;
    private string recoveryEmailOrNull;

    private string totpBackupCode;

    private int createdAt;

    Database db;

    public this(Database db, int id, string displayName, string name, string passwordHash,
        string totpSecretOrNull, string recoveryEmailOrNull, string totpBackupCode, int createdAt)
    {
        this.db = db;

        this.id = id;

        this.displayName = displayName;
        this.name = name;
        this.passwordHash = passwordHash;
        this.totpSecretOrNull = totpSecretOrNull;
        this.recoveryEmailOrNull = recoveryEmailOrNull;

        this.totpBackupCode = totpBackupCode;

        this.createdAt = createdAt;
    }

    // For later account settings 

    /**
        This doesn't returns totpSecret, it returns a recovery code instead in case
        the person looses access to their TOTP.
    */
    string newTotpSecret(string totpSecret)
    {
        const totpBackupCode = genTOTPSecret();
        this.saveInDatabaseTOTP(totpSecret, totpBackupCode);

        this.totpSecretOrNull = totpSecret;
        this.totpBackupCode = totpBackupCode;

        debug
        {

            writeln("[DEBUG] TOTP updated for account: ", this.Name, "
                totpSecret: ", totpSecretOrNull, ",
                backupCode: ", totpBackupCode, "
            ");
        }
        else
        {
            writeln("[NOTE] TOTP updated for account: ", this.Name, " <truncated (本番ビルド)>");
        }
        return totpBackupCode;
    }

    /**Removes 2FA from this account.*/
    void removeTotp(string recoveryKey)
    {
        /**Secondary verification just due to paranoia reasons*/
        if (!verifyRecoveryKey(recoveryKey))
            throw new Exception(
                "This account attempted to remove TOTP with an invalid recovery key. re-check your commits.");

        this.saveInDatabaseTOTP(null, null);

        this.totpBackupCode = null;
        this.totpSecretOrNull = null;
    }

    /**self explanatory */
    void setRecoveryEmail(string email)
    {
        auto stmt = db.newPreparedStatement(
            "UPDATE users SET recoveryEmail = ? WHERE id = ?");
        scope (exit)
            sqlite3_finalize(stmt);
        if (db.bindText(stmt, 1, email) != SQLITE_OK ||
            db.bindInt(stmt, 2, this.id) != SQLITE_OK)
        {
            throw new Exception("Failed to bind parameters");
        }

        if (sqlite3_step(stmt) != SQLITE_DONE)
        {
            throw new Exception("Failed to execute update");
        }

        this.recoveryEmailOrNull = email;
    }

    /**Set account's display name*/
    void setDisplayName(string displayName)
    {
        auto stmt = db.newPreparedStatement(
            "UPDATE users SET displayName = ? WHERE id = ?");
        scope (exit)
            sqlite3_finalize(stmt);
        if (db.bindText(stmt, 1, displayName) != SQLITE_OK ||
            db.bindInt(stmt, 2, this.id) != SQLITE_OK)
        {
            throw new Exception("Failed to bind parameters");
        }

        if (sqlite3_step(stmt) != SQLITE_DONE)
        {
            throw new Exception("Failed to execute update");
        }

        this.displayName = displayName;
    }

    /** Validation API */

    /**Returns whatever or not the account has 2FA enabled.*/
    bool has2FA()
    {
        return this.totpSecretOrNull != null && this.totpSecretOrNull.length > 0;
    }

    /**
        Verifies an input TOTP code

        throws an exception if has2FA == false
    */
    bool verifyTwoFactor(string inputOTPPassword)
    {
        debug
        {
            import std.stdio : writeln;

            writeln("Verify ", Name, " for input TOTP password: '", inputOTPPassword, "'");
        }

        if (!this.has2FA())
        {
            throw new Exception(
                "Account does not have 2FA enabled, re-check your commits.");
        }

        return getTOTPToken(this.totpSecretOrNull) == inputOTPPassword;
    }

    /**
        Verifies an input password against this account's hashed password.
    */
    bool verifyPassword(string inputPassword)
    {
        debug
        {
            import std.stdio : writeln;

            writeln("Verify ", Name, " for input password: '", inputPassword, "'");
        }
        return verify(this.passwordHash, inputPassword);
    }

    bool verifyRecoveryKey(string recoveryKey)
    {
        if (this.totpBackupCode == null || this.totpBackupCode.length == 0)
            throw new Exception("This account does not have 2FA enabled. re-check your commits.");

        debug
        {
            import std.stdio : writeln;

            writeln("Verify ", Name, " for recovery code: '", recoveryKey, "'");
        }
        return this.totpBackupCode == recoveryKey;
    }

    /**Getters*/
    /*Readonly ID*/
    int ID()
    {
        return this.id;
    }

    /*Readonly name*/
    string Name()
    {
        return this.name;
    }

    /*Getter for the DisplayName*/
    string DisplayName()
    {
        return this.displayName is null || this.displayName.length == 0 ? this.name
            : this.displayName;
    }

    /**
        Returns this account's information in a JSON object.
        Use this as a return for endpoints such as /signed/get-session
        or /account-info
    */
    JSONValue asJSONData()
    {
        JSONValue value = [
            "displayName": this.displayName,
            "name": this.name,
        ];

        value["id"] = this.id;
        value["createdAt"] = this.createdAt;

        debug
        {
            writeln("Encoded: ", value);
        }
        return value;
    }

    override string toString() const
    {
        return format("%d: [
    name: %s
    passwordHash: %s
    totpSecretOrNull: %s
    recoveryEmailOrNull: %s
]", id, name, passwordHash, totpSecretOrNull, recoveryEmailOrNull);
    }

    // built in utilities

    private void saveInDatabaseTOTP(string totpSecret, string totpBackupCode)
    {
        auto stmt = db.newPreparedStatement(
            "UPDATE users SET totpSecret = ?, totpBackupCode = ? WHERE id = ?");

        scope (exit)
            sqlite3_finalize(stmt);

        if (db.bindText(stmt, 1, totpSecret) != SQLITE_OK ||
            db.bindText(stmt, 2, totpBackupCode) != SQLITE_OK ||
            db.bindInt(stmt, 3, this.id) != SQLITE_OK)
        {
            throw new Exception("Failed to bind parameters");
        }

        if (sqlite3_step(stmt) != SQLITE_DONE)
        {
            throw new Exception("Failed to execute update");
        }
    }
}
