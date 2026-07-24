"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, Mail, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { adminRegisterSchema, type AdminRegisterInput } from "@/lib/validations/auth";
import { signUpSuperAdmin } from "@/lib/actions/auth";

export function AdminRegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<AdminRegisterInput>({
    resolver: zodResolver(adminRegisterSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  function onSubmit(values: AdminRegisterInput) {
    setServerError(null);
    setIsSuccess(false);
    startTransition(async () => {
      const result = await signUpSuperAdmin(values);
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription className="text-xs">{serverError}</AlertDescription>
          </Alert>
        )}

        {isSuccess && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <AlertDescription className="text-xs">
              Registration successful! Redirecting to login...
            </AlertDescription>
          </Alert>
        )}

        {/* Full Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Full Name
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="John Doe"
                    disabled={isPending || isSuccess}
                    className={`pl-9 bg-background border-input text-foreground h-10 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 transition-all ${
                      fieldState.invalid ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40" : ""
                    }`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive font-medium" />
            </FormItem>
          )}
        />

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
                    disabled={isPending || isSuccess}
                    className={`pl-9 bg-background border-input text-foreground h-10 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 transition-all ${
                      fieldState.invalid ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40" : ""
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
                    type="password"
                    placeholder="••••••••"
                    disabled={isPending || isSuccess}
                    className={`pl-9 bg-background border-input text-foreground h-10 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 transition-all ${
                      fieldState.invalid ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40" : ""
                    }`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive font-medium" />
            </FormItem>
          )}
        />

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isPending || isSuccess}
                    className={`pl-9 bg-background border-input text-foreground h-10 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 transition-all ${
                      fieldState.invalid ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40" : ""
                    }`}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive font-medium" />
            </FormItem>
          )}
        />

        {/* Action Button */}
        <div className="pt-2 space-y-2">
          <Button
            type="submit"
            disabled={isPending || isSuccess}
            className="w-full h-10 rounded-xl font-bold bg-violet-600 hover:bg-violet-750 text-white transition-all shadow-md focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Register admin account"
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-1">
          Already have an account?{" "}
          <a href="/admin/login" className="font-semibold text-violet-500 dark:text-violet-400 hover:underline">
            Sign in
          </a>
        </div>
      </form>
    </Form>
  );
}
