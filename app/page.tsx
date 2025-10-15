import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard'

export default function HomePage() {
  const features = [
    {
      title: 'H1B Sponsor Database',
      description: 'Access comprehensive LCA dataset with thousands of H1B petitions and company information',
      icon: '🏢',
    },
    {
      title: 'Smart Filtering',
      description: 'Filter companies by location, job title, wage range, and custom criteria',
      icon: '🔍',
    },
    {
      title: 'AI-Powered Cover Letters',
      description: 'Generate personalized cover letters using ChatGPT based on your resume and job description',
      icon: '🤖',
    },
    {
      title: 'Automated Email Campaigns',
      description: 'Send professional cold emails directly to HR contacts with one click',
      icon: '📧',
    },
    {
      title: 'Secure & Private',
      description: 'Your data and credentials are encrypted and stored securely',
      icon: '🔒',
    },
    {
      title: 'Track Applications',
      description: 'Keep track of companies you\'ve contacted and manage your job search',
      icon: '📊',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6 text-white">
              Find Your H1B Sponsor
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white font-medium">
              Connect with companies actively hiring H1B workers. Generate personalized cover letters and send cold emails directly to HR.
            </p>
            <div className="space-x-4">
              <a
                href="/register"
                className="bg-white !text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 inline-block transition-colors"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 inline-block transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </section>

        {/* About / Features Section */}
        <section id="about" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
              Features That Help You Stand Out
            </h2>
            <p className="text-center text-gray-700 font-medium mb-12 max-w-3xl mx-auto">
              Our platform provides everything you need to connect with H1B sponsors and land your dream job
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">468,476</div>
                <p className="text-gray-800 font-semibold">H1B Records</p>
                <p className="text-gray-700 font-medium mt-2">Access to comprehensive LCA database</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">AI-Powered</div>
                <p className="text-gray-800 font-semibold">Cover Letters</p>
                <p className="text-gray-700 font-medium mt-2">Generate personalized emails in seconds</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">One-Click</div>
                <p className="text-gray-800 font-semibold">Email Sending</p>
                <p className="text-gray-700 font-medium mt-2">Send mass emails to multiple companies</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Create Account</h3>
                <p className="text-gray-700 font-medium">Sign up for free in seconds</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Filter Companies</h3>
                <p className="text-gray-700 font-medium">Find H1B sponsors by location, role, and salary</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Generate Emails</h3>
                <p className="text-gray-700 font-medium">AI creates personalized cover letters</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 text-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Send & Track</h3>
                <p className="text-gray-700 font-medium">Send emails and track your applications</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to Start Your Job Search?
            </h2>
            <p className="text-xl mb-8 text-white font-medium">
              Join thousands of job seekers finding their dream H1B sponsor
            </p>
            <a
              href="/register"
              className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 inline-block transition-colors"
            >
              Create Free Account
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}