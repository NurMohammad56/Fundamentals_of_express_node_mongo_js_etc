export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const asyncHandlerWithTimeout = (fn, timeoutMs = 5000) => {
  return async (req, res, next) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request Time out After ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      await Promise.race([Promise.resolve(fn(req, res, next)), timeoutPromise]);
    } catch (error) {
      next(error);
    }
  };
};
