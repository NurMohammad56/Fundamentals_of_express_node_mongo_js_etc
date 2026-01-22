export const requestAnalyzer = (options = {}) => {
  return (req, res, next) => {
    req.requestId = Date.now() + Math.random().toString(36).substring(2, 9);

    req._startTime = process.hrtime();
    req.startTimestamp = new Date().toISOString();

    if (options.logRequests !== false) {
      console.log(`\n INCOMING REQUEST:`);
      console.log(`Request ID: ${req.requestId}`);
      console.log(`Time: ${req.startTimestamp}`);
      console.log(`Method: ${req.method}`);
      console.log(`Path: ${req.originalUrl}`);
      console.log(`IP: ${req.ip}`);
      console.log(`User Agent: ${req.get("User-Agent")}`);
    }

    const originalEnd = res.end;
    res.end = function (...args) {
      const diff = process.hrtime(req._startTime);
      const responseTime = diff[0] * 1e3 + diff[1] / 1e6; // in ms

      res.setHeader("X-Response-Time-ms", responseTime.toFixed(3));
      res.setHeader("X-Request-ID", req.requestId);

      if (options.logRequests !== false) {
        console.log(`RESPONSE SENT:`);
        console.log(`Request ID: ${req.requestId}`);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Time: ${responseTime.toFixed(3)} ms\n`);
      }

      originalEnd.apply(res, args);
    };

    next();
  };
};

export const requestValidator = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Body validation
    if (schema.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];

        if (rules.required && !value) {
          errors.push({ field, message: `${field} is required.` });
          continue;
        }

        if (value != null) {
          if (rules.type && typeof value !== rules.type) {
            errors.push({ field, message: `${field} must be ${rules.type}.` });
          }

          if (rules.minLength && value.length < rules.minLength) {
            errors.push({ field, message: `${field} is too short.` });
          }

          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push({ field, message: `${field} is too long.` });
          }
        }
      }
    }

    // Query validation
    if (schema.query) {
      for (const [field, rules] of Object.entries(schema.query)) {
        if (rules.required && !req.query[field]) {
          errors.push({ field, message: `Query ${field} is required.` });
        }
      }
    }

    // Params validation
    if (schema.params) {
      for (const [field, rules] of Object.entries(schema.params)) {
        if (rules.required && !req.params[field]) {
          errors.push({ field, message: `Param ${field} is required.` });
        }
      }
    }

    if (errors.length > 0) {
      const error = new Error("Validation Failed");
      error.statusCode = 400;
      error.details = errors;
      return next(error);
    }

    next();
  };
};
