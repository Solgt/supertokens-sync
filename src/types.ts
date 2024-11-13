export namespace SupertokensSync {
    export type Config = {
        logLevel: "debug" | "info";
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
}
