#!/usr/bin/env node

import { SupertokensSyncService } from "./SupertokensSyncService";

async function main() {
    const service = new SupertokensSyncService();

    const currentDevTenants = await service.getAllTenants("dev");
    const currentProdTenants = await service.getAllTenants("prod");
    service.compareAndControlTenants({
        tenantsA: currentDevTenants,
        tenantsB: currentProdTenants,
    });

    const rolesDev = await service.getAllRoles("dev");

    const rolesWithPermissionsDev = await service.getPermissionsForRoles({
        environment: "dev",
        roles: rolesDev,
    });

    const rolesProd = await service.getAllRoles("prod");

    const rolesWithPermissionsProd = await service.getPermissionsForRoles({
        environment: "prod",
        roles: rolesProd,
    });

    const comparisonResult = service.compareRolesAndPermissions({
        rolesA: rolesWithPermissionsDev,
        rolesB: rolesWithPermissionsProd,
    });

    const mode = service.getMode();
    if (mode === "verify") {
        console.info("✅ Verification complete.");
        return;
    }

    const targetRolesWithPermissions = service.controlRolesAndPermissions({
        comparisonResult,
        rolesA: rolesWithPermissionsDev,
        rolesB: rolesWithPermissionsProd,
    });

    await service.generateAuthConfig({
        rolesWithPermissions: targetRolesWithPermissions,
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
