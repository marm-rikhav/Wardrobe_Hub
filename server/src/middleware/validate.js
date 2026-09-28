import { ApiError } from "../utils/apiError.js";

export const validate = (schema, target = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new ApiError(400, "Validation failed", formattedErrors));
    }

    // Replace req[target] with sanitized and validated data
    if (target === "query") {
      for (const key of Object.keys(req.query)) {
        delete req.query[key];
      }
      Object.assign(req.query, result.data);
    } else {
      req[target] = result.data;
    }
    return next();
  };
};

export default validate;
