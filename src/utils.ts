import dotenv from "dotenv";

export function loadEnvironmentAndVerifyEnvVars() {
    let ST_API_KEY_DEV;
    let ST_CONNECTION_URI_DEV;
    let ST_API_KEY_PROD;
    let ST_CONNECTION_URI_PROD;

    dotenv.config({
        path: ".env",
        override: true,
    });

    ST_API_KEY_DEV = process.env.AUTH_SUPERTOKENS_API_KEY;
    ST_CONNECTION_URI_DEV = process.env.AUTH_SUPERTOKENS_CONNECTION_URI;

    dotenv.config({
        path: ".env.production",
        override: true,
    });

    ST_API_KEY_PROD = process.env.AUTH_SUPERTOKENS_API_KEY;
    ST_CONNECTION_URI_PROD = process.env.AUTH_SUPERTOKENS_CONNECTION_URI;

    if (
        !ST_API_KEY_DEV ||
        !ST_CONNECTION_URI_DEV ||
        !ST_API_KEY_PROD ||
        !ST_CONNECTION_URI_PROD
    ) {
        console.error(
            "❌ Error: Missing environment variables. Expected to have AUTH_SUPERTOKENS_API_KEY and AUTH_SUPERTOKENS_CONNECTION_URI in local .env and .env.production files."
        );
        process.exit(1);
    }

    if (!ST_CONNECTION_URI_DEV.startsWith("https://st-dev")) {
        console.error(
            "❌ Error: Invalid connection URI for development environment. Expected to start with 'https://st-dev'."
        );
        process.exit(1);
    }

    if (!ST_CONNECTION_URI_PROD.startsWith("https://st-prod")) {
        console.error(
            "❌ Error: Invalid connection URI for production environment. Expected to start with 'https://st-prod'."
        );
        process.exit(1);
    }

    return {
        ST_API_KEY_DEV,
        ST_CONNECTION_URI_DEV,
        ST_API_KEY_PROD,
        ST_CONNECTION_URI_PROD,
    };
}
