import { z } from 'zod';

/**
 * 
 * src/main/utils/validation/z-required.ts
 * 
 * Custom Zod validator to ensure that a field is required, regardless of TypeScript settings.
 * 
 * TypeScript allows fields to be marked as optional or nullable using `?` or `.optional()`. However, in some cases, TypeScript settings or certain constructs (like `strictNullChecks` or `strict` mode) may cause fields to be treated as optional or nullable even if they are intended to be required.
 * 
 * This function ensures that a field will **always** be treated as required in both TypeScript and runtime, by checking that the value is neither `undefined` nor `null`. This prevents the field from being considered optional, even if TypeScript settings or other factors cause it to be inferred as optional.
 * 
 * ### Why is this needed?
 * - When TypeScript's `strictNullChecks` or `strict` mode is enabled, fields that may potentially be `null` or `undefined` are considered optional in type checking.
 * - The `.optional()` method or the `?` modifier in TypeScript marks a field as optional, which could allow it to be `undefined` or `null`.
 * - However, in many cases, we need to ensure that a field is **always required**, and we cannot rely on TypeScript's `strictNullChecks` or `strict` settings to prevent this from happening.
 * 
 * This function provides a solution to ensure that a field is treated as **required** by **both Zod and TypeScript** by adding a runtime check that enforces the field is not `undefined` or `null`.
 * 
 * @param schema - The Zod schema to be validated, which can be any Zod type (string, number, object, etc.).
 * @returns A new schema that enforces that the field is **required** (i.e., it cannot be `undefined` or `null`).
 * 
 * ### Example usage:
 * 
 * const schema = z.object({
 *   name: required(z.string()),
 * });
 * 
 * In this example, the "name" field is enforced to be mandatory. If `name` is `undefined` or `null`, a validation error will be triggered.
 * 
 * The field will not be considered optional, even if TypeScript settings like `strictNullChecks` or `strict` are enabled.
 */
export const required = <T>(schema: z.ZodType<T, any, any>) => {
	return schema.refine((val) => val !== undefined && val !== null, {
		message: "Field is required",
	});
};
