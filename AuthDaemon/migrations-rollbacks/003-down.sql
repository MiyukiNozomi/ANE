BEGIN TRANSACTION;

DROP TABLE IF EXISTS thirdPartySessionRequest;


ALTER TABLE sessions DROP COLUMN isThirdPartySession;

COMMIT;