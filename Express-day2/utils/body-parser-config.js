import express from "express";

export const bodyParserConfig = (app) => {
  app.use(
    express.json({
      limit: "10mb",
      verify: (req, res, buffer, encoding) => {
        req.rawBody = buffer.toString(encoding || "utf-8");
      },
    }),
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: "10mb",
      parameterLimit: 10000,
    }),
  );

  app.use(express.text({ type: ["text/plain"], limit: "5mb" }));

  app.use(
    express.raw({
      type: ["application/octet-stream", "image/*"],
      limit: "5mb",
    }),
  );
};

export const customBodyParser = (options = {}) => {
  return (req, res, next) => {
    if (req.is("application/json")) {
      return express.json(options)(req, res, next);
    }

    if (req.is("application/x-www-form-urlencoded")) {
      return express.urlencoded({ extended: true, ...options })(req, res, next);
    }

    if (req.is("text/plain")) {
      return express.text(options)(req, res, next);
    }

    if (req.is(["application/octet-stream", "image/*"])) {
      return express.raw(options)(req, res, next);
    }

    next();
  };
};
