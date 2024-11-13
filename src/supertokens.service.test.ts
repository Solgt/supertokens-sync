import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import dotenv from "dotenv";
import { SupertokensService } from "./SupertokensService";
import { loadEnvironmentAndVerifyEnvVars } from "./utils";

vi.mock("axios");
vi.mock("dotenv");
vi.mock("./utils");

describe("SupertokensService", () => {
    let service: SupertokensService;

    beforeEach(() => {
        vi.mocked(dotenv.config).mockReturnValue({ parsed: {} });
        vi.mocked(loadEnvironmentAndVerifyEnvVars).mockReturnValue({
            ST_API_KEY_DEV: "test-api-key-dev",
            ST_CONNECTION_URI_DEV: "https://st-dev.example.com",
            ST_API_KEY_PROD: "test-api-key-prod",
            ST_CONNECTION_URI_PROD: "https://st-prod.example.com",
        });
        service = new SupertokensService();
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
});
