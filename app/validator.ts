import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";

export const createCustomAjv = () => {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
    $data: true,
  });

  // Add standard formats (email, date, etc.)
  addFormats(ajv);

  // Custom keyword:  alphanumeric with spaces
  ajv.addKeyword({
    keyword: "alphanumericSpaces",
    validate: function validate(schema: boolean, data: string) {
      if (!data || !schema) return true;

      const regex = /^[a-zA-Z0-9\s]+$/;
      const valid = regex.test(data);

      if (!valid) {
        (validate as any).errors = [
          {
            keyword: "alphanumericSpaces",
            message: "Name can only contain letters, numbers, and spaces",
            params: { alphanumericSpaces: schema },
          },
        ];
      }

      return valid;
    },
    errors: true,
  });

  // Custom keyword: no leading/trailing spaces
  ajv.addKeyword({
    keyword: "noLeadingTrailingSpaces",
    validate: function validate(schema: boolean, data: string) {
      if (!data || !schema) return true;

      const valid = data === data.trim();

      if (!valid) {
        (validate as any).errors = [
          {
            keyword: "noLeadingTrailingSpaces",
            message: "Field cannot have leading or trailing spaces",
            params: { noLeadingTrailingSpaces: schema },
          },
        ];
      }

      return valid;
    },
    errors: true,
  });

  // Custom keyword:  minimum age validation
  ajv.addKeyword({
    keyword: "minAge",
    validate: function validate(schema: number, data: string) {
      if (!data) return false;

      const birthDate = new Date(data);
      const today = new Date();

      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        (validate as any).errors = [
          {
            keyword: "minAge",
            message: "Invalid date format",
            params: { minAge: schema },
          },
        ];
        return false;
      }

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      const valid = age >= schema;

      if (!valid) {
        (validate as any).errors = [
          {
            keyword: "minAge",
            message: `You must be at least ${schema} years old (current age: ${age})`,
            params: { minAge: schema, currentAge: age },
          },
        ];
      }

      return valid;
    },
    errors: true,
  });

  // Custom keyword: not future date
  ajv.addKeyword({
    keyword: "notFutureDate",
    validate: function validate(schema: boolean, data: string) {
      if (!data || !schema) return true;

      const selectedDate = new Date(data);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const valid = selectedDate <= today;

      if (!valid) {
        (validate as any).errors = [
          {
            keyword: "notFutureDate",
            message: "Date of birth cannot be in the future",
            params: { notFutureDate: schema },
          },
        ];
      }

      return valid;
    },
    errors: true,
  });

  return ajv;
};

// Custom error message formatter
export const formatAjvErrors = (
  errors: ErrorObject[] | undefined
): string[] => {
  if (!errors || errors.length === 0) return [];

  return errors.map((error) => {
    const fieldName = error.instancePath.split("/").pop() || "Field";

    switch (error.keyword) {
      case "required":
        return `${error.params.missingProperty} is required`;

      case "minLength":
        return `${fieldName} must be at least ${error.params.limit} characters`;

      case "maxLength":
        return `${fieldName} must not exceed ${error.params.limit} characters`;

      case "format":
        if (error.params.format === "email") {
          return "Please enter a valid email address";
        }
        if (error.params.format === "date") {
          return "Please enter a valid date";
        }
        return `Invalid ${error.params.format} format`;

      case "enum":
        return `Please select a valid ${fieldName}`;

      case "const":
        if (fieldName === "isAgreed") {
          return "You must agree to the terms and conditions";
        }
        return "Invalid value";

      case "minAge":
        return error.message || "Age requirement not met";

      case "notFutureDate":
        return error.message || "Date cannot be in the future";

      case "alphanumericSpaces":
        return error.message || "Only letters, numbers, and spaces allowed";

      case "noLeadingTrailingSpaces":
        return error.message || "No spaces at start or end";

      case "type":
        if (error.params.type === "boolean") {
          return `${fieldName} must be checked`;
        }
        return `${fieldName} must be ${error.params.type}`;

      default:
        return error.message || "Invalid value";
    }
  });
};
