# ANE AuthD 

Documentation of Endpoints from Ane's Authentication Daemon

## General Purpose, Authentication not required

POST /get-account
    either
        {id: number}
    or 
        {username: string}

GET|POST /is-alive
    returns 'OK', use it to ensure the auth backend is alive

##  Entrance, Authentication not required

POST /register
    {
        username: string,
        password: string
    }

POST /login
    {
        username: string,
        password: string,

        twofactor-code: string? // only becomes necessary if the account has 2FA enabled
    }


## Logged In Endpoints, (Read the name, auth needed)

POST /signed/2fa-enable/step1
    no parameters

POST /signed/2fa-enable/setup
    {
        twofactor-code: string
    }

POST /signed/2fa-disable
    {
        recovery-key: string
    }

POST /signed/set-display-name
    {
        displayname: string
    }

## Session Management

POST /signed/get-sessions
    no parameters

POST /signed/delete-sessions
    no parameters

POST /signed/me
    no parameters
    returns an Account Info (like get-account)