import { ApiError } from "../utils/apiError.js";

export const validate = (schema, target = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => {
        let message = issue.message || "";
        if (
          message.toLowerCase().includes("expected") &&
          message.toLowerCase().includes("received")
        ) {
          const fieldName = issue.path[issue.path.length - 1] || "Field";
          if (issue.received === "null" || issue.received === "undefined") {
            message = `${fieldName} is required`;
          } else {
            message = `${fieldName} must be a valid ${issue.expected}`;
          }
        }

        return {
          field: issue.path.join("."),
          message,
        };
      });

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
