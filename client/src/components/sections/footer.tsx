export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold">PeraBida</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering OFW families with transparent financial tracking, education, and accountability tools.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.431 8.421c.617-.617 1.434-.923 2.256-.923.822 0 1.639.306 2.256.923.617.617.923 1.434.923 2.256s-.306 1.639-.923 2.256c-.617.617-1.434.923-2.256.923s-1.639-.306-2.256-.923c-.617-.617-.923-1.434-.923-2.256s.306-1.639.923-2.256z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-expense-tracking">Expense Tracking</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-family-accountability">Family Accountability</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-financial-reports">Financial Reports</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-currency-exchange">Currency Exchange</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Education</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-saving-strategies">Saving Strategies</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-emergency-funds">Emergency Funds</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-catholic-values">Catholic Values</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-financial-planning">Financial Planning</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-help-center">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-contact-us">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-privacy-policy">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors" data-testid="link-terms-of-service">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 PeraBida. Made with ❤️ for Filipino families worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
