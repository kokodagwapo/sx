import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="pt-32 pb-24 bg-gradient-to-br from-white via-neutral-50 to-blue-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8">
            <span className="text-sm font-medium text-primary">✨ Now in Beta</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-8 leading-tight">
            Smart Money
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-secondary bg-clip-text text-transparent">
              for OFW Families
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform how your family manages money with transparent tracking, 
            receipt accountability, and financial wisdom designed for overseas Filipino workers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300 px-10 py-6 text-lg font-semibold rounded-2xl"
              onClick={() => {
                const element = document.getElementById('signup');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              data-testid="button-join-waitlist"
            >
              Join Waitlist Free
            </Button>
            <button 
              className="text-neutral-600 hover:text-primary transition-colors duration-200 font-medium underline underline-offset-4"
              onClick={() => {
                const element = document.getElementById('features');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Learn more →
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span>Trusted by 10K+ families</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
