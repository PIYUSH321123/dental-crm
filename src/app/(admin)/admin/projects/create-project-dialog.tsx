"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProjectAction } from "@/lib/actions/projects";
import { getCompaniesListAction } from "@/lib/actions/companies";
import { toast } from "sonner";
import { Plus, Building2, Briefcase, Sparkles, CheckCircle2 } from "lucide-react";

interface CompanyOption {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
}

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const router = useRouter();

  // Mode: "existing" or "new"
  const [companyMode, setCompanyMode] = useState<"existing" | "new">("new");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const [formData, setFormData] = useState({
    projectName: "",
    companyName: "",
    leadName: "",
    email: "",
    subscriptionPlan: "Basic" as "Basic" | "Pro" | "Growth" | "Enterprise",
    budget: "",
    adminPassword: "",
  });

  // Fetch companies whenever dialog opens
  useEffect(() => {
    if (open) {
      setFetchingCompanies(true);
      getCompaniesListAction()
        .then((data) => {
          setCompanies(data || []);
          if (data && data.length > 0) {
            setCompanyMode("existing");
            setSelectedCompanyId(data[0].id);
          } else {
            setCompanyMode("new");
            setSelectedCompanyId("");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch companies:", err);
          setCompanyMode("new");
        })
        .finally(() => {
          setFetchingCompanies(false);
        });
    }
  }, [open]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const budgetNum = parseFloat(formData.budget) || 0;

      if (companyMode === "existing") {
        if (!selectedCompanyId) {
          toast.error("Please select an existing company.");
          setLoading(false);
          return;
        }

        const res = await createProjectAction({
          projectName: formData.projectName,
          companyId: selectedCompanyId,
          budget: budgetNum,
        });

        if (res.success) {
          toast.success(res.message);
          setOpen(false);
          resetForm();
          router.refresh();
        } else {
          toast.error(res.error);
        }
      } else {
        // New Company Flow
        const res = await createProjectAction({
          projectName: formData.projectName,
          companyName: formData.companyName,
          leadName: formData.leadName,
          email: formData.email,
          subscriptionPlan: formData.subscriptionPlan,
          budget: budgetNum,
          adminPassword: formData.adminPassword,
        });

        if (res.success) {
          toast.success(res.message);
          setOpen(false);
          resetForm();
          router.refresh();
        } else {
          toast.error(res.error);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      companyName: "",
      leadName: "",
      email: "",
      subscriptionPlan: "Basic",
      budget: "",
      adminPassword: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              Create Project
            </DialogTitle>
            <DialogDescription>
              Deploy a new project workspace under an existing company or provision a new company.
            </DialogDescription>
          </DialogHeader>

          {/* Company Assignment Selector */}
          <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Company Association
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCompanyMode("existing")}
                disabled={companies.length === 0}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  companyMode === "existing"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Existing Company ({companies.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCompanyMode("new")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  companyMode === "new"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>+ Create New Company</span>
              </button>
            </div>

            {companyMode === "existing" && (
              <div className="pt-2 space-y-2">
                <Label htmlFor="existingCompany" className="text-xs">
                  Select Existing Company
                </Label>
                {fetchingCompanies ? (
                  <div className="text-xs text-muted-foreground animate-pulse py-1">
                    Loading existing companies...
                  </div>
                ) : (
                  <Select
                    value={selectedCompanyId}
                    onValueChange={(val) => setSelectedCompanyId(val)}
                  >
                    <SelectTrigger id="existingCompany" className="h-9">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedCompany && (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Attaching to <strong>{selectedCompany.name}</strong>. Existing admin credentials will be reused.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid gap-3 py-1">
            {/* Project Name (Always required) */}
            <div className="grid gap-1.5">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                placeholder="e.g. Yoga Therapy Center"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                A clean URL slug will automatically be generated from this project name.
              </p>
            </div>

            {/* Additional Fields for New Company */}
            {companyMode === "new" && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="companyName">Company / Clinic Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g. Apex Wellness Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="leadName">Lead Contact *</Label>
                    <Input
                      id="leadName"
                      placeholder="e.g. John Doe"
                      value={formData.leadName}
                      onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Lead Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. john@apex.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="adminPassword">Initial Admin Password *</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                    <Select
                      value={formData.subscriptionPlan}
                      onValueChange={(val: any) =>
                        setFormData({ ...formData, subscriptionPlan: val })
                      }
                    >
                      <SelectTrigger id="subscriptionPlan" className="h-9">
                        <SelectValue placeholder="Select Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                        <SelectItem value="Growth">Growth</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="budget">Contract Budget (INR)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g. 150000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Budget for Existing Company */}
            {companyMode === "existing" && (
              <div className="grid gap-1.5">
                <Label htmlFor="budget">Contract Budget (INR)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g. 75000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Provisioning..."
                : companyMode === "existing"
                ? "Create Project"
                : "Create Company & Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
