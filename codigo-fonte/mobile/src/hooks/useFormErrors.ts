import { useState } from "react";

export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function clearError(field: string) {
    setErrors((current) => {
      if (!(field in current)) {
        return current;
      }
      const { [field]: _removed, ...rest } = current;
      return rest;
    });
  }

  return { errors, setErrors, clearError };
}
