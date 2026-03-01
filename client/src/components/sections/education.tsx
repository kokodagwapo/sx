import { Card, CardContent } from "@/components/ui/card";
import { Quote, Cross, Heart, Star, HandHeart, Home, Scale, Egg } from "lucide-react";
import { PiggyBankIllustration } from "@/components/ui/ofw-illustrations";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function Education() {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  return (
    <section 
      id="education" 
      className={`py-20 bg-neutral-50 transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Financial Wisdom & Education
          </h2>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Learn essential financial principles, saving strategies, and faith-based guidance for better money management.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-8 h-80 flex items-center justify-center">
              <div className="text-center">
                <PiggyBankIllustration className="w-32 h-32 mx-auto mb-4" />
                <p className="text-neutral-500">Savings Illustration</p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Importance of Emergency Funds</h3>
              <p className="text-neutral-500 mb-4">
                "A prudent person foresees danger and takes precautions. The simpleton goes blindly on and suffers the consequences." - Proverbs 27:14
              </p>
              <p className="text-neutral-500">
                Building an emergency fund is crucial for OFW families. Learn how to save systematically and protect your family's financial future even when working abroad.
              </p>
            </div>
            
            <Card className="bg-white border border-gray-100" data-testid="card-emergency-fund-guidelines">
              <CardContent className="p-6">
                <h4 className="font-semibold text-neutral-900 mb-3">Emergency Fund Guidelines</h4>
                <ul className="space-y-2 text-sm text-neutral-500">
                  <li className="flex items-center"><Star className="text-accent mr-2" size={16} />Save 3-6 months of family expenses</li>
                  <li className="flex items-center"><Star className="text-accent mr-2" size={16} />Start with small, consistent amounts</li>
                  <li className="flex items-center"><Star className="text-accent mr-2" size={16} />Keep funds easily accessible</li>
                  <li className="flex items-center"><Star className="text-accent mr-2" size={16} />Separate from regular savings</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Motivational Quotes Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white text-center border border-gray-100" data-testid="card-quote-self-care">
            <CardContent className="p-8">
              <Quote className="text-2xl text-primary mb-4 mx-auto" size={32} />
              <blockquote className="text-neutral-900 mb-4 font-medium">
                "You must take care of yourself first before you can help others."
              </blockquote>
              <cite className="text-sm text-neutral-500">Financial Wisdom</cite>
            </CardContent>
          </Card>
          
          <Card className="bg-white text-center border border-gray-100" data-testid="card-quote-biblical">
            <CardContent className="p-8">
              <Cross className="text-2xl text-secondary mb-4 mx-auto" size={32} />
              <blockquote className="text-neutral-900 mb-4 font-medium">
                "For which of you, desiring to build a tower, does not first sit down and count the cost?"
              </blockquote>
              <cite className="text-sm text-neutral-500">Luke 14:28</cite>
            </CardContent>
          </Card>
          
          <Card className="bg-white text-center border border-gray-100" data-testid="card-quote-planning">
            <CardContent className="p-8">
              <Heart className="text-2xl text-accent mb-4 mx-auto" size={32} />
              <blockquote className="text-neutral-900 mb-4 font-medium">
                "Proper planning and preparation prevent poor performance."
              </blockquote>
              <cite className="text-sm text-neutral-500">Success Principle</cite>
            </CardContent>
          </Card>
        </div>

        {/* Catholic Values Section */}
        <Card className="bg-white" data-testid="card-catholic-values">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Catholic Values in Financial Stewardship</h3>
              <p className="text-neutral-500 max-w-3xl mx-auto">
                Our faith teaches us about responsible stewardship, caring for family, and making wise financial decisions that honor God and serve our loved ones.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HandHeart className="text-secondary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Stewardship</h4>
                    <p className="text-sm text-neutral-500">We are called to be good stewards of the resources God has given us, managing money wisely for our family's wellbeing.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Family Care</h4>
                    <p className="text-sm text-neutral-500">Supporting our parents and siblings is a sacred duty, and doing so with wisdom and planning honors both God and family.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Scale className="text-accent" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Balance</h4>
                    <p className="text-sm text-neutral-500">Finding the right balance between helping others and securing your own future reflects wisdom and prudence.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Egg className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Peace</h4>
                    <p className="text-sm text-neutral-500">Transparent financial management brings peace to families and strengthens relationships built on trust.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
