
CREATE TABLE IF NOT EXISTS thirdPartySessionRequest  (
    id TEXT PRIMARY KEY,
    /** used in the login URL, as the ID column is the request secret.*/
    authorizationRequestCode TEXT NOT NULL UNIQUE,
    
    /**
        Realm is where the user is signing into.
    */
    realm TEXT NOT NULL,

    /** if null == not authorized yet*/
    session_id TEXT DEFAULT NULL,
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    FOREIGN KEY (session_id) REFERENCES sessions (id)
);

ALTER TABLE sessions ADD COLUMN isThirdPartySession INTEGER DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN realmName TEXT DEFAULT "";