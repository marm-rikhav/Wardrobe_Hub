import { z } from 'zod';
import { validateStrictEmail, validateStrictPhone } from '../../utils/validationRules.js';

export const POSTAL_CODE_6_DIGIT_REGEX = /^\d{6}$/;

/**
 * Zod schema for editing customer shipping address dialog
 */
export const addressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .refine(
      (val) => validateStrictPhone(val).isValid,
      (val) => ({ message: validateStrictPhone(val).message || 'Invalid phone number' })
    ),
  address: z
    .string()
    .trim()
    .min(1, 'Street address is required')
    .min(5, 'Address must be at least 5 characters long'),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters long')
    .max(100, 'City cannot exceed 100 characters'),
  state: z
    .string()
    .trim()
    .min(1, 'State is required')
    .min(2, 'State must be at least 2 characters long')
    .max(100, 'State cannot exceed 100 characters'),
  postalCode: z
    .string()
    .trim()
    .min(1, 'PIN / Postal code is required')
    .regex(POSTAL_CODE_6_DIGIT_REGEX, 'PIN / Postal code must be exactly 6 digits'),
  country: z.string().trim().default('India'),
  isDefault: z.boolean().default(false),
});

/**
 * Zod schema for creating customer with optional address
 */
export const createCustomerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .min(3, 'Name must be at least 3 characters long')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .refine(
        (val) => validateStrictEmail(val).isValid,
        (val) => ({ message: validateStrictEmail(val).message || 'Invalid email address' })
      ),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password cannot exceed 100 characters'),
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => {
          if (val) {
            return validateStrictPhone(val, true).isValid;
          }
          return true;
        },
        (val) => ({ message: validateStrictPhone(val, true).message || 'Invalid phone number' })
      ),
    includeAddress: z.boolean().default(true),
    addressName: z.string().trim().optional().or(z.literal('')),
    addressPhone: z.string().trim().optional().or(z.literal('')),
    address: z.string().trim().optional().or(z.literal('')),
    city: z.string().trim().optional().or(z.literal('')),
    state: z.string().trim().optional().or(z.literal('')),
    postalCode: z.string().trim().optional().or(z.literal('')),
    country: z.string().trim().default('India'),
  })
  .superRefine((data, ctx) => {
    if (data.includeAddress) {
      const nameVal = data.name.trim();
      const phoneVal = (data.phone || '').trim();

      const addrName = (data.addressName || '').trim() || nameVal;
      if (!addrName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressName'],
          message: 'Full name is required',
        });
      } else if (addrName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressName'],
          message: 'Name must be at least 2 characters long',
        });
      } else if (addrName.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressName'],
          message: 'Name cannot exceed 100 characters',
        });
      }

      const addrPhone = (data.addressPhone || '').trim() || phoneVal;
      if (!addrPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressPhone'],
          message: 'Phone number is required',
        });
      } else {
        const phoneResult = validateStrictPhone(addrPhone);
        if (phoneResult.isValid) {
          // valid
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['addressPhone'],
            message: phoneResult.message || 'Invalid phone number',
          });
        }
      }

      const streetVal = (data.address || '').trim();
      if (!streetVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Street address is required',
        });
      } else if (streetVal.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Address must be at least 5 characters long',
        });
      }

      const cityVal = (data.city || '').trim();
      if (!cityVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'City is required',
        });
      } else if (cityVal.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'City must be at least 2 characters long',
        });
      } else if (cityVal.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'City cannot exceed 100 characters',
        });
      }

      const stateVal = (data.state || '').trim();
      if (!stateVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['state'],
          message: 'State is required',
        });
      } else if (stateVal.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['state'],
          message: 'State must be at least 2 characters long',
        });
      } else if (stateVal.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['state'],
          message: 'State cannot exceed 100 characters',
        });
      }

      const pinVal = (data.postalCode || '').trim();
      if (!pinVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['postalCode'],
          message: 'PIN / Postal code is required',
        });
      } else if (!POSTAL_CODE_6_DIGIT_REGEX.test(pinVal)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['postalCode'],
          message: 'PIN / Postal code must be exactly 6 digits',
        });
      }
    }
  });

/**
 * Zod schema for editing customer profile + address in one click
 */
export const customerEditSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .min(3, 'Name must be at least 3 characters long')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .refine(
        (val) => validateStrictEmail(val).isValid,
        (val) => ({ message: validateStrictEmail(val).message || 'Invalid email address' })
      ),
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => {
          if (val) {
            return validateStrictPhone(val, true).isValid;
          }
          return true;
        },
        (val) => ({ message: validateStrictPhone(val, true).message || 'Invalid phone number' })
      ),
    isActive: z.boolean().default(true),
    addressId: z.string().optional().or(z.literal('')),
    addressName: z.string().trim().optional().or(z.literal('')),
    addressPhone: z.string().trim().optional().or(z.literal('')),
    address: z.string().trim().optional().or(z.literal('')),
    city: z.string().trim().optional().or(z.literal('')),
    state: z.string().trim().optional().or(z.literal('')),
    postalCode: z.string().trim().optional().or(z.literal('')),
    country: z.string().trim().default('India'),
  })
  .superRefine((data, ctx) => {
    const hasAnyAddressValue = Boolean(
      data.addressId ||
      (data.address && data.address.trim()) ||
      (data.city && data.city.trim()) ||
      (data.state && data.state.trim()) ||
      (data.postalCode && data.postalCode.trim())
    );

    if (hasAnyAddressValue) {
      const nameVal = data.name.trim();
      const phoneVal = (data.phone || '').trim();

      const addrName = (data.addressName || '').trim() || nameVal;
      if (!addrName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressName'],
          message: 'Recipient name is required',
        });
      } else if (addrName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressName'],
          message: 'Name must be at least 2 characters long',
        });
      } else if (addrName.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressName'],
          message: 'Name cannot exceed 100 characters',
        });
      }

      const addrPhone = (data.addressPhone || '').trim() || phoneVal;
      if (!addrPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['addressPhone'],
          message: 'Contact phone number is required',
        });
      } else {
        const phoneResult = validateStrictPhone(addrPhone);
        if (phoneResult.isValid) {
          // valid
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['addressPhone'],
            message: phoneResult.message || 'Invalid phone number',
          });
        }
      }

      const streetVal = (data.address || '').trim();
      if (!streetVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Street address is required',
        });
      } else if (streetVal.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Address must be at least 5 characters long',
        });
      }

      const cityVal = (data.city || '').trim();
      if (!cityVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'City is required',
        });
      } else if (cityVal.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'City must be at least 2 characters long',
        });
      } else if (cityVal.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['city'],
          message: 'City cannot exceed 100 characters',
        });
      }

      const stateVal = (data.state || '').trim();
      if (!stateVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['state'],
          message: 'State is required',
        });
      } else if (stateVal.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['state'],
          message: 'State must be at least 2 characters long',
        });
      } else if (stateVal.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['state'],
          message: 'State cannot exceed 100 characters',
        });
      }

      const pinVal = (data.postalCode || '').trim();
      if (!pinVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['postalCode'],
          message: 'PIN / Postal code is required',
        });
      } else if (!POSTAL_CODE_6_DIGIT_REGEX.test(pinVal)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['postalCode'],
          message: 'PIN / Postal code must be exactly 6 digits',
        });
      }
    }
  });

export default {
  addressSchema,
  createCustomerSchema,
  customerEditSchema,
};
