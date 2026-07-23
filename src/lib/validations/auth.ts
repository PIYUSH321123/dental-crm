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
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const staffLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  companySlug: z.string().min(1, "Company slug is required"),
});

export type StaffLoginInput = z.infer<typeof staffLoginSchema>;

export const patientLoginSchema = z.object({
  emailOrMobile: z
    .string()
    .min(1, "Email or mobile number is required")
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const digits = val.replace(/[^0-9]/g, "");
        const isMobile = digits.length >= 7 && digits.length <= 15;
        return isEmail || isMobile;
      },
      { message: "Please enter a valid email address or mobile number" }
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  companySlug: z.string().min(1, "Company slug is required"),
});

export type PatientLoginInput = z.infer<typeof patientLoginSchema>;
