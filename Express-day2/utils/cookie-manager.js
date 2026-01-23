import cookieParser from "cookie-parser";

export const cookieManager = (app) => {
  app.use(cookieParser());

  app.use((req, res, next) => {
    res.setCookie = (name, value, options = {}) => {
      const defaults = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      };

      res.cookie(name, value, { ...defaults, ...options });
      return res;
    };

    req.getCookie = (name, defaultValue = null) => {
      return req.cookies?.[name] ?? defaultValue;
    };

    res.clearCookieSafe = (name, options = {}) => {
      res.clearCookie(name, {
        ...options,
        expires: new Date(0),
      });
      return res;
    };

    next();
  });
};

export const cookieAuth = (options = {}) => {
  const { publicRoutes = [] } = options;

  return (req, res, next) => {
    const token = req.cookies?.auth_token;

    if (!token) {
      if (publicRoutes.includes(req.path)) {
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(token, "base64").toString("utf-8"),
      );

      req.user = decoded;
      next();
    } catch (error) {
      res.clearCookieSafe("auth_token");

      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }
  };
};
