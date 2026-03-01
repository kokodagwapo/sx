import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Link, Globe, Star } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function Currency() {
  const [amount, setAmount] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency] = useState("PHP");
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  const exchangeRate = 56.75;
  const convertedAmount = (parseFloat(amount) * exchangeRate).toLocaleString();

  return (
    <section 
      id="currency" 
      className={`py-20 bg-white transition-all duration-700 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Real-Time Currency Conversion
          </h2>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Stay updated with current exchange rates and plan your remittances effectively with our integrated currency tools.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-neutral-50 to-white border border-gray-100" data-testid="card-currency-converter">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-6">Currency Exchange Calculator</h3>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="from-currency" className="text-sm font-medium text-neutral-700 mb-2">From Currency</Label>
                      <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger className="w-full p-4 border border-gray-200 rounded-xl" data-testid="select-from-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount" className="text-sm font-medium text-neutral-700 mb-2">Amount</Label>
                      <Input 
                        id="amount"
                        type="number" 
                        placeholder="1000" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl"
                        data-testid="input-amount"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="to-currency" className="text-sm font-medium text-neutral-700 mb-2">To Currency</Label>
                      <Select value={toCurrency} disabled>
                        <SelectTrigger className="w-full p-4 border border-gray-200 rounded-xl" data-testid="select-to-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Card className="bg-white border border-gray-100">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-neutral-900 mb-2">Converted Amount</h4>
                      <div className="text-4xl font-bold text-primary" data-testid="text-converted-amount">₱{convertedAmount}</div>
                      <p className="text-sm text-neutral-500 mt-2" data-testid="text-exchange-rate">1 {fromCurrency} = {exchangeRate} PHP</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-neutral-500">Exchange Rate</span>
                        <span className="font-medium" data-testid="text-rate-value">{exchangeRate.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-neutral-500">Last Updated</span>
                        <span className="font-medium" data-testid="text-last-updated">2 minutes ago</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-neutral-500">24h Change</span>
                        <span className="font-medium text-secondary" data-testid="text-24h-change">+0.15%</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-primary text-white hover:bg-blue-700 mt-6" data-testid="button-save-rate-alert">
                      <Star className="mr-2" size={16} />
                      Save Rate Alert
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Modern Finance Technology */}
          <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Future-Ready Financial Technology</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                PeraBida leverages cutting-edge technology to provide secure, transparent, and efficient financial tracking for modern families.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center" data-testid="feature-secure-technology">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-2xl" size={32} />
                </div>
                <h4 className="font-semibold mb-2">Secure Technology</h4>
                <p className="text-sm text-gray-300">Advanced encryption and security measures protect your financial data and family information.</p>
              </div>
              
              <div className="text-center" data-testid="feature-connected-systems">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Link className="text-2xl" size={32} />
                </div>
                <h4 className="font-semibold mb-2">Connected Systems</h4>
                <p className="text-sm text-gray-300">Seamlessly integrate with digital payment platforms and modern financial infrastructure.</p>
              </div>
              
              <div className="text-center" data-testid="feature-global-access">
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="text-2xl" size={32} />
                </div>
                <h4 className="font-semibold mb-2">Global Access</h4>
                <p className="text-sm text-gray-300">Access your financial data from anywhere in the world with real-time synchronization.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
