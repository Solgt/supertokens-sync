import path from "path";
import fs from "fs";
import prettier from "prettier";
import { SupertokensSync } from "./types";

export class WriterService {
    private config: SupertokensSync.Config;

    constructor(config: SupertokensSync.Config) {
        this.config = config;
    }

    async write({
        preparation,
    }: {
        preparation: SupertokensSync.RolePermissionsWritingPreparation;
    }) {
        const outputPath = this.config.outputPath;
        const outputExtension = this.config.outputExtension;

        switch (outputExtension) {
            case ".ts":
                await this.handleWritingToTsFile({ outputPath, preparation });
                break;
            case ".json":
                this.handleWritingToJsonFile({ outputPath, preparation });
                break;
            default:
                console.error(
                    "❌ Error: Unsupported output extension. Exiting"
                );
                process.exit(1);
        }
    }

    private handleWritingToJsonFile({
        outputPath,
        preparation,
    }: {
        outputPath: string;
        preparation: SupertokensSync.RolePermissionsWritingPreparation;
    }) {
        const content = JSON.stringify(
            this.generateAuthConfig(preparation),
            null,
            4
        );
        const filePath = path.resolve(
            process.cwd(),
            outputPath,
            `${this.config.outputFileName}.json`
        );
        this.makeDirIfNotExists(filePath);
        fs.writeFileSync(filePath, content);
        console.info(`✅ Roles and permissions synced to '${filePath}'.`);
    }

    private makeDirIfNotExists(filePath: string) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true,
            });
        }
    }

    private async handleWritingToTsFile({
        outputPath,
        preparation,
    }: {
        outputPath: string;
        preparation: SupertokensSync.RolePermissionsWritingPreparation;
    }) {
        const content = await this.generateTsContent(preparation);
        const filePath = path.resolve(
            process.cwd(),
            outputPath,
            `${this.config.outputFileName}.ts`
        );
        this.makeDirIfNotExists(filePath);
        fs.writeFileSync(filePath, content);
        console.info(`✅ Roles and permissions synced to '${filePath}'.`);
    }

    private async generateTsContent(
        input: SupertokensSync.RolePermissionsWritingPreparation
    ) {
        const authConfig = this.generateAuthConfig(input);

        const fileContent = `// Auto-generated auth configuration
export namespace SupertokensSyncAuthConfigTypes {
    export type Roles = {
        [K in keyof typeof authConfig.roles]: (typeof authConfig.roles)[K];
    };
    export type Permissions = {
        [K in keyof typeof authConfig.permissions]: (typeof authConfig.permissions)[K];
    };
    export type RoleWithPermissions = {
        role: Roles[keyof typeof authConfig.roles];
        permissions: Array<
            Permissions[keyof typeof authConfig.permissions]
        >;
    };
}
export const authConfig = ${JSON.stringify(authConfig, null, 4)} as const;

export type AuthConfig = typeof authConfig;
`;
        const prettierrc = await prettier.resolveConfig(
            `${process.cwd()}/.prettierrc`
        );
        const formattedContent = await prettier.format(fileContent, {
            parser: "typescript",
            ...(prettier && { ...prettierrc }),
        });

        return formattedContent;
    }

    generateAuthConfig(
        input: SupertokensSync.RolePermissionsWritingPreparation
    ) {
        const roles = input.roles.reduce(
            (acc, role) => {
                acc[role.toUpperCase()] = role;
                return acc;
            },
            {} as Record<string, string>
        );

        const permissions = input.permissions.reduce(
            (acc, permission) => {
                acc[permission.toUpperCase().replace(/[^a-zA-Z0-9]/g, "_")] =
                    permission;
                return acc;
            },
            {} as Record<string, string>
        );

        const rolesWithPermissions = input.rolesWithPermissions.map(
            (roleWithPermissions) => ({
                role: roles[
                    roleWithPermissions.role.toUpperCase() as keyof typeof roles
                ],
                permissions: roleWithPermissions.permissions.map(
                    (permission) =>
                        permissions[
                            permission
                                .toUpperCase()
                                .replace(
                                    /[^a-zA-Z0-9]/g,
                                    "_"
                                ) as keyof typeof permissions
                        ]
                ),
            })
        );

        const authConfig = {
            roles,
            permissions,
            rolesWithPermissions,
        } as const;

        return authConfig;
    }
}
