import { z } from "zod";

export const companyLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type CompanyLoginInput = z.infer<typeof companyLoginSchema>;

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  twoFactorCode: z
    .string()
    .min(1, "2FA code is required")
    .length(6, "Enter the 6-digit code"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
