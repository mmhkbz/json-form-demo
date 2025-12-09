"use client";

import { useState, useCallback } from "react";

export const useAsyncValidation = () => {
  const [validating, setValidating] = useState(false);
  const [asyncErrors, setAsyncErrors] = useState<Map<string, string>>(
    new Map()
  );

  const validateEmailUnique = useCallback(
    async (email: string): Promise<boolean> => {
      if (!email || email.length < 5) {
        return true;
      }

      try {
        setValidating(true);
        const response = await fetch(
          `/api/validate/email? email=${encodeURIComponent(email)}`
        );
        const data = await response.json();

        if (!data.available) {
          setAsyncErrors((prev) =>
            new Map(prev).set("email", "Email is already registered")
          );
          return false;
        } else {
          setAsyncErrors((prev) => {
            const newMap = new Map(prev);
            newMap.delete("email");
            return newMap;
          });
          return true;
        }
      } catch (error) {
        console.error("Email validation error:", error);
        return true; // Allow on error
      } finally {
        setValidating(false);
      }
    },
    []
  );

  const clearAsyncError = useCallback((field: string) => {
    setAsyncErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(field);
      return newMap;
    });
  }, []);

  const clearAllAsyncErrors = useCallback(() => {
    setAsyncErrors(new Map());
  }, []);

  return {
    validating,
    asyncErrors,
    validateEmailUnique,
    clearAsyncError,
    clearAllAsyncErrors,
  };
};
