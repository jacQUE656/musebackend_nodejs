import rbac from "../config/roles.js";

const { roleHasPermission } = rbac;

function createAuthorizeResourceAccess({ resourceName, getById, ownerField, permissions }) {
  return function authorizeResourceAccess(action) {
    const ownPermission =
      action === "update" ? permissions.updateOwn
      : action === "delete" ? permissions.deleteOwn
      : permissions.publicOwn; // action === "publish"

    return async function (req, res, next) {
      try {
        const user = req.user;
        const resource = await getById(req.params.id);

        if (!resource) {
          return res.status(404).json({ error: `${resourceName} not found` });
        }

        const isAdminOverride = roleHasPermission(user.userRole, permissions.manageAny);
        const isOwner = resource[ownerField] === user.userId;
        const hasOwnPermission = ownPermission && roleHasPermission(user.userRole, ownPermission);

        if (isAdminOverride || (hasOwnPermission && isOwner)) {
          req[resourceName] = resource;
          return next();
        }

        return res.status(403).json({
          error: `Forbidden: you can only ${action} ${resourceName}s you own`,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Authorization check failed" });
      }
    };
  };
}

export default createAuthorizeResourceAccess;