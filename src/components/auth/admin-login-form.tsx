"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldAlert, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/auth";
import { signInSuperAdmin } from "@/lib/actions/auth";

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: AdminLoginInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await signInSuperAdmin(values);
      if (!result.success) {
        setServerError(result.error);

        // Track attempts remaining on failure
        setAttemptsRemaining((prev) => {
          if (prev === null) return 2; // Second attempt remaining after first failure
          return Math.max(0, prev - 1);
        });
        return;
      }

      // Success redirect
      router.push("/admin/dashboard");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <Alert variant="destructive" className="bg-rose-950/20 border-rose-900/50 text-rose-200 rounded-xl">
            <AlertDescription className="text-xs">{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Admin email
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@physioyoga.com"
                    autoComplete="email"
                    disabled={isPending}
                    className={`pl-9 bg-background border-input text-foreground h-10 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 transition-all ${fieldState.invalid ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40" : ""
                      }`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive font-medium" />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isPending}
                    className={`pl-9 pr-10 bg-background border-input text-foreground h-10 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 transition-all ${fieldState.invalid ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40" : ""
                      }`}
                    {...field}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={isPending}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground focus:outline-hidden transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive font-medium" />
            </FormItem>
          )}
        />

        {/* Action Button & Attempts counter */}
        <div className="pt-2 space-y-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-xl font-bold bg-violet-600 hover:bg-violet-750 text-white transition-all shadow-md focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              "Sign in as admin"
            )}
          </Button>

          {attemptsRemaining !== null && (
            <p className="text-[11px] text-center text-destructive font-semibold animate-pulse">
              Attempts remaining: {attemptsRemaining}
            </p>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground pt-1">
          Need super admin access?{" "}
          <a href="/admin/register" className="font-semibold text-violet-500 dark:text-violet-400 hover:underline">
            Register here
          </a>
        </div>

        {/* Security Notice Box */}
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-4 mt-4">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-violet-500 dark:text-violet-400" />
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground leading-normal font-medium">
              All sign-in attempts are logged and monitored for security.
            </p>
            <p className="text-[10px] text-muted-foreground/80 font-mono">
              Last successful login: 2 days ago from a recognized device
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
}

/*
  NOTE FOR FUTURE IMPLEMENTATION:
  =================================
  To add a "This device is not recognized — verify via email" fallback flow:
  1. Catch a specific error code (e.g., 'DEVICE_UNRECOGNIZED') from the backend API response.
  2. Transition to a secondary state screen displaying a "Verification Code Sent" message.
  3. Render a single verification input field mapped to a verify action e.g. `verifyUnrecognizedDevice(email, code)`.
  4. Once confirmed, store a 'trusted_device' token in localStorage or cookies to skip future prompts.
*/
