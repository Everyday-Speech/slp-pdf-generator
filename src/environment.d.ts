declare global {
    namespace NodeJS {
        interface ProcessEnv {
            USER_SERVICE_BASE_URL: string;
            USER_SESSION_TOKEN_PRIVATE_KEY: string;
            ENTITIES_TABLE_NAME: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
