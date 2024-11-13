import axios from "axios";
import { loadEnvironmentAndVerifyEnvVars } from "./utils";
import { SupertokensSync } from "./types";
import * as fs from "fs";
import * as path from "path";
import z from "zod";

export class SupertokensService {
    private static readonly CONFIG_FILE_NAME = "supertokens-sync-config.json";
    private static readonly defaultConfig = {
        logLevel: "info",
    } satisfies SupertokensSync.Config;
    private coreApiEndpoints = {
        getAllRoles: "recipe/roles",
        getAllUsersWithRole: (role: string) => `recipe/role/users?role=${role}`,
        getPermissionsForRole: (role: string) =>
            `recipe/role/permissions?role=${role}`,
        getUserInfo: (userId: string) => `user/id?userId=${userId}`,
        getUserRoles: (userId: string) => `recipe/user/roles?userId=${userId}`,
        getUserMetadata: (userId: string) =>
            `recipe/user/metadata?userId=${userId}`,
    };
    private envVars: SupertokensSync.EnvVars;
    private config: SupertokensSync.Config;

    constructor() {
        this.config = this.loadConfigFile();
        this.envVars = loadEnvironmentAndVerifyEnvVars();
    }

    async getAllRoles(
        environment: SupertokensSync.Environment
    ): Promise<string[]> {
        const { ST_CONNECTION_URI, ST_API_KEY } =
            this.getApiKeysForEnvironment(environment);

        const url = `${ST_CONNECTION_URI}/${this.coreApiEndpoints.getAllRoles}`;
        const resp = await axios.get(url, {
            headers: {
                "api-key": ST_API_KEY,
            },
        });

        const body = resp.data;
        if (body.status !== "OK") {
            throw new Error("Response from Supertokens not OK.");
        }

        const currentRoles = body.roles as string[];
        return currentRoles;
    }

    async getPermissionsForRoles({
        environment,
        roles,
    }: {
        environment: SupertokensSync.Environment;
        roles: string[];
    }): Promise<SupertokensSync.RoleWithPermissions[]> {
        const { ST_CONNECTION_URI, ST_API_KEY } =
            this.getApiKeysForEnvironment(environment);

        const rolesWithPermissionsPromises = roles.map(async (role) => {
            const url = `${ST_CONNECTION_URI}/${this.coreApiEndpoints.getPermissionsForRole(
                role
            )}`;
            const resp = await axios.get(url, {
                headers: {
                    "api-key": ST_API_KEY,
                    "Content-Type": "application/json; charset=utf-8",
                },
            });
            const body = resp.data;
            if (body.status !== "OK") {
                throw new Error("Response from Supertokens not OK.");
            }
            return {
                role: role,
                permissions: body.permissions,
            };
        });

        const rolesWithPermissions = await Promise.all(
            rolesWithPermissionsPromises
        );

        return rolesWithPermissions;
    }

    private loadConfigFile(): SupertokensSync.Config {
        const configPath = path.resolve(
            process.cwd(),
            SupertokensService.CONFIG_FILE_NAME
        );

        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(
                configPath,
                JSON.stringify(SupertokensService.defaultConfig, null, 4)
            );
            console.info(
                `📑 No config file found. Created default config at '${configPath}'.`
            );
        }

        const configSchema = z.object({
            logLevel: z.enum(["debug", "info"]),
        });
        type ConfigSchema = z.infer<typeof configSchema>;
        (function (_: SupertokensSync.Config) {})({} as ConfigSchema); // Type guard

        const configFile = fs.readFileSync(configPath, "utf8");
        const rawConfig = JSON.parse(configFile);

        try {
            return configSchema.parse(rawConfig);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("❌ Invalid configuration error:", error.errors);
                process.exit(1);
            }
            throw error;
        }
    }

    private getApiKeysForEnvironment(environment: SupertokensSync.Environment) {
        if (environment === "dev") {
            return {
                ST_CONNECTION_URI: this.envVars.ST_CONNECTION_URI_DEV,
                ST_API_KEY: this.envVars.ST_API_KEY_DEV,
            };
        } else {
            return {
                ST_CONNECTION_URI: this.envVars.ST_CONNECTION_URI_PROD,
                ST_API_KEY: this.envVars.ST_API_KEY_PROD,
            };
        }
    }
    /**
     * Sorts roles and permissions alphabetically.
     */
    private sortRoles(
        roles: SupertokensSync.RoleWithPermissions[]
    ): SupertokensSync.RoleWithPermissions[] {
        return roles
            .map((role) => ({
                ...role,
                permissions: [...role.permissions].sort(),
            }))
            .sort((a, b) => a.role.localeCompare(b.role));
    }

    compareRoles({
        rolesA,
        rolesB,
    }: {
        rolesA: SupertokensSync.RoleWithPermissions[];
        rolesB: SupertokensSync.RoleWithPermissions[];
    }): SupertokensSync.RoleComparisonResult {
        const sortedRolesA = this.sortRoles(rolesA);
        const sortedRolesB = this.sortRoles(rolesB);

        const result: SupertokensSync.RoleComparisonResult = {
            isInSync: true,
            missingInSetB: [],
            missingInSetA: [],
            permissionDifferences: [],
        };

        const rolesMapA = new Map(
            sortedRolesA.map((role) => [role.role, role.permissions])
        );
        const rolesMapB = new Map(
            sortedRolesB.map((role) => [role.role, role.permissions])
        );

        // Check for roles missing in set B
        for (const roleA of sortedRolesA) {
            const permissionsB = rolesMapB.get(roleA.role);

            if (!permissionsB) {
                result.missingInSetB.push(roleA);
                result.isInSync = false;
            } else if (
                JSON.stringify(roleA.permissions) !==
                JSON.stringify(permissionsB)
            ) {
                const { onlyInA, onlyInB } = this.getPermissionDifferences(
                    roleA.permissions,
                    permissionsB
                );
                result.permissionDifferences.push({
                    role: roleA.role,
                    permissionsA: roleA.permissions,
                    permissionsB,
                    onlyInA,
                    onlyInB,
                });
                result.isInSync = false;
            }
        }

        // Check for roles missing in set A
        for (const roleB of sortedRolesB) {
            if (!rolesMapA.has(roleB.role)) {
                result.missingInSetA.push(roleB);
                result.isInSync = false;
            }
        }

        if (!result.isInSync) {
            if (this.config.logLevel === "debug") {
                if (result.missingInSetA.length > 0) {
                    console.warn(
                        "⏸️ Roles missing in set A (dev):",
                        result.missingInSetA.map((role) => role.role)
                    );
                }
                if (result.missingInSetB.length > 0) {
                    console.warn(
                        "⏸️ Roles missing in set B (prod):",
                        result.missingInSetB.map((role) => role.role)
                    );
                }
                if (result.permissionDifferences.length > 0) {
                    console.warn(
                        "⏸️ Permission differences:",
                        result.permissionDifferences
                    );
                }
            } else {
                console.warn(
                    "⚠️ Warn: Roles are not in sync. Activate debug to check the comparison result."
                );
            }
        }

        return result;
    }

    getPermissionDifferences(permissionsA: string[], permissionsB: string[]) {
        const setA = new Set(permissionsA);
        const setB = new Set(permissionsB);

        const onlyInA = permissionsA.filter(
            (permission) => !setB.has(permission)
        );
        const onlyInB = permissionsB.filter(
            (permission) => !setA.has(permission)
        );
        const common = permissionsA.filter((permission) =>
            setB.has(permission)
        );

        return { onlyInA, onlyInB, common };
    }
}
