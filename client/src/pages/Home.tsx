import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATE_TAX_RATES, FEDERAL_TAX_BASELINE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Info, DollarSign, Percent, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import logoImage from "@assets/ChatGPT_Image_Dec_24,_2025,_12_07_10_PM_1766805433840.png";

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
    // Only update display value if the number value changes externally and doesn't match current display
    // This prevents cursor jumping if we were to format on every keystroke strictly
    // But for this simple app, formatting on blur is better UX for "calculator" feel
    setDisplayValue(value === 0 && displayValue === "" ? "" : value.toLocaleString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits and one decimal point
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

// --- Main Page ---

export default function Home() {
  // State
  const [salePrice, setSalePrice] = useState(500000);
  const [commissionRate, setCommissionRate] = useState(3);
  const [agentSplit, setAgentSplit] = useState(70);
  const [referralFee, setReferralFee] = useState(0);
  const [tcFee, setTcFee] = useState(350);
  const [taxRate, setTaxRate] = useState(25);
  const [selectedState, setSelectedState] = useState("custom");

  // Effects
  useEffect(() => {
    if (selectedState !== "custom" && STATE_TAX_RATES[selectedState] !== undefined) {
      const stateRate = STATE_TAX_RATES[selectedState];
      // Estimate combined rate: Federal + State
      // Simple addition is usually "good enough" for estimation, though deductibility varies
      setTaxRate(parseFloat((FEDERAL_TAX_BASELINE + stateRate).toFixed(2)));
    }
  }, [selectedState]);

  // Calculations
  const totalCommission = salePrice * (commissionRate / 100);
  
  // Referral is usually taken off the top of the gross commission
  const referralAmount = totalCommission * (referralFee / 100);
  const commissionAfterReferral = totalCommission - referralAmount;
  
  // Agent split is applied to the remaining commission
  const agentGross = commissionAfterReferral * (agentSplit / 100);
  
  // TC Fee is deducted from agent gross
  const incomeBeforeTax = agentGross - tcFee;
  
  // Taxes
  const estimatedTaxAmount = incomeBeforeTax > 0 ? incomeBeforeTax * (taxRate / 100) : 0;
  
  // Final
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
          <img src={logoImage} alt="CommCalc - Commission Calculator" className="h-16 md:h-20 mx-auto" />
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Calculate your take-home pay instantly. See exactly what you'll earn after splits, fees, taxes, and deductions.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Column */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-8">
                
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

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary/80 font-medium pb-2 border-b border-border/30">
                    <Percent className="h-4 w-4" />
                    <span>Splits & Fees</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <NumberInput
                      label="Your Split"
                      value={agentSplit}
                      onValueChange={setAgentSplit}
                      suffix="%"
                      hint="Brokerage split"
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
              {/* Glow effect behind the card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              
              <Card className="relative border-border bg-[#0f1420] shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                
                <CardHeader className="pb-4 pt-8 px-8">
                  <CardTitle className="text-lg font-medium text-muted-foreground">Breakdown</CardTitle>
                </CardHeader>
                
                <CardContent className="px-8 pb-8 space-y-6">
                  
                  {/* Total Commission Line */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-400">Total Commission</span>
                    <span className="text-lg font-semibold text-white tracking-wide" data-testid="display-total-commission">
                      {formatCurrency(totalCommission)}
                    </span>
                  </div>

                  {/* Referral Deduction (only show if > 0) */}
                  {referralFee > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-slate-500">Referral ({referralFee}%)</span>
                      <span className="text-base font-medium text-red-400/80 font-mono">
                        -{formatCurrency(referralAmount)}
                      </span>
                    </div>
                  )}

                  <Separator className="bg-border/40" />

                  {/* Split */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-400">Your Split ({agentSplit}%)</span>
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
