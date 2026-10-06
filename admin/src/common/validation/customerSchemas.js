import { z } from 'zod';
import validationRules, {
  validateStrictEmail,
  validateStrictPhone,
} from '../../utils/validationRules.js';

export { POSTAL_CODE_6_DIGIT_REGEX } from '../../utils/validationRules.js';

const addCustomIssue = (ctx, path, message) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: [path],
    message,
  });
};

const validateAddressName = (addrName, ctx, nameLabel) => {
  if (addrName.length === 0) {
    addCustomIssue(ctx, 'addressName', `${nameLabel} is required`);
  } else if (addrName.length < 2) {
    addCustomIssue(ctx, 'addressName', 'Name must be at least 2 characters long');
  } else if (addrName.length > 100) {
    addCustomIssue(ctx, 'addressName', 'Name cannot exceed 100 characters');
  }
};

const validateAddressPhone = (addrPhone, ctx, phoneLabel) => {
  if (addrPhone.length === 0) {
    addCustomIssue(ctx, 'addressPhone', `${phoneLabel} is required`);
    return;
  }
  const phoneResult = validateStrictPhone(addrPhone);
  if (phoneResult.isValid === false) {
    addCustomIssue(ctx, 'addressPhone', phoneResult.message || 'Invalid phone number');
  }
};

const validateAddressText = (streetVal, ctx) => {
  if (streetVal.length === 0) {
    addCustomIssue(ctx, 'address', 'Street address is required');
  } else if (streetVal.length < 5) {
    addCustomIssue(ctx, 'address', 'Address must be at least 5 characters long');
  }
};

const validateAddressLocation = (field, val, label, ctx) => {
  if (val.length === 0) {
    addCustomIssue(ctx, field, `${label} is required`);
  } else if (val.length < 2) {
    addCustomIssue(ctx, field, `${label} must be at least 2 characters long`);
  } else if (val.length > 100) {
    addCustomIssue(ctx, field, `${label} cannot exceed 100 characters`);
  }
};

const validatePostalCode = (pinVal, ctx) => {
  if (pinVal.length === 0) {
    addCustomIssue(ctx, 'postalCode', 'PIN / Postal code is required');
  } else if (validationRules.POSTAL_CODE_6_DIGIT_REGEX.test(pinVal) === false) {
    addCustomIssue(ctx, 'postalCode', 'PIN / Postal code must be exactly 6 digits');
  }
};

const validateFullAddressData = (data, ctx, isEdit) => {
  const nameVal = data.name.trim();
  const phoneVal = (data.phone || '').trim();
  const addrName = data.addressName?.trim() || nameVal;
  const addrPhone = data.addressPhone?.trim() || phoneVal;
  const streetVal = data.address?.trim() || '';
  const cityVal = data.city?.trim() || '';
  const stateVal = data.state?.trim() || '';
  const pinVal = data.postalCode?.trim() || '';

  const nameLabel = isEdit ? 'Recipient name' : 'Full name';
  const phoneLabel = isEdit ? 'Contact phone number' : 'Phone number';

  validateAddressName(addrName, ctx, nameLabel);
  validateAddressPhone(addrPhone, ctx, phoneLabel);
  validateAddressText(streetVal, ctx);
  validateAddressLocation('city', cityVal, 'City', ctx);
  validateAddressLocation('state', stateVal, 'State', ctx);
  validatePostalCode(pinVal, ctx);
};

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
      { message: 'Invalid phone number' }
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
    .regex(validationRules.POSTAL_CODE_6_DIGIT_REGEX, 'PIN / Postal code must be exactly 6 digits'),
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
        { message: 'Invalid email address' }
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
        { message: 'Invalid phone number' }
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
      validateFullAddressData(data, ctx, false);
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
        { message: 'Invalid email address' }
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
        { message: 'Invalid phone number' }
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
      data.address?.trim() ||
      data.city?.trim() ||
      data.state?.trim() ||
      data.postalCode?.trim()
    );

    if (hasAnyAddressValue) {
      validateFullAddressData(data, ctx, true);
    }
  });

export default {
  addressSchema,
  createCustomerSchema,
  customerEditSchema,
};
