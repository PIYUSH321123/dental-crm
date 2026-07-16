"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { companyLoginSchema, type CompanyLoginInput } from "@/lib/validations/auth";
import { signInCompanyStaff } from "@/lib/actions/auth";

export function CompanyLoginForm({
  companySlug,
  companyName,
  primaryColor,
}: {
  companySlug: string;
  companyName: string;
  primaryColor: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CompanyLoginInput>({
    resolver: zodResolver(companyLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: CompanyLoginInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await signInCompanyStaff(companySlug, values);
      if (!result.success) {
        setServerError(result.error);
        return;
      }
      router.push(`/${companySlug}/dashboard`);
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={`you@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`}
                  autoComplete="email"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <a
                  href={`/${companySlug}/forgot-password`}
                  className="text-xs font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Forgot password?
                </a>
              </div>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full text-white hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            `Sign in to ${companyName}`
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Not staff at this clinic? Contact your admin for access.
        </p>
      </form>
    </Form>
  );
}
