import dotenv from "dotenv";
import { SupertokensSync } from "./types";

export function loadEnvironmentAndVerifyEnvVars(
    envKeyNames: SupertokensSync.EnvKeyNames
) {
    let ST_API_KEY_DEV;
    let ST_CONNECTION_URI_DEV;
    let ST_API_KEY_PROD;
    let ST_CONNECTION_URI_PROD;

    const CONNECTION_URI_KEY_NAME = envKeyNames.connectionUri;
    const API_KEY_NAME = envKeyNames.apiKey;

    if (!CONNECTION_URI_KEY_NAME || !API_KEY_NAME) {
        console.error(
            "❌ Error: Invalid environment key names. Expected to have connectionUri and apiKey."
        );
    }

    dotenv.config({
        path: ".env",
        override: true,
    });

    ST_API_KEY_DEV = process.env[API_KEY_NAME];
    ST_CONNECTION_URI_DEV = process.env[CONNECTION_URI_KEY_NAME];

    dotenv.config({
        path: ".env.production",
        override: true,
    });

    ST_API_KEY_PROD = process.env[API_KEY_NAME];
    ST_CONNECTION_URI_PROD = process.env[CONNECTION_URI_KEY_NAME];

    if (
        !ST_API_KEY_DEV ||
        !ST_CONNECTION_URI_DEV ||
        !ST_API_KEY_PROD ||
        !ST_CONNECTION_URI_PROD
    ) {
        console.error(
            `❌ Error: Missing environment variables. Expected to have ${envKeyNames.apiKey} and ${envKeyNames.connectionUri} in local .env and .env.production files.`
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
