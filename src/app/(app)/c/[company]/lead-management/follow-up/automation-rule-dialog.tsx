import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { AutomationRule } from "./_follow-up-table/follow-up-data"

interface AutomationRuleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    rule: AutomationRule | null
    onSave: (trigger: string, delay: string, action: string, template: string) => void
    onDelete?: (id: string) => void
}

export function AutomationRuleDialog({
    open,
    onOpenChange,
    rule,
    onSave,
    onDelete
}: AutomationRuleDialogProps) {
    const [ruleTrigger, setRuleTrigger] = useState("")
    const [ruleDelay, setRuleDelay] = useState("")
    const [ruleAction, setRuleAction] = useState("")
    const [ruleTemplate, setRuleTemplate] = useState("")

    useEffect(() => {
        if (rule) {
            setRuleTrigger(rule.trigger)
            setRuleDelay(rule.delay)
            setRuleAction(rule.action)
            setRuleTemplate(rule.template)
        } else {
            setRuleTrigger("")
            setRuleDelay("Immediate")
            setRuleAction("WhatsApp")
            setRuleTemplate("")
        }
    }, [rule, open])

    const handleSave = () => {
        if (!ruleTrigger || !ruleDelay || !ruleAction) {
            return
        }
        onSave(ruleTrigger, ruleDelay, ruleAction, ruleTemplate)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-[450px] border-border bg-card"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-foreground">
                        {rule ? "Edit Automation Rule" : "Add Automation Rule"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Set a trigger milestone and configure automatic text dispatch settings.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Trigger Milestone *</Label>
                        <Select value={ruleTrigger} onValueChange={setRuleTrigger}>
                            <SelectTrigger className="border-input bg-background text-foreground">
                                <SelectValue placeholder="Select trigger" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="New Lead Created">New Lead Created</SelectItem>
                                <SelectItem value="Lead Not Contacted">Lead Not Contacted</SelectItem>
                                <SelectItem value="No Response After Call">No Response After Call</SelectItem>
                                <SelectItem value="Missed Appointment">Missed Appointment</SelectItem>
                                <SelectItem value="Consultation Booked">Consultation Booked</SelectItem>
                                <SelectItem value="Lead Inactive 7 days">Lead Inactive 7 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Delay / Wait Interval *</Label>
                        <Select value={ruleDelay} onValueChange={setRuleDelay}>
                            <SelectTrigger className="border-input bg-background text-foreground">
                                <SelectValue placeholder="Select delay" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Immediate">Immediate</SelectItem>
                                <SelectItem value="2 hours">2 hours</SelectItem>
                                <SelectItem value="24 hours">24 hours</SelectItem>
                                <SelectItem value="48 hours">48 hours</SelectItem>
                                <SelectItem value="7 days">7 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Action / Channel *</Label>
                        <Select value={ruleAction} onValueChange={setRuleAction}>
                            <SelectTrigger className="border-input bg-background text-foreground">
                                <SelectValue placeholder="Select action channel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WhatsApp">WhatsApp Message</SelectItem>
                                <SelectItem value="SMS">SMS Message</SelectItem>
                                <SelectItem value="SMS + WA">SMS + WhatsApp Combo</SelectItem>
                                <SelectItem value="Alert Staff">Internal Alert Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">Message Template</Label>
                        <Select value={ruleTemplate} onValueChange={setRuleTemplate}>
                            <SelectTrigger className="border-input bg-background text-foreground">
                                <SelectValue placeholder="Select template text" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Welcome Message">Welcome Message</SelectItem>
                                <SelectItem value="Reminder to call">Reminder to call</SelectItem>
                                <SelectItem value="Follow-up Template 1">Follow-up Template 1</SelectItem>
                                <SelectItem value="Reschedule Request">Reschedule Request</SelectItem>
                                <SelectItem value="Appointment Reminder">Appointment Reminder</SelectItem>
                                <SelectItem value="Re-engagement Offer">Re-engagement Offer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
                    {rule && onDelete ? (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => onDelete(rule.id)}
                        >
                            Delete Rule
                        </Button>
                    ) : <div />}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="cursor-pointer">
                            Cancel
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer" onClick={handleSave}>
                            Save Rule
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
