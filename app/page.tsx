import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, BarChart3, Clock, CreditCard, Zap, Shield, Heart, Briefcase, TrendingUp } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: 'CityWitty HRMS - Employee Community Management Platform',
  description: 'The official HRMS platform for CityWitty Employee Community. Streamline attendance, payroll, performance, and community engagement in one place.',
  keywords: ['HRMS', 'Employee Management', 'Payroll', 'Attendance Tracking', 'HR System', 'CityWitty Community', 'Employee Portal'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'CityWitty HRMS - Employee Community Management Platform',
    description: 'The official HRMS platform for CityWitty Employee Community',
    type: 'website',
  },
}

export default function LandingPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'CityWitty HRMS',
    'description': 'Employee management solution for CityWitty Employee Community',
    'url': 'https://hrms.citywittycommunity.com',
    'applicationCategory': 'BusinessApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'description': 'Community-exclusive platform'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'ratingCount': '250'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="CityWitty"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">CityWitty</span>
              <span className="text-xs font-semibold text-blue-600">Employee Portal</span>
            </div>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-700">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Access Portal</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">🏢 CityWitty Employee Community</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Elevate Your Work Experience
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Your all-in-one platform for seamless attendance tracking, transparent payroll, performance growth, and community engagement—built exclusively for CityWitty employees.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-lg">
                    Access Your Portal <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Already Have Access?
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Happy Employees</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-100 to-blue-100 rounded-3xl blur-2xl opacity-40"></div>
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-blue-400 rounded w-3/4"></div>
                        <div className="h-2 bg-blue-200 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-blue-300 rounded w-full"></div>
                      <div className="h-3 bg-blue-300 rounded w-4/5"></div>
                      <div className="h-3 bg-blue-200 rounded w-3/4"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <div className="h-12 bg-blue-200 rounded-lg"></div>
                      <div className="h-12 bg-blue-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need in One Place
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Designed by CityWitty, for CityWitty. Streamline your work life and stay connected with your community.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Attendance</h3>
                <p className="text-gray-600">Quick QR code check-in/check-out. Track your hours effortlessly and see your attendance history anytime.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Payroll</h3>
                <p className="text-gray-600">View your salary breakdown, download payslips instantly, and understand your earnings completely.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Tracking</h3>
                <p className="text-gray-600">Monitor your performance goals and targets in real-time. Celebrate wins and plan your career path.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Connect</h3>
                <p className="text-gray-600">Connect with your team, view leaderboards, and celebrate achievements together as one community.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Notifications</h3>
                <p className="text-gray-600">Stay updated with real-time alerts about important updates, approvals, and community news.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Security First</h3>
                <p className="text-gray-600">Your data is protected with enterprise-grade encryption. We prioritize your privacy and security.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Built by CityWitty, for CityWitty Employees</h2>
                <p className="text-lg text-gray-600">
                  We've listened to every employee voice in our community. This platform is crafted with your needs in mind, reflecting your values and supporting your growth.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: '🎯', title: 'Tailored to Your Needs', desc: 'Features designed specifically for CityWitty culture and workflow' },
                  { icon: '🤝', title: 'Community-First', desc: 'Built with input from employees like you—your feedback shapes our updates' },
                  { icon: '📈', title: 'Grow Together', desc: 'Performance tools that help you advance in your career' },
                  { icon: '💚', title: 'Your Success Matters', desc: 'Dedicated support team invested in your experience' }
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 items-start">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-100 rounded-3xl blur-3xl opacity-40"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-200 shadow-xl">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="h-2 bg-blue-300 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-blue-200 rounded w-1/2"></div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex gap-2">
                      <div className="flex-1 h-16 bg-green-100 rounded-lg"></div>
                      <div className="flex-1 h-16 bg-blue-100 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-200 rounded-full"></div>
                      <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-200 rounded-full"></div>
                      <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold">Are You an Organization Looking for HRMS?</h2>
                  <p className="text-xl text-gray-300">
                    CityWitty HRMS is the modern solution enterprises trust to manage their workforce effectively. If you're seeking an HR platform that delivers real results, let's talk.
                  </p>
                </div>
                <div className="space-y-4">
                  {['Reduce administrative burden by 70%', 'Improve employee engagement and retention', 'Real-time insights for better HR decisions', 'Complete compliance and data protection', 'Seamless integration with existing systems'].map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="text-blue-400 text-lg">✓</span>
                      <span className="text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20">
                  <h3 className="text-2xl font-semibold text-white mb-6">Enterprise Benefits</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-1">Scalable Infrastructure</h4>
                      <p className="text-gray-300 text-sm">Grows from 10 to 10,000+ employees without breaking a sweat</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">24/7 Support</h4>
                      <p className="text-gray-300 text-sm">Dedicated support team ready to help whenever you need</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Custom Integration</h4>
                      <p className="text-gray-300 text-sm">Seamlessly integrate with your existing tools and workflows</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Advanced Analytics</h4>
                      <p className="text-gray-300 text-sm">Data-driven insights to transform your HR strategy</p>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                  Schedule Enterprise Demo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <p className="text-center text-gray-400 text-sm">Or email: enterprise@citywittycommunity.com</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 md:p-20 text-center text-white">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">Ready to Join the Community?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                CityWitty employees deserve a platform that respects their time and celebrates their achievements. Access your portal today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white hover:bg-gray-100 text-blue-600 font-semibold w-full sm:w-auto">
                    Access Employee Portal <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white w-full sm:w-auto">
                    Already a Member?
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-950 text-gray-400 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="relative w-8 h-8">
                  <Image
                    src="/logo.png"
                    alt="CityWitty"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-white font-bold text-lg">CityWitty</span>
              </div>
              <p className="text-sm text-gray-500">Employee community platform trusted by 500+ professionals.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Employee Portal</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">&copy; 2024 CityWitty Community. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white transition text-sm" title="Twitter">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm" title="LinkedIn">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm" title="Instagram">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white transition text-sm" title="Email">Email</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
