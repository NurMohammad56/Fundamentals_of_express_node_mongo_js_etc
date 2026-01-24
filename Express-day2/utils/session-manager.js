import session from "express-session";

import { v4 as uuidv4 } from "uuid";

export const sessionManager = (app) => {
  app.use(
    session({
      genid: () => uuidv4(),
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24,
      },
      name: "app.sid",
    }),
  );

  app.use((req, res, next) => {
    if (!req.session.initialized) {
      req.session.initialized = true;
      req.session.createdAt = new Date().toString();
      req.session.views = 0;
    }

    req.session.views = (req.session.views || 0) + 1;

    req.getSessionInfo = function () {
      return {
        id: this.sessionID,
        createdAt: this.session.createdAt,
        views: this.session.views,
        user: this.session.user || null,
        lastActivity: this.session.lastActivity || null,
      };
    };

    req.session.lastActivity = new Date().toString();

    next();
  });
};

export const sessionAuth = (options = {}) => {
  return (req, res, next) => {
    if (!req.session.user) {
      if (options.publicRoutes?.includes(req.path)) {
        return next();
      }

      if (req.method === "GET") {
        req.session.returnTo = req.originalUrl;
      }
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.isAuthenticated = true;
    next();
  };
};

export const flashMessage = () => {
  return (req, res, next) => {
    req.flash = (type, message) => {
      if (!req.session.flash) {
        req.session.flash = {};
      }
      if (!req.session.flash[type]) {
        req.session.flash[type] = [];
      }
      req.session.flash[type].push(message);
    };

    res.locals.getFlash = (type) => {
      if (!req.session.flash || !req.session.flash[type]) {
        return [];
      }
      const messages = req.session.flash[type];
      delete req.session.flash[type];
      return messages;
    };

    res.locals.flash = req.session.flash || {};
    next();
  };
};
