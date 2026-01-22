import express from "express";

const bodyParserConfig = (app) => {
  app.use(
    express.json({
      limit: "10mb",
      verify: (req, res, next) => {
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

export const customBodyParser = (options = []) => {
  return (req, res, next) => {
    if (req.is("json")) {
      express.json(options)(req, res, next);
    } else if (req.is("urlencoded")) {
      express.urlencoded({ extended: true, ...options })(req, res, next);
    } else if (req.is("text/plain")) {
      express.text(options)(req, res, next);
    } else if (req.is("application/octet-stream") || req.is("image/*")) {
      express.raw(options)(req, res, next);
    } else {
      next();
    }
  };
};
