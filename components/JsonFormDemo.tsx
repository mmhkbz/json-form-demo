import { FC, useMemo, useState, useCallback, useEffect } from "react";
import { JsonForms } from "@jsonforms/react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import schema from "../schema.json";
import uischema from "../ui-schema.json";
import ratingControlTester from "./ratingControlTester";
import { RatingControlWithJsonForms } from "./RatingControl";
import { createCustomAjv, formatAjvErrors } from "@/app/validator";
import { useAsyncValidation } from "@/app/useAsyncValidation";

const classes = {
  container: {
    padding: "1em",
    width: "100%",
  },
  title: {
    textAlign: "center",
    padding: "0.25em",
  },
  dataContent: {
    display: "flex",
    justifyContent: "center",
    borderRadius: "0.25em",
    backgroundColor: "#cecece",
    marginBottom: "1rem",
    padding: "1rem",
  },
  resetButton: {
    margin: "auto !important",
    display: "block !important",
  },
  demoform: {
    margin: "auto",
    padding: "1rem",
  },
};

const initialData = {
  name: "",
  email: "",
  DateofBirth: "",
  gender: "",
  isAgreed: false,
};

const renderers = [
  ...materialRenderers,
  //register custom renderers
  { tester: ratingControlTester, renderer: RatingControlWithJsonForms },
];

export const JsonFormsDemo: FC = () => {
  const [data, setData] = useState<any>(initialData);
  const [schemaErrors, setSchemaErrors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const stringifiedData = useMemo(() => JSON.stringify(data, null, 2), [data]);

  // Create custom AJV instance
  const ajv = createCustomAjv();

  // Async validation hook
  const { validating, asyncErrors, validateEmailUnique, clearAllAsyncErrors } =
    useAsyncValidation();

  // Debounced email validation
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (data.email) {
      const timer = setTimeout(() => {
        validateEmailUnique(data.email);
      }, 800);
      setDebounceTimer(timer);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [data.email]);

  // Check if form can be submitted
  const canSubmit = useCallback(() => {
    const hasSchemaErrors = schemaErrors.length > 0;
    const hasAsyncErrors = asyncErrors.size > 0;
    const isProcessing = validating || isSubmitting;

    // Check required fields
    const hasRequiredFields =
      data.name &&
      data.email &&
      data.DateofBirth &&
      data.gender &&
      data.isAgreed === true;

    return (
      !hasSchemaErrors && !hasAsyncErrors && !isProcessing && hasRequiredFields
    );
  }, [schemaErrors, asyncErrors, validating, isSubmitting, data]);

  // Handle form submission with validation guard
  const handleSubmit = async () => {
    // Validation guard - prevent submission
    if (!canSubmit()) {
      console.warn("❌ Form submission blocked:  Validation errors exist");
      setSubmitError("Please fix all validation errors before submitting");
      return;
    }

    console.log("✅ Form validation passed - submitting to API");

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // API call
      const response = await fetch("/api/sample-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      console.log("✅ API submission successful:", result);
      setSubmitSuccess(true);

      // Reset form
      setTimeout(() => {
        clearData();
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("❌ Submission error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Submission failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearData = () => {
    setData(initialData);
    setSchemaErrors([]);
    setSubmitError(null);
    setSubmitSuccess(false);
    clearAllAsyncErrors();
  };

  const formattedSchemaErrors = formatAjvErrors(schemaErrors);
  const formattedAsyncErrors = Array.from(asyncErrors.values());
  const allErrors = [...formattedSchemaErrors, ...formattedAsyncErrors];
  const isFormValid = canSubmit();

  return (
    <Grid
      container
      justifyContent={"center"}
      spacing={1}
      style={classes.container}
    >
      {/* Left Side - Form Data Display */}
      <Grid size={{ sm: 6 }}>
        <Typography variant={"h4"} style={classes.title}>
          Form Data
        </Typography>

        {/* Validation Status */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 2 }}
        >
          {isFormValid && !validating && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Form Valid"
              color="success"
              size="small"
            />
          )}
          {!isFormValid && !validating && allErrors.length > 0 && (
            <Chip
              icon={<ErrorIcon />}
              label={`${allErrors.length} Error${
                allErrors.length > 1 ? "s" : ""
              }`}
              color="error"
              size="small"
            />
          )}
          {validating && (
            <Chip
              icon={<CircularProgress size={14} />}
              label="Validating..."
              color="warning"
              size="small"
            />
          )}
        </Stack>

        {/* Data Display */}
        <div style={classes.dataContent}>
          <pre id="boundData">{stringifiedData}</pre>
        </div>

        {/* Action Buttons */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Button
            style={classes.resetButton}
            onClick={clearData}
            color="secondary"
            variant="outlined"
            data-testid="clear-data"
            disabled={isSubmitting}
          >
            Clear Data
          </Button>

          <Button
            style={classes.resetButton}
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!isFormValid || isSubmitting}
            startIcon={
              (isSubmitting || validating) && (
                <CircularProgress size={20} color="inherit" />
              )
            }
          >
            {isSubmitting
              ? "Submitting..."
              : validating
              ? "Validating..."
              : "Submit Form"}
          </Button>
        </Stack>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Form submitted successfully!
          </Alert>
        )}

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Validation Summary */}
        {!isFormValid && !submitSuccess && (
          <Paper
            elevation={2}
            sx={{ p: 2, bgcolor: "error.light", color: "error.contrastText" }}
          >
            <Typography variant="caption" display="block" textAlign="center">
              ⚠️{" "}
              {validating
                ? "Please wait while validating..."
                : "Form cannot be submitted with errors"}
            </Typography>
          </Paper>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              🔧 Debug Information
            </Typography>
            <Typography variant="caption" component="div">
              <strong>Can Submit:</strong> {canSubmit() ? "✅ Yes" : "❌ No"}
            </Typography>
            <Typography variant="caption" component="div">
              <strong>Schema Errors:</strong> {schemaErrors.length}
            </Typography>
            <Typography variant="caption" component="div">
              <strong>Async Errors: </strong> {asyncErrors.size}
            </Typography>
            <Typography variant="caption" component="div">
              <strong>Is Validating:</strong> {validating ? "⏳ Yes" : "✅ No"}
            </Typography>
            <Typography variant="caption" component="div">
              <strong>Is Submitting:</strong>{" "}
              {isSubmitting ? "⏳ Yes" : "✅ No"}
            </Typography>
          </Box>
        )}
      </Grid>

      {/* Right Side - Registration Form */}
      <Grid size={{ sm: 6 }}>
        <Typography variant={"h4"} style={classes.title}>
          Registration Form
        </Typography>

        {/* Loading Indicator */}
        {(validating || isSubmitting) && <LinearProgress sx={{ mb: 2 }} />}

        {/* Validation Errors Display */}
        {allErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Please fix the following errors:
            </Typography>
            <List dense sx={{ py: 0 }}>
              {allErrors.map((error, idx) => (
                <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ErrorIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={error}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {/* JSON Form */}
        <div style={classes.demoform}>
          <JsonForms
            schema={schema}
            uischema={uischema}
            data={data}
            renderers={renderers}
            cells={materialCells}
            ajv={ajv}
            onChange={({ data, errors }) => {
              console.log("Form data changed:", data);
              console.log("Validation errors:", errors);
              setData(data);
              setSchemaErrors(errors || []);
            }}
          />
        </div>

        {/* Helper Text */}
        <Box sx={{ mt: 2, px: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center"
          >
            * All fields are required
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};
