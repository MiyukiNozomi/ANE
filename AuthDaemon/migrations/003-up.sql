
CREATE TABLE IF NOT EXISTS thirdPartySessionRequest  (
    id TEXT PRIMARY KEY,
    
    /** if these are null, it's an app request without a redirection
    so the user authorizes and the authbox wont do a redirect.*/
    realm TEXT,
    pathname TEXT,

    /** if null == not authorized yet*/
    session_id TEXT DEFAULT NULL,
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), -- unix time (seconds)
    FOREIGN KEY (session_id) REFERENCES sessions (id)
);

ALTER TABLE sessions ADD COLUMN isThirdPartySession INTEGER DEFAULT FALSE;