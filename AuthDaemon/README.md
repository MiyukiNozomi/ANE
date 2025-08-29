# ANE AuthDaemon

This is the actual implementation of the account system in ANE.

## Organization:

- `ane/auth` - Includes general implementations for Accounts, Authorizations and Sessions.
- `ane/db` - Database Handling
- `ane/http` - HTTP server implementation
- `ane/http/endpoints` - Implementation of endpoints.
- `ane/security` - Argon2 bindings, TOTP implementation and a few JSON validation helpers.
