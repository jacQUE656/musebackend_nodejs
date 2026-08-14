
import { roleHasPermission } from "../config/roles.js";

/**
 * @param {object} config
 * @param {string} config.resourceName   - key to cache on req (e.g. "song", "album", "playlist")
 * @param {(id: string) => Promise<object|null>} config.getById - fetch function
 * @param {string} config.ownerField     - field on the resource holding the owner's user id
 * @param {object} config.permissions    - { manageAny, updateOwn, deleteOwn }
 */
function createAuthorizeResourceAccess({ resourceName, getById, ownerField, permissions }) {
  return function authorizeResourceAccess(action) {
    const ownPermission = action === "update" ? permissions.updateOwn : permissions.deleteOwn;

    return async function (req, res, next) {
      try {
        const user = req.user;
        const resource = await getById(req.params.id);

        if (!resource) {
          return res.status(404).json({ error: `${resourceName} not found` });
        }

        const isAdminOverride = roleHasPermission(user.userRole, permissions.manageAny);
        const isOwner = resource[ownerField] === user.userId;
        const hasOwnPermission = roleHasPermission(user.userRole, ownPermission);

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