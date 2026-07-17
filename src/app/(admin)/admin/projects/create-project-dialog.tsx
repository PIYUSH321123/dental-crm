"use client";

import React, { useState } from "react";
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
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    projectName: "",
    companyName: "",
    leadName: "",
    email: "",
    subscriptionPlan: "Basic" as "Basic" | "Pro" | "Growth" | "Enterprise",
    budget: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const budgetNum = parseFloat(formData.budget) || 0;
      const res = await createProjectAction({
        ...formData,
        budget: budgetNum,
      });

      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        setFormData({
          projectName: "",
          companyName: "",
          leadName: "",
          email: "",
          subscriptionPlan: "Basic",
          budget: "",
        });
        router.refresh(); // Refresh page to load database changes
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 h-9">
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a client company and project. This will register a new clinic tenant in the database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="e.g. Yoga Therapy Center"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="companyName">Company / Clinic Name</Label>
              <Input
                id="companyName"
                placeholder="e.g. Apex Wellness Ltd"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="leadName">Lead Contact Name</Label>
              <Input
                id="leadName"
                placeholder="e.g. John Doe"
                value={formData.leadName}
                onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email">Lead Contact Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. john@apex.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                <Select
                  value={formData.subscriptionPlan}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, subscriptionPlan: val })
                  }
                >
                  <SelectTrigger id="subscriptionPlan">
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
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
