import { SupertokensService } from "./SupertokensService";

async function main() {
    const service = new SupertokensService();

    const rolesDev = await service.getAllRoles("dev");

    const rolesWithPermissionsDev = await service.getPermissionsForRoles({
        environment: "dev",
        roles: rolesDev,
    });

    //console.log(rolesWithPermissionsDev);

    const rolesProd = await service.getAllRoles("prod");

    const rolesWithPermissionsProd = await service.getPermissionsForRoles({
        environment: "prod",
        roles: rolesProd,
    });

    //console.log(rolesWithPermissionsProd);

    const comparisonResult = service.compareRoles({
        rolesA: rolesWithPermissionsDev,
        rolesB: rolesWithPermissionsProd,
    });

    // console.log(
    //     "Roles comparison result:\n",
    //     JSON.stringify(comparisonResult, null, 2)
    // );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
