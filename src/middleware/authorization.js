import rbac from "../config/roles.js";

const { roleHasPermission } = rbac;

function authorize(permission) {
  return (req, res, next) => {
    // FIXED: Use req.user?.role to match what authenticate.js sets
    const userRole = req.user?.role;

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