import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { STATE_TAX_RATES, FEDERAL_TAX_BASELINE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Info, DollarSign, Percent, Users, Plus, Trash2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/CommCalc_2_Trans_1766805910091.png";

// --- Types ---

interface TeamMember {
  id: string;
  name: string;
  role: string;
  percent: number;
  isSelf: boolean;
}

interface TeamSplitConfig {
  enabled: boolean;
  members: TeamMember[];
}

// --- Components ---

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: string;
  value: number | string;
  onValueChange: (value: number) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  hint?: string;
  dataTestId?: string;
}

const NumberInput = ({ label, value, onValueChange, prefix, suffix, hint, className, dataTestId, ...props }: NumberInputProps) => {
  const [displayValue, setDisplayValue] = useState(value.toString());

  useEffect(() => {
    setDisplayValue(value === 0 && displayValue === "" ? "" : value.toLocaleString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      setDisplayValue(e.target.value);
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        onValueChange(num);
      } else {
        onValueChange(0);
      }
    }
  };

  const handleBlur = () => {
    const raw = displayValue.replace(/,/g, "");
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      setDisplayValue(num.toLocaleString());
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">{label}</Label>
        {hint && <span className="text-xs text-muted-foreground/50">{hint}</span>}
      </div>
      <div className="relative group transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20 rounded-md">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {prefix}
          </div>
        )}
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "bg-secondary/50 border-input hover:border-primary/30 focus-visible:border-primary focus-visible:ring-0 text-lg h-12 font-mono tabular-nums transition-colors",
            prefix ? "pl-8" : "",
            suffix ? "pr-8" : ""
          )}
          data-testid={dataTestId}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
};

interface TeamMemberRowProps {
  member: TeamMember;
  onUpdate: (id: string, updates: Partial<TeamMember>) => void;
  onRemove: (id: string) => void;
  onSetSelf: (id: string) => void;
  canRemove: boolean;
}

const TeamMemberRow = ({ member, onUpdate, onRemove, onSetSelf, canRemove }: TeamMemberRowProps) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/30">
      <div className="flex-1 grid grid-cols-2 gap-3">
        <Input
          placeholder="Name"
          value={member.name}
          onChange={(e) => onUpdate(member.id, { name: e.target.value })}
          className="bg-secondary/50 border-input h-10 text-sm"
          data-testid={`input-member-name-${member.id}`}
        />
        <Input
          placeholder="Role"
          value={member.role}
          onChange={(e) => onUpdate(member.id, { role: e.target.value })}
          className="bg-secondary/50 border-input h-10 text-sm"
          data-testid={`input-member-role-${member.id}`}
        />
      </div>
      <div className="w-20">
        <div className="relative">
          <Input
            type="number"
            value={member.percent}
            onChange={(e) => onUpdate(member.id, { percent: parseFloat(e.target.value) || 0 })}
            className="bg-secondary/50 border-input h-10 text-sm pr-6 text-center"
            data-testid={`input-member-percent-${member.id}`}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
        </div>
      </div>
      <button
        onClick={() => onSetSelf(member.id)}
        className={cn(
          "px-3 py-1.5 rounded text-xs font-medium transition-colors",
          member.isSelf
            ? "bg-primary text-primary-foreground"
            : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
        )}
        data-testid={`button-set-self-${member.id}`}
      >
        You
      </button>
      {canRemove && (
        <button
          onClick={() => onRemove(member.id)}
          className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
          data-testid={`button-remove-member-${member.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface TeamSplitSectionProps {
  title: string;
  config: TeamSplitConfig;
  onToggle: (enabled: boolean) => void;
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
  onSetSelf: (id: string) => void;
  validation: { isValid: boolean; totalPercent: number; hasSelf: boolean };
  dataTestIdPrefix: string;
}

const TeamSplitSection = ({
  title,
  config,
  onToggle,
  onUpdateMember,
  onAddMember,
  onRemoveMember,
  onSetSelf,
  validation,
  dataTestIdPrefix,
}: TeamSplitSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">{title}</Label>
        <Switch
          checked={config.enabled}
          onCheckedChange={onToggle}
          data-testid={`switch-${dataTestIdPrefix}`}
        />
      </div>
      
      {config.enabled && (
        <div className="space-y-3">
          {config.members.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              onUpdate={onUpdateMember}
              onRemove={onRemoveMember}
              onSetSelf={onSetSelf}
              canRemove={config.members.length > 1}
            />
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onAddMember}
            className="w-full border-dashed border-border/50 text-muted-foreground hover:text-foreground"
            data-testid={`button-add-member-${dataTestIdPrefix}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Split:</span>
            <span className={cn(
              "font-mono font-medium",
              validation.isValid ? "text-green-400" : "text-red-400"
            )}>
              {validation.totalPercent}%
            </span>
          </div>
          
          {!validation.isValid && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-2 rounded">
              <AlertCircle className="h-3 w-3" />
              {validation.totalPercent !== 100 && <span>Total must equal 100%</span>}
              {!validation.hasSelf && <span>Please select which member is you</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Page ---

export default function Home() {
  // Basic State
  const [salePrice, setSalePrice] = useState(500000);
  const [commissionRate, setCommissionRate] = useState(3);
  const [agentSplit, setAgentSplit] = useState(70);
  const [referralFee, setReferralFee] = useState(0);
  const [tcFee, setTcFee] = useState(350);
  const [taxRate, setTaxRate] = useState(25);
  const [selectedState, setSelectedState] = useState("custom");

  // Team Split State
  const createDefaultMember = (isSelf: boolean = false): TeamMember => ({
    id: crypto.randomUUID(),
    name: isSelf ? "You" : "",
    role: isSelf ? "Agent" : "",
    percent: isSelf ? 100 : 0,
    isSelf,
  });

  const [listingSplit, setListingSplit] = useState<TeamSplitConfig>({
    enabled: false,
    members: [createDefaultMember(true)],
  });

  const [buyerSplit, setBuyerSplit] = useState<TeamSplitConfig>({
    enabled: false,
    members: [createDefaultMember(true)],
  });

  // Effects
  useEffect(() => {
    if (selectedState !== "custom" && STATE_TAX_RATES[selectedState] !== undefined) {
      const stateRate = STATE_TAX_RATES[selectedState];
      setTaxRate(parseFloat((FEDERAL_TAX_BASELINE + stateRate).toFixed(2)));
    }
  }, [selectedState]);

  // Validation
  const validateTeamSplit = (config: TeamSplitConfig) => {
    const totalPercent = config.members.reduce((sum, m) => sum + m.percent, 0);
    const hasSelf = config.members.some(m => m.isSelf);
    const isValid = !config.enabled || (Math.abs(totalPercent - 100) < 0.01 && hasSelf);
    return { isValid, totalPercent: Math.round(totalPercent * 100) / 100, hasSelf };
  };

  const listingValidation = useMemo(() => validateTeamSplit(listingSplit), [listingSplit]);
  const buyerValidation = useMemo(() => validateTeamSplit(buyerSplit), [buyerSplit]);

  // Team Split Helpers
  const updateTeamMember = (
    setter: React.Dispatch<React.SetStateAction<TeamSplitConfig>>,
    id: string,
    updates: Partial<TeamMember>
  ) => {
    setter(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m),
    }));
  };

  const addTeamMember = (setter: React.Dispatch<React.SetStateAction<TeamSplitConfig>>) => {
    setter(prev => ({
      ...prev,
      members: [...prev.members, createDefaultMember()],
    }));
  };

  const removeTeamMember = (
    setter: React.Dispatch<React.SetStateAction<TeamSplitConfig>>,
    id: string
  ) => {
    setter(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id),
    }));
  };

  const setSelfMember = (
    setter: React.Dispatch<React.SetStateAction<TeamSplitConfig>>,
    id: string
  ) => {
    setter(prev => ({
      ...prev,
      members: prev.members.map(m => ({ ...m, isSelf: m.id === id })),
    }));
  };

  const toggleTeamSplit = (
    setter: React.Dispatch<React.SetStateAction<TeamSplitConfig>>,
    enabled: boolean
  ) => {
    setter(prev => {
      if (enabled && prev.members.length === 0) {
        return { enabled, members: [createDefaultMember(true)] };
      }
      return { ...prev, enabled };
    });
  };

  // Calculations
  const totalCommission = salePrice * (commissionRate / 100);
  const referralAmount = totalCommission * (referralFee / 100);
  const commissionAfterReferral = totalCommission - referralAmount;

  // Calculate team share (applies before brokerage split)
  const getTeamSharePercent = () => {
    // Check if either team split is enabled and valid
    if (listingSplit.enabled && listingValidation.isValid) {
      const selfMember = listingSplit.members.find(m => m.isSelf);
      return selfMember?.percent ?? 100;
    }
    if (buyerSplit.enabled && buyerValidation.isValid) {
      const selfMember = buyerSplit.members.find(m => m.isSelf);
      return selfMember?.percent ?? 100;
    }
    return 100; // No team split, agent gets 100%
  };

  const teamSharePercent = getTeamSharePercent();
  const isTeamSplitActive = (listingSplit.enabled && listingValidation.isValid) || 
                            (buyerSplit.enabled && buyerValidation.isValid);
  
  // Your share after team split
  const yourTeamShare = commissionAfterReferral * (teamSharePercent / 100);
  
  // Brokerage split applies to your team share
  const agentGross = yourTeamShare * (agentSplit / 100);
  
  // TC Fee deduction
  const incomeBeforeTax = agentGross - tcFee;
  
  // Taxes
  const estimatedTaxAmount = incomeBeforeTax > 0 ? incomeBeforeTax * (taxRate / 100) : 0;
  
  // Final take home
  const takeHome = incomeBeforeTax - estimatedTaxAmount;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src={logoImage} alt="CommCalc" className="h-10" />
          </div>
          <div className="text-xs font-medium text-muted-foreground border border-border/50 rounded-full px-3 py-1">
            Free Tool
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        
        <div className="text-center mb-12 space-y-4">
          <img src={logoImage} alt="CommCalc - Commission Calculator" className="h-32 md:h-44 lg:h-56 mx-auto" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Calculate your take-home pay instantly. See exactly what you'll earn after splits, fees, taxes, and deductions.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Column */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-8">
                
                {/* Transaction Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary/80 font-medium pb-2 border-b border-border/30">
                    <DollarSign className="h-4 w-4" />
                    <span>Transaction Details</span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <NumberInput
                      label="Sale Price"
                      value={salePrice}
                      onValueChange={setSalePrice}
                      prefix="$"
                      dataTestId="input-sale-price"
                    />
                    <NumberInput
                      label="Commission Rate"
                      value={commissionRate}
                      onValueChange={setCommissionRate}
                      suffix="%"
                      dataTestId="input-commission-rate"
                    />
                  </div>
                </div>

                {/* Team Splits */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary/80 font-medium pb-2 border-b border-border/30">
                    <Users className="h-4 w-4" />
                    <span>Team Splits</span>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <TeamSplitSection
                      title="Listing Side Team Split"
                      config={listingSplit}
                      onToggle={(enabled) => toggleTeamSplit(setListingSplit, enabled)}
                      onUpdateMember={(id, updates) => updateTeamMember(setListingSplit, id, updates)}
                      onAddMember={() => addTeamMember(setListingSplit)}
                      onRemoveMember={(id) => removeTeamMember(setListingSplit, id)}
                      onSetSelf={(id) => setSelfMember(setListingSplit, id)}
                      validation={listingValidation}
                      dataTestIdPrefix="listing-split"
                    />
                    
                    <TeamSplitSection
                      title="Buyer Side Team Split"
                      config={buyerSplit}
                      onToggle={(enabled) => toggleTeamSplit(setBuyerSplit, enabled)}
                      onUpdateMember={(id, updates) => updateTeamMember(setBuyerSplit, id, updates)}
                      onAddMember={() => addTeamMember(setBuyerSplit)}
                      onRemoveMember={(id) => removeTeamMember(setBuyerSplit, id)}
                      onSetSelf={(id) => setSelfMember(setBuyerSplit, id)}
                      validation={buyerValidation}
                      dataTestIdPrefix="buyer-split"
                    />
                  </div>
                </div>

                {/* Splits & Fees */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary/80 font-medium pb-2 border-b border-border/30">
                    <Percent className="h-4 w-4" />
                    <span>Brokerage Splits & Fees</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <NumberInput
                      label="Your Brokerage Split"
                      value={agentSplit}
                      onValueChange={setAgentSplit}
                      suffix="%"
                      hint="Your share after brokerage"
                      dataTestId="input-agent-split"
                    />
                    <NumberInput
                      label="Referral Fee"
                      value={referralFee}
                      onValueChange={setReferralFee}
                      suffix="%"
                      hint="Off the top"
                      dataTestId="input-referral-fee"
                    />
                    <NumberInput
                      label="TC Fee"
                      value={tcFee}
                      onValueChange={setTcFee}
                      prefix="$"
                      hint="Transaction Coord."
                      dataTestId="input-tc-fee"
                    />
                  </div>
                </div>

                {/* Taxes */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary/80 font-medium pb-2 border-b border-border/30">
                    <Info className="h-4 w-4" />
                    <span>Taxes</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">State of Residence</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger className="h-12 bg-secondary/50 border-input hover:border-primary/30 text-lg">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Manual / Custom</SelectItem>
                          <Separator className="my-1 opacity-50"/>
                          {Object.keys(STATE_TAX_RATES).sort().map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <NumberInput
                      label="Est. Tax Rate"
                      value={taxRate}
                      onValueChange={setTaxRate}
                      suffix="%"
                      hint="Combined Fed + State"
                      dataTestId="input-tax-rate"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              
              <Card className="relative border-border bg-[#0f1420] shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-lg font-medium text-muted-foreground">Breakdown</CardTitle>
                </CardHeader>
                
                <CardContent className="px-8 pb-8 space-y-4">
                  
                  {/* Gross Commission */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-400">Gross Commission</span>
                    <span className="text-lg font-semibold text-white tracking-wide" data-testid="display-total-commission">
                      {formatCurrency(totalCommission)}
                    </span>
                  </div>

                  {/* Referral Deduction */}
                  {referralFee > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-slate-500">Referral ({referralFee}%)</span>
                      <span className="text-base font-medium text-red-400/80 font-mono">
                        -{formatCurrency(referralAmount)}
                      </span>
                    </div>
                  )}

                  {/* Team Share (only show if team split is active) */}
                  {isTeamSplitActive && (
                    <>
                      <Separator className="bg-border/40" />
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-slate-400">Your Team Share ({teamSharePercent}%)</span>
                        <span className="text-lg font-semibold text-white tracking-wide" data-testid="display-team-share">
                          {formatCurrency(yourTeamShare)}
                        </span>
                      </div>
                    </>
                  )}

                  <Separator className="bg-border/40" />

                  {/* Brokerage Split */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-400">Brokerage Split ({agentSplit}%)</span>
                    <span className="text-lg font-semibold text-white tracking-wide" data-testid="display-agent-gross">
                      {formatCurrency(agentGross)}
                    </span>
                  </div>

                  {/* TC Fee */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-slate-500">TC Fee</span>
                    <span className="text-base font-medium text-red-400 font-mono" data-testid="display-tc-fee-deduction">
                      -{formatCurrency(tcFee)}
                    </span>
                  </div>

                  {/* Before Taxes & Tax */}
                  <div className="bg-secondary/30 rounded-lg p-4 mt-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-300">Before Taxes</span>
                      <span className="text-lg font-bold text-white tracking-wide" data-testid="display-before-taxes">
                        {formatCurrency(incomeBeforeTax)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-orange-400/80">Est. Taxes ({taxRate}%)</span>
                        <div className="relative group/tooltip cursor-help">
                          <Info className="h-3 w-3 text-muted-foreground" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded text-xs text-popover-foreground whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                            Estimated Fed + State
                          </div>
                        </div>
                      </div>
                      <span className="text-base font-medium text-orange-400 font-mono" data-testid="display-estimated-taxes">
                        -{formatCurrency(estimatedTaxAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Final Take Home */}
                  <div className="pt-6 mt-2 border-t border-border/40">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Your Take Home</span>
                      <span className="text-5xl font-bold text-primary tracking-tight tabular-nums glow-text" data-testid="display-take-home">
                        {formatCurrency(takeHome)}
                      </span>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground/40 max-w-xs mx-auto leading-relaxed">
                * Figures are estimates for planning purposes only. Tax rates vary by filing status and income bracket. Consult a tax professional for advice.
              </p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
