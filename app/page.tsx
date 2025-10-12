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
            <h1 className="text-5xl font-bold mb-6">
              Find Your H1B Sponsor
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Connect with companies actively hiring H1B workers. Generate personalized cover letters and send cold emails directly to HR.
            </p>
            <div className="space-x-4">
              <a
                href="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 inline-block"
              >
                Sign In
              </a>
            </div>
          </div>
        </section>

        {/* About / Features Section */}
        <section id="about" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">
              Features That Help You Stand Out
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Job Search?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of job seekers finding their dream H1B sponsor
            </p>
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
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