const { AppError } = require("./error-types");

export const notFoundHandler = (req, res, next) => {
  // Create a detailed error
  const error = new AppError(
    `Cannot find ${req.method} ${req.originalUrl}`,
    404,
  );

  // Add additional info for logging
  error.requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  };

  // Log the 404 for analytics
  console.log(`\n🔍 404 NOT FOUND:`);
  console.log(`Path: ${req.method} ${req.originalUrl}`);
  console.log(`IP: ${req.ip}`);
  console.log(`User Agent: ${req.get("User-Agent")}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Pass to error handler
  next(error);
};

// Advanced 404 handler with suggestions
export const smartNotFoundHandler = (req, res, next) => {
  const availableRoutes = [
    { method: "GET", path: "/api/users" },
    { method: "POST", path: "/api/users" },
    { method: "GET", path: "/api/users/:id" },
    { method: "GET", path: "/api/products" },
    { method: "GET", path: "/api/async-error" },
    { method: "GET", path: "/api/cookie-test" },
    { method: "GET", path: "/api/session-test" },
    { method: "GET", path: "/api/validation-test" },
  ];

  // Find similar routes
  const similarRoutes = availableRoutes.filter((route) => {
    const requestedPath = req.path.toLowerCase();
    const routePath = route.path.toLowerCase();

    // Check if paths are similar
    return (
      routePath.includes(requestedPath.split("/")[2]) ||
      requestedPath.includes(routePath.split("/")[2])
    );
  });

  const error = new AppError(
    `Cannot find ${req.method} ${req.originalUrl}`,
    404,
  );

  // Add route suggestions if any
  if (similarRoutes.length > 0) {
    error.suggestions = {
      message: "Did you mean one of these routes?",
      routes: similarRoutes.slice(0, 3), // Show max 3 suggestions
    };
  }

  next(error);
};
