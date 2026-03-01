import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Users, GraduationCap, Check } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function Features() {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  return (
    <section 
      id="features" 
      className={`py-32 bg-gradient-to-b from-white to-neutral-50/50 transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/5 border border-secondary/10 mb-6">
            <span className="text-sm font-medium text-secondary">🚀 Core Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Built for <span className="text-secondary">Filipino Families</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Understanding the unique challenges of OFW families, PeraBida provides tools for transparency, accountability, and financial growth.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Feature 1: Expense Tracking */}
          <Card className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 bg-white border-0 shadow-lg" data-testid="card-expense-tracking">
            <CardContent className="p-10">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="text-primary" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Smart Expense Tracking</h3>
              <p className="text-neutral-600 mb-8 leading-relaxed">Track daily, weekly, and monthly expenses with projected vs actual reporting. Perfect for budget planning and family financial management.</p>
              <ul className="space-y-3">
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Daily budget monitoring</li>
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Projected vs actual analysis</li>
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Monthly financial reports</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2: Family Accountability */}
          <Card className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 bg-white border-0 shadow-lg" data-testid="card-family-accountability">
            <CardContent className="p-10">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-secondary" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Family Accountability</h3>
              <p className="text-neutral-600 mb-8 leading-relaxed">Enable family members to upload receipts and provide updates on money usage. Build trust and transparency in financial support.</p>
              <ul className="space-y-3">
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Receipt photo uploads</li>
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Real-time expense updates</li>
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Family member access</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3: Financial Education */}
          <Card className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 bg-white border-0 shadow-lg" data-testid="card-financial-education">
            <CardContent className="p-10">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/10 to-accent/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="text-accent" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Financial Education</h3>
              <p className="text-neutral-600 mb-8 leading-relaxed">Learn about saving, emergency funds, and financial literacy. Includes motivational content and Catholic values-based guidance.</p>
              <ul className="space-y-3">
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Saving strategies</li>
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Emergency fund planning</li>
                <li className="flex items-center text-neutral-700"><Check className="text-secondary mr-3" size={18} />Faith-based financial wisdom</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="relative bg-gradient-to-br from-primary via-blue-600 to-blue-800 rounded-3xl p-12 md:p-16 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Supporting Filipino Families Worldwide</h3>
              <p className="text-blue-100 max-w-3xl mx-auto text-lg leading-relaxed">PeraBida understands the financial challenges faced by OFW families and provides solutions for better money management.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center group" data-testid="stat-annual-remittances">
                <div className="text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">₱2.3T</div>
                <div className="text-blue-100 font-medium">Annual OFW Remittances</div>
              </div>
              <div className="text-center group" data-testid="stat-ofws-worldwide">
                <div className="text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">2.2M</div>
                <div className="text-blue-100 font-medium">OFWs Worldwide</div>
              </div>
              <div className="text-center group" data-testid="stat-support-family">
                <div className="text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">85%</div>
                <div className="text-blue-100 font-medium">Support Extended Family</div>
              </div>
              <div className="text-center group" data-testid="stat-need-tracking">
                <div className="text-4xl md:text-5xl font-bold mb-3 group-hover:scale-110 transition-transform duration-300">65%</div>
                <div className="text-blue-100 font-medium">Need Better Expense Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
