/**
 * Form Validation System - Production-Grade Input Validation
 * Provides comprehensive validation rules and real-time feedback
 */

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// Validation rules
export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  github: /^https?:\/\/(www\.)?github\.com\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Validation functions
export class FormValidator {
  static required(value: any, message = 'This field is required'): ValidationResult {
    const isValid = value !== undefined && value !== null && value !== '';
    return {
      isValid,
      errors: isValid ? [] : [message],
      warnings: []
    };
  }

  static email(value: string, message = 'Please enter a valid email address'): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const isValid = VALIDATION_PATTERNS.email.test(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
      warnings: []
    };
  }

  static minLength(value: string, min: number, message?: string): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const isValid = value.length >= min;
    return {
      isValid,
      errors: isValid ? [] : [message || `Minimum ${min} characters required`],
      warnings: []
    };
  }

  static maxLength(value: string, max: number, message?: string): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const isValid = value.length <= max;
    return {
      isValid,
      errors: isValid ? [] : [message || `Maximum ${max} characters allowed`],
      warnings: []
    };
  }

  static pattern(value: string, pattern: RegExp, message = 'Invalid format'): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const isValid = pattern.test(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
      warnings: []
    };
  }

  static url(value: string, message = 'Please enter a valid URL'): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const isValid = VALIDATION_PATTERNS.url.test(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
      warnings: []
    };
  }

  static custom(value: any, validator: (value: any) => boolean, message: string): ValidationResult {
    const isValid = validator(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
      warnings: []
    };
  }

  static password(value: string): ValidationResult {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (value.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(value)) {
      warnings.push('Consider adding uppercase letters');
    }
    
    if (!/[a-z]/.test(value)) {
      warnings.push('Consider adding lowercase letters');
    }
    
    if (!/\d/.test(value)) {
      warnings.push('Consider adding numbers');
    }
    
    if (!/[@$!%*?&]/.test(value)) {
      warnings.push('Consider adding special characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static combine(...results: ValidationResult[]): ValidationResult {
    return {
      isValid: results.every(r => r.isValid),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings)
    };
  }
}

// Validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, (value: any) => ValidationResult>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string[]>>>({});
  const [warnings, setWarnings] = useState<Partial<Record<keyof T, string[]>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = (field: keyof T, value: any): ValidationResult => {
    const validator = validationRules[field];
    if (!validator) return { isValid: true, errors: [], warnings: [] };
    
    return validator(value);
  };

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string[]>> = {};
    const newWarnings: Partial<Record<keyof T, string[]>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const result = validateField(field as keyof T, values[field as keyof T]);
      
      if (result.errors.length > 0) {
        newErrors[field as keyof T] = result.errors;
        isValid = false;
      }
      
      if (result.warnings.length > 0) {
        newWarnings[field as keyof T] = result.warnings;
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);
    return isValid;
  };

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate on change if field has been touched
    if (touched[field]) {
      const result = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: result.errors }));
      setWarnings(prev => ({ ...prev, [field]: result.warnings }));
    }
  };

  const handleBlur = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const result = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: result.errors }));
    setWarnings(prev => ({ ...prev, [field]: result.warnings }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setWarnings({});
    setTouched({});
  };

  return {
    values,
    errors,
    warnings,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  };
}

// Validation feedback component
interface ValidationFeedbackProps {
  errors?: string[];
  warnings?: string[];
  touched?: boolean;
  showSuccess?: boolean;
}

export function ValidationFeedback({ 
  errors = [], 
  warnings = [], 
  touched = false,
  showSuccess = false 
}: ValidationFeedbackProps) {
  if (!touched) return null;

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isValid = !hasErrors && touched;

  return (
    <div className="space-y-2 mt-2">
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 text-xs text-red-600">
              <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {!hasErrors && hasWarnings && (
        <div className="space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {!hasErrors && !hasWarnings && showSuccess && isValid && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span>Looks good!</span>
        </div>
      )}
    </div>
  );
}

// Input wrapper with validation
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string[];
  warning?: string[];
  touched?: boolean;
  helpText?: string;
}

export function ValidatedInput({
  label,
  error = [],
  warning = [],
  touched = false,
  helpText,
  className = '',
  ...props
}: ValidatedInputProps) {
  const hasError = error.length > 0;
  const hasWarning = warning.length > 0 && !hasError;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2
          transition-colors
          ${hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${hasWarning ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-500' : ''}
          ${!hasError && !hasWarning ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500' : ''}
          ${className}
        `}
        {...props}
      />
      
      {helpText && !touched && (
        <p className="text-xs text-gray-500 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5" />
          {helpText}
        </p>
      )}
      
      <ValidationFeedback
        errors={error}
        warnings={warning}
        touched={touched}
        showSuccess={true}
      />
    </div>
  );
}

// Form summary component
interface FormValidationSummaryProps {
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  show?: boolean;
}

export function FormValidationSummary({ 
  errors, 
  warnings,
  show = true 
}: FormValidationSummaryProps) {
  if (!show) return null;

  const errorCount = Object.values(errors).flat().length;
  const warningCount = Object.values(warnings).flat().length;

  if (errorCount === 0 && warningCount === 0) return null;

  return (
    <div className="space-y-3">
      {errorCount > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Please fix {errorCount} error{errorCount > 1 ? 's' : ''}:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(errors).map(([field, fieldErrors]) =>
                fieldErrors.map((error, index) => (
                  <li key={`${field}-${index}`} className="flex items-start gap-2">
                    <span className="font-medium capitalize">{field}:</span> {error}
                  </li>
                ))
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warningCount > 0 && errorCount === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{warningCount} suggestion{warningCount > 1 ? 's' : ''}:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(warnings).map(([field, fieldWarnings]) =>
                fieldWarnings.map((warning, index) => (
                  <li key={`${field}-${index}`} className="flex items-start gap-2">
                    <span className="font-medium capitalize">{field}:</span> {warning}
                  </li>
                ))
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Export all utilities
export default {
  FormValidator,
  useFormValidation,
  ValidationFeedback,
  ValidatedInput,
  FormValidationSummary,
  VALIDATION_PATTERNS
};
