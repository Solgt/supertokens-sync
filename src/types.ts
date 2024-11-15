export namespace SupertokensSync {
    /**
     * Configuration for the SupertokensSync program.
     */
    export type Config = {
        logLevel: "debug" | "info";
        mode: "verify" | "sync";
        outputExtension: ".json" | ".ts";
        outputPath: string;
        outputFileName: string;
        priority: "dev" | "prod";
        authConfigObjectName: string;
        envKeyNames: EnvKeyNames;
    };
    export type EnvKeyNames = {
        connectionUri: string;
        apiKey: string;
    };
    export type EnvVars = {
        ST_API_KEY_DEV: string;
        ST_CONNECTION_URI_DEV: string;
        ST_API_KEY_PROD: string;
        ST_CONNECTION_URI_PROD: string;
    };
    export type Environment = "dev" | "prod";
    export type RoleWithPermissions = {
        role: string;
        permissions: string[];
    };
    type PermissionDifferences = {
        role: string;
        permissionsA: string[];
        permissionsB: string[];
        onlyInA: string[];
        onlyInB: string[];
    };
    export type RoleComparisonResult = {
        isInSync: boolean;
        missingInSetB: RoleWithPermissions[];
        missingInSetA: RoleWithPermissions[];
        permissionDifferences: PermissionDifferences[];
    };
    export type RolePermissionsWritingPreparation = {
        roles: string[];
        permissions: string[];
        rolesWithPermissions: RoleWithPermissions[];
    };
}
