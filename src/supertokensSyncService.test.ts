import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import { SupertokensSyncService } from "./SupertokensSyncService";
import { loadEnvironmentAndVerifyEnvVars } from "./utils";

vi.mock("fs");
vi.mock("axios");
vi.mock("dotenv");
vi.mock("./utils");

describe("SupertokensService", () => {
    let service: SupertokensSyncService;

    beforeEach(() => {
        vi.mocked(dotenv.config).mockReturnValue({ parsed: {} });
        vi.mocked(loadEnvironmentAndVerifyEnvVars).mockReturnValue({
            ST_API_KEY_DEV: "test-api-key-dev",
            ST_CONNECTION_URI_DEV: "https://st-dev.example.com",
            ST_API_KEY_PROD: "test-api-key-prod",
            ST_CONNECTION_URI_PROD: "https://st-prod.example.com",
        });
        /**
         * Simulate the existence of a config file
         */
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(
            JSON.stringify({
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
            })
        );
        service = new SupertokensSyncService();
    });

    describe("getAllRoles", () => {
        it("should return a list of roles", async () => {
            const mockResponse = {
                data: {
                    status: "OK",
                    roles: ["admin", "user"],
                },
            };
            (axios.get as any).mockResolvedValueOnce(mockResponse);

            const roles = await service.getAllRoles("dev");
            expect(roles).toEqual(["admin", "user"]);
            expect(axios.get).toHaveBeenCalledWith(
                "https://st-dev.example.com/recipe/roles",
                {
                    headers: {
                        "api-key": "test-api-key-dev",
                    },
                }
            );
        });
    });

    describe("getPermissionsForRoles", () => {
        it("should return a list of roles with permissions", async () => {
            const mockResponseAdmin = {
                status: 200,
                data: {
                    status: "OK",
                    permissions: ["read", "write", "delete"],
                },
            };
            const mockResponseUser = {
                status: 200,
                data: {
                    status: "OK",
                    permissions: ["read", "write"],
                },
            };
            (axios.get as any).mockResolvedValueOnce(mockResponseAdmin);
            (axios.get as any).mockResolvedValueOnce(mockResponseUser);

            const rolesWithPermissions = await service.getPermissionsForRoles({
                environment: "dev",
                roles: ["admin", "user"],
            });

            expect(rolesWithPermissions).toEqual([
                { role: "admin", permissions: ["read", "write", "delete"] },
                { role: "user", permissions: ["read", "write"] },
            ]);

            expect(axios.get).toHaveBeenCalledWith(
                "https://st-dev.example.com/recipe/role/permissions?role=admin",
                {
                    headers: {
                        "api-key": "test-api-key-dev",
                        "Content-Type": "application/json; charset=utf-8",
                    },
                }
            );
            expect(axios.get).toHaveBeenCalledWith(
                "https://st-dev.example.com/recipe/role/permissions?role=user",
                {
                    headers: {
                        "api-key": "test-api-key-dev",
                        "Content-Type": "application/json; charset=utf-8",
                    },
                }
            );
        });
    });

    describe("compareArrays", () => {
        it("should return false if arrays are different", () => {
            const arrayA = ["admin", "user", "editor"];
            const arrayB = ["admin", "user"];

            const result = service.compareAndControlTenants({
                tenantsA: arrayA,
                tenantsB: arrayB,
            });

            expect(result).toEqual(false);
        });

        it("should return true if arrays are same regardless of order", () => {
            const arrayA = ["admin", "user", "editor"];
            const arrayB = ["admin", "editor", "user"];

            const result = service.compareAndControlTenants({
                tenantsA: arrayA,
                tenantsB: arrayB,
            });

            expect(result).toEqual(true);
        });
    });

    describe("prepareWritePayload", () => {
        it("should prepare the write payload with unique roles and permissions", () => {
            const input = {
                rolesWithPermissions: [
                    { role: "admin", permissions: ["read", "write", "delete"] },
                    { role: "user", permissions: ["read"] },
                    { role: "editor", permissions: ["read", "write"] },
                    { role: "admin", permissions: ["read", "delete"] }, // duplicate role with overlapping permissions
                ],
            };

            const expectedOutput = {
                roles: ["admin", "user", "editor"],
                permissions: ["read", "write", "delete"],
                rolesWithPermissions: input.rolesWithPermissions,
            };

            const result = service.prepareWritePayload(input);

            expect(result).toEqual(expectedOutput);
        });
    });
});
