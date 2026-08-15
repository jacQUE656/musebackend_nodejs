import jwt from "jsonwebtoken";

function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const cookieToken = req.cookies?.accessToken;

  const token = cookieToken || headerToken;

  if (!token) {
    return next(); // no token — proceed as anonymous
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // invalid/expired token on an optional route — ignore and proceed as anonymous
    // rather than blocking, since the resource might still be publicly visible
  }

  next();
}

export default optionalAuthenticate;