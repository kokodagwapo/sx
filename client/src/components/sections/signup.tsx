import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSignupSchema, type InsertSignup } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function Signup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<InsertSignup>({
    resolver: zodResolver(insertSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      monthlyRemittance: "",
      newsletter: "false"
    }
  });

  const signupMutation = useMutation({
    mutationFn: (data: InsertSignup) => apiRequest("POST", "/api/signup", data),
    onSuccess: () => {
      toast({
        title: "Welcome to PeraBida!",
        description: "You've successfully joined our waitlist. We'll notify you when the app launches.",
      });
      reset();
      queryClient.invalidateQueries({ queryKey: ['/api/signups/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: InsertSignup) => {
    setIsSubmitting(true);
    signupMutation.mutate(data);
  };

  const watchedNewsletter = watch("newsletter");

  return (
    <section 
      id="signup" 
      className={`py-32 bg-gradient-to-br from-primary via-blue-600 to-blue-800 relative overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}
      ref={ref}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <div className="text-white mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
            <span className="text-sm font-medium text-white">🎯 Join the Waitlist</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Family's
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">Financial Future?</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of OFW families who are already using PeraBida to create transparency, build savings, and strengthen family bonds through smart financial management.
          </p>
        </div>
        
        <Card className="bg-white/95 backdrop-blur-sm max-w-2xl mx-auto border-0 shadow-2xl" data-testid="card-signup-form">
          <CardContent className="p-10 md:p-12">
            <h3 className="text-3xl font-bold text-neutral-900 mb-8">Get Early Access to PeraBida</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-semibold text-neutral-700 mb-3">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Juan"
                    {...register("firstName")}
                    className="w-full p-4 border border-neutral-200 rounded-2xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    data-testid="input-first-name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-2" data-testid="error-first-name">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-semibold text-neutral-700 mb-3">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dela Cruz"
                    {...register("lastName")}
                    className="w-full p-4 border border-neutral-200 rounded-2xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    data-testid="input-last-name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-2" data-testid="error-last-name">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-3">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@email.com"
                  {...register("email")}
                  className="w-full p-4 border border-neutral-200 rounded-2xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2" data-testid="error-email">
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="country" className="block text-sm font-semibold text-neutral-700 mb-3">Current Country of Work</Label>
                <Select onValueChange={(value) => setValue("country", value)}>
                  <SelectTrigger className="w-full p-4 border border-neutral-200 rounded-2xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" data-testid="select-country">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                    <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-2" data-testid="error-country">
                    {errors.country.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="monthlyRemittance" className="block text-sm font-semibold text-neutral-700 mb-3">Monthly Remittance (Optional)</Label>
                <Select onValueChange={(value) => setValue("monthlyRemittance", value)}>
                  <SelectTrigger className="w-full p-4 border border-neutral-200 rounded-2xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" data-testid="select-monthly-remittance">
                    <SelectValue placeholder="Select amount range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₱10,000 - ₱25,000">₱10,000 - ₱25,000</SelectItem>
                    <SelectItem value="₱25,000 - ₱50,000">₱25,000 - ₱50,000</SelectItem>
                    <SelectItem value="₱50,000 - ₱75,000">₱50,000 - ₱75,000</SelectItem>
                    <SelectItem value="₱75,000+">₱75,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-neutral-50 rounded-2xl">
                <Checkbox
                  id="newsletter"
                  checked={watchedNewsletter === "true"}
                  onCheckedChange={(checked) => setValue("newsletter", checked ? "true" : "false")}
                  className="mt-1"
                  data-testid="checkbox-newsletter"
                />
                <Label htmlFor="newsletter" className="text-sm text-neutral-700 text-left leading-relaxed">
                  I agree to receive financial tips and PeraBida updates via email. You can unsubscribe at any time.
                </Label>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 py-6 text-lg font-semibold rounded-2xl disabled:opacity-50"
                data-testid="button-join-waitlist"
              >
                <Send className="mr-2" size={18} />
                {isSubmitting ? 'Joining...' : 'Join the Waitlist Free'}
              </Button>
            </form>
            
            <p className="text-sm text-neutral-500 mt-6">
              By signing up, you'll be among the first to know when PeraBida launches. No spam, just valuable financial insights and app updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
