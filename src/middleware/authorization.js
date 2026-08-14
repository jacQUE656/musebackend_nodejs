import {roleHasPermission} from "../config/roles.js";

function authorize(permission) {
  return (req, res, next) => {
   const userRole = req.user?.userRole;

    if (!userRole) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roleHasPermission(userRole, permission)) {
      return res.status(403).json({
        error: `Forbidden: role '${userRole}' does not have permission '${permission}'`,
      });
    }

    next();
  };
}

export default authorize;