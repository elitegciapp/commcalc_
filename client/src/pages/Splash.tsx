import { Link } from "wouter";
import logoImage from "@assets/CommCalc_2_Trans_1766805910091.png";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";

function FallingMoney() {
  const moneyItems = useMemo(() => {
    const items = [];
    const symbols = ["$", "💵", "💰", "$", "$", "💲", "$"];
    
    for (let i = 0; i < 30; i++) {
      items.push({
        id: i,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 12,
        size: 16 + Math.random() * 24,
        opacity: 0.1 + Math.random() * 0.3,
      });
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {moneyItems.map((item) => (
        <div
          key={item.id}
          className="absolute animate-fall"
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
            color: "hsl(189 94% 43%)",
          }}
        >
          {item.symbol}
        </div>
      ))}
    </div>
  );
}

export default function Splash() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans selection:bg-primary/20 px-4 relative overflow-hidden">
      <FallingMoney />
      
      <div className="text-center space-y-8 max-w-2xl relative z-10">
        <img 
          src={logoImage} 
          alt="CommCalc" 
          className="h-40 md:h-56 lg:h-64 mx-auto"
          data-testid="splash-logo"
        />
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
          <span className="text-white">Let's Calculate that </span>
          <span className="text-primary">Cash Money</span>
        </h1>
        
        <Link href="/calculator">
          <button
            className="group inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            data-testid="button-enter-calculator"
          >
            Enter Calculator
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
      
      <div className="absolute bottom-8 text-center z-10">
        <p className="text-xs text-muted-foreground/50">
          Free tool for real estate professionals
        </p>
      </div>
    </div>
  );
}
