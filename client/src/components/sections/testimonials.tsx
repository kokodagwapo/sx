import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { OFWNurse, OFWConstructionWorker, OFWChef } from "@/components/ui/ofw-illustrations";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function Testimonials() {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  return (
    <section 
      className={`py-32 bg-gradient-to-b from-neutral-50/80 to-white transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/5 border border-accent/10 mb-6">
            <span className="text-sm font-medium text-accent">⭐ Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Real Stories, <span className="text-accent">Real Results</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            See how PeraBida is transforming the way OFW families manage and track their finances.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Use Case 1: Nurse in UAE */}
          <Card className="group bg-white border-0 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500" data-testid="testimonial-maria-santos">
            <CardContent className="p-10">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <OFWNurse className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-900">Maria Santos</h4>
                  <p className="text-sm text-neutral-600 font-medium">Nurse in Dubai, UAE</p>
                </div>
              </div>
              <blockquote className="text-neutral-700 mb-6 text-lg leading-relaxed">
                "PeraBida helped me track exactly how my family was using the money I sent home. Now I can see every grocery receipt and school fee payment. It's brought so much peace to our family."
              </blockquote>
              <div className="flex items-center text-sm text-neutral-600 bg-accent/5 px-4 py-2 rounded-xl">
                <Star className="text-accent mr-2" size={16} />
                <span className="font-medium">Tracking ₱45,000 monthly</span>
              </div>
            </CardContent>
          </Card>

          {/* Use Case 2: Construction Worker in Canada */}
          <Card className="group bg-white border-0 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500" data-testid="testimonial-juan-dela-cruz">
            <CardContent className="p-10">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <OFWConstructionWorker className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-900">Juan dela Cruz</h4>
                  <p className="text-sm text-neutral-600 font-medium">Construction Worker in Toronto</p>
                </div>
              </div>
              <blockquote className="text-neutral-700 mb-6 text-lg leading-relaxed">
                "I was sending money home but never knew if it was being used wisely. PeraBida showed me that my family was actually saving 20% each month. I'm so proud of them!"
              </blockquote>
              <div className="flex items-center text-sm text-neutral-600 bg-secondary/5 px-4 py-2 rounded-xl">
                <Star className="text-accent mr-2" size={16} />
                <span className="font-medium">Family saved ₱25,000 this year</span>
              </div>
            </CardContent>
          </Card>

          {/* Use Case 3: Chef in Australia */}
          <Card className="group bg-white border-0 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500" data-testid="testimonial-rose-mendoza">
            <CardContent className="p-10">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <OFWChef className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-neutral-900">Rose Mendoza</h4>
                  <p className="text-sm text-neutral-600 font-medium">Chef in Melbourne</p>
                </div>
              </div>
              <blockquote className="text-neutral-700 mb-6 text-lg leading-relaxed">
                "The educational content in PeraBida taught my family about emergency funds. We now have 6 months of expenses saved up, and I feel so much more secure."
              </blockquote>
              <div className="flex items-center text-sm text-neutral-600 bg-primary/5 px-4 py-2 rounded-xl">
                <Star className="text-accent mr-2" size={16} />
                <span className="font-medium">Built emergency fund of ₱180,000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
