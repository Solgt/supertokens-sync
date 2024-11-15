import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import { WriterService } from "./WriterService";
import { SupertokensSync } from "./types";

vi.mock("fs");
vi.mock("axios");
vi.mock("dotenv");
vi.mock("./utils");

describe("WriterService", () => {
    let service: WriterService;

    beforeEach(() => {
        const config = {
            logLevel: "info",
            mode: "sync",
            outputExtension: ".ts",
            outputPath: "./",
            outputFileName: "supertokensAuth",
            priority: "prod",
            envKeyNames: {
                connectionUri: "AUTH_ST_CONNECTION_URI",
                apiKey: "AUTH_ST_API_KEY",
            },
            authConfigObjectName: "supertokensAuthConfig",
        } satisfies SupertokensSync.Config;
        service = new WriterService(config);
    });

    describe("generateAuthConfig", () => {
        it("should return config", async () => {
            const input = {
                roles: ["internal", "user", "admin", "superadmin"],
                permissions: [
                    "NONE",
                    "read:dev",
                    "rw:admin:general",
                    "rw:admin:special",
                ],
                rolesWithPermissions: [
                    {
                        role: "internal",
                        permissions: ["read:dev"],
                    },
                    {
                        role: "user",
                        permissions: ["NONE"],
                    },
                    {
                        role: "admin",
                        permissions: ["rw:admin:general"],
                    },
                    {
                        role: "superadmin",
                        permissions: ["rw:admin:general", "rw:admin:special"],
                    },
                ],
            };
            const config = await service.generateAuthConfig(input);
            expect(config).toEqual({
                roles: {
                    INTERNAL: "internal",
                    USER: "user",
                    ADMIN: "admin",
                    SUPERADMIN: "superadmin",
                },
                permissions: {
                    NONE: "NONE",
                    READ_DEV: "read:dev",
                    RW_ADMIN_GENERAL: "rw:admin:general",
                    RW_ADMIN_SPECIAL: "rw:admin:special",
                },
                rolesWithPermissions: [
                    {
                        role: "internal",
                        permissions: ["read:dev"],
                    },
                    {
                        role: "user",
                        permissions: ["NONE"],
                    },
                    {
                        role: "admin",
                        permissions: ["rw:admin:general"],
                    },
                    {
                        role: "superadmin",
                        permissions: ["rw:admin:general", "rw:admin:special"],
                    },
                ],
            });
        });
    });
});
