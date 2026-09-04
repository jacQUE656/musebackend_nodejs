import jwt from "jsonwebtoken";

function authenticate(req, res, next) {

  console.log("HEADERS:", req.headers);
  console.log("COOKIES:", req.cookies);

  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const cookieToken = req.cookies?.accessToken;
  const token = cookieToken || headerToken;
  
  console.log("RESOLVED TOKEN:", token);


  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token payload uses userId/userEmail/userRole (see generateAccessToken in
    // tokenUtils.js). Normalized here to { id, email, role } so every
    // downstream controller/middleware can consistently read req.user.id.
    req.user = {
      id: decoded.userId,
      email: decoded.userEmail,
      role: decoded.userRole,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default authenticate;