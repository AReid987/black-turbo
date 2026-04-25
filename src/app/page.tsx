'use client'

import { useState, useEffect } from 'react'
import { FileSpreadsheet, TrendingUp, Users, Award, ChevronRight, ArrowRight, Play, Shield, Zap, Globe, Clock, Star, MessageSquare, Phone, Mail, Menu, X, ArrowDown, Briefcase, Building2, FileText, BarChart3, Check } from 'lucide-react'
import HiddenAuth from '@/components/auth/HiddenAuth'

export default function Home() {
  const [showAuth, setShowAuth] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeService, setActiveService] = useState(0)

  // Services data with sophisticated presentation
  const services = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Feline Tax & Accounting Services",
      description: "Comprehensive tax preparation and financial planning exclusively for cats. Our team of certified feline accountants understands the unique tax implications of cat ownership, including deductions for cat food, litter, and veterinary expenses. We also specialize in estate planning for cats with significant inheritances.",
      features: ["Cat-specific tax deductions", "Multi-cat household planning", "Feline estate planning", "Cat business incorporation"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Emergency Car Acquisition Division",
      description: "We specialize in purchasing vehicles from individuals who urgently need gas money. Our empathetic car buyers understand financial emergencies and offer fair, immediate cash for vehicles in any condition. No judgment, just quick transactions when you need them most.",
      features: ["Same-day vehicle purchase", "Gas money advance options", "No-questions-asked policy", "Emergency vehicle pickup"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Blood Test Preparation Academy",
      description: "Premier tutoring and study group services for individuals preparing for blood tests. Our experienced tutors provide comprehensive study materials, practice sessions, and confidence-building exercises to ensure you're fully prepared for your blood work experience.",
      features: ["Blood test study groups", "One-on-one fasting coaching", "Vein location practice", "Anxiety management workshops"],
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Department of Redundancy Department",
      description: "Our customer service division is staffed by the Department of Redundancy Department, ensuring that every concern is addressed multiple times by multiple representatives who will each repeat the same information using slightly different words.",
      features: ["Multiple agent confirmation", "Repeated information assurance", "Redundant follow-up calls", "Duplicate email confirmations"],
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Spreadsheet Security Consulting",
      description: "Protect your valuable spreadsheets from unauthorized access, data corruption, and formula tampering. Our security experts implement military-grade encryption for your most sensitive cell data and formula structures.",
      features: ["Cell-level encryption", "Formula integrity monitoring", "Unauthorized VBA detection", "Spreadsheet firewall installation"],
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "International Time Zone Harmonization",
      description: "We help businesses and individuals synchronize their spreadsheet activities across global time zones, ensuring that formula calculations and data entries occur in perfect temporal harmony regardless of geographical location.",
      features: ["Global formula sync", "Time zone-aware calculations", "Cross-border collaboration", "24/7 spreadsheet coordination"],
      color: "from-indigo-500 to-blue-500"
    }
  ]

  // Testimonials
  const testimonials = [
    {
      name: "Jennifer M. Whiskers",
      role: "CEO, Purrfect Industries",
      content: "The Feline Tax Services saved my company thousands. My cats' tax situation was complicated, but their team handled everything with exceptional care and understanding of feline financial needs.",
      avatar: "JM"
    },
    {
      name: "Robert 'Gas Money' Johnson",
      role: "Former Car Owner",
      content: "When I found myself stranded and needing gas money, the Emergency Car Acquisition Division was there. They bought my car quickly and fairly. The gas money advance was a lifesaver.",
      avatar: "RJ"
    },
    {
      name: "Dr. Sarah Veinfinder",
      role: "Blood Test Prep Student",
      content: "After failing to prepare properly for three blood tests, I enrolled in their academy. The fasting coaching and vein location practice transformed my experience. I'm now a confident blood test participant!",
      avatar: "SV"
    },
    {
      name: "Thomas Redundant",
      role: "Satisfied Customer",
      content: "I called customer service and spoke with three different representatives who each confirmed my account information. Then I received three emails confirming the same information. I felt thoroughly heard and redundantly assisted.",
      avatar: "TR"
    }
  ]

  // Stats
  const stats = [
    { value: "12,847", label: "Active Members", icon: Users },
    { value: "156", label: "Countries", icon: Globe },
    { value: "892", label: "Templates Shared", icon: FileSpreadsheet },
    { value: "37", label: "Years of Excellence", icon: Award }
  ]

  // Hidden trigger: Click the copyright text 5 times within 3 seconds
  const handleCopyrightClick = () => {
    const now = Date.now()
    if (now - lastClickTime > 3000) {
      setClickCount(1)
    } else {
      setClickCount(prev => prev + 1)
    }
    setLastClickTime(now)

    if (clickCount + 1 >= 5) {
      setShowAuth(true)
      setClickCount(0)
    }
  }

  // Easter egg: Konami code reveals auth
  useEffect(() => {
    const konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ]
    let konamiIndex = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++
        if (konamiIndex === konamiCode.length) {
          setShowAuth(true)
          konamiIndex = 0
        }
      } else {
        konamiIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-rotate services
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % services.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (showAuth) {
    return <HiddenAuth onClose={() => setShowAuth(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-stone-200 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">IASE</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">International Association of Spreadsheet Enthusiasts</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm">Services</a>
              <a href="#about" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm">About</a>
              <a href="#testimonials" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm">Testimonials</a>
              <a href="#contact" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors text-sm">Contact</a>
              <button className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 text-sm">
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-stone-200 px-6 py-6 space-y-4">
            <a href="#services" className="block text-slate-600 hover:text-emerald-700 font-medium py-2 text-sm">Services</a>
            <a href="#about" className="block text-slate-600 hover:text-emerald-700 font-medium py-2 text-sm">About</a>
            <a href="#testimonials" className="block text-slate-600 hover:text-emerald-700 font-medium py-2 text-sm">Testimonials</a>
            <a href="#contact" className="block text-slate-600 hover:text-emerald-700 font-medium py-2 text-sm">Contact</a>
            <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-3 rounded-lg font-semibold">
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-8">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800 text-sm font-semibold tracking-wide">Now serving cats in over 150 countries</span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              Where Spreadsheet Excellence
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">
                Meets Every Need
              </span>
            </h2>

            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              From feline tax preparation to emergency vehicle acquisition, our comprehensive suite of spreadsheet-powered services transforms the ordinary into the extraordinary.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center space-x-2">
                <span>Explore Services</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto bg-white border-2 border-stone-200 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-emerald-600 hover:text-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-20 flex flex-wrap justify-center items-center gap-12 text-slate-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">SOC 2 Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span className="text-medium">Global Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2 font-display">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold text-slate-900 mb-4 font-display">Our Comprehensive Services</h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              From the conventional to the extraordinary, we provide spreadsheet-powered solutions for every conceivable need.
            </p>
          </div>

          {/* Featured Service */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-16 mb-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-emerald-500/20 rounded-full px-4 py-2 mb-8">
                  <Star className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm font-medium tracking-wide">FEATURED SERVICE</span>
                </div>
                <h4 className="text-3xl lg:text-4xl font-bold mb-6 font-display">{services[activeService].title}</h4>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed font-light">
                  {services[activeService].description}
                </p>
                <ul className="space-y-4 mb-10">
                  {services[activeService].features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-slate-200 font-light">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 inline-flex items-center space-x-2">
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className={`w-64 h-64 bg-gradient-to-br ${services[activeService].color} rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500`}>
                  {services[activeService].icon}
                </div>
              </div>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white border border-stone-200 rounded-2xl p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200 cursor-pointer"
                onClick={() => setActiveService(index)}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4 font-display">{service.title}</h4>
                <p className="text-slate-600 mb-6 line-clamp-3 font-light leading-relaxed">{service.description}</p>
                <div className="flex items-center text-emerald-700 font-semibold group-hover:translate-x-2 transition-transform duration-200">
                  <span>Learn more</span>
                  <ChevronRight className="w-5 h-5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-stone-50 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold text-slate-900 mb-8 font-display">Why Organizations Trust IASE</h3>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed font-light">
                Founded in 1987, the International Association of Spreadsheet Enthusiasts has evolved from a small group of Excel aficionados to a global powerhouse providing comprehensive spreadsheet-powered solutions across industries and species.
              </p>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Unparalleled Security</h4>
                    <p className="text-slate-600 font-light leading-relaxed">Military-grade encryption protects your most sensitive spreadsheet data and feline financial information.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">24/7 Support</h4>
                    <p className="text-slate-600 font-light leading-relaxed">Our global team ensures assistance is always available, regardless of time zone or blood test schedule.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Proven Results</h4>
                    <p className="text-slate-600 font-light leading-relaxed">97% of our feline clients report improved tax outcomes. 100% of emergency car sellers receive gas money.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-xl border border-stone-200">
              <h4 className="text-2xl font-bold text-slate-900 mb-8 font-display">Ready to Transform Your Spreadsheet Experience?</h4>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-4 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-light text-base placeholder:text-stone-400"
                    placeholder="John Doe (or Mr. Whiskers)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-4 py-4 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-light text-base placeholder:text-stone-400"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Service Interest</label>
                  <select className="w-full px-4 py-4 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-light text-base text-slate-600">
                    <option>Feline Tax & Accounting</option>
                    <option>Emergency Car Acquisition</option>
                    <option>Blood Test Preparation</option>
                    <option>Redundant Customer Service</option>
                    <option>Spreadsheet Security</option>
                    <option>Time Zone Harmonization</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 text-base"
                >
                  Schedule Consultation
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold text-slate-900 mb-4 font-display">What Our Clients Say</h3>
            <p className="text-xl text-slate-600">Real feedback from real satisfied clients (and their cats)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-stone-200 rounded-2xl p-10 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200">
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 text-lg mb-8 leading-relaxed font-light">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-lg font-display">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-slate-500 text-sm mt-1">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 to-teal-700 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-4xl lg:text-5xl font-bold mb-8 font-display">Ready to Excel Beyond Expectations?</h3>
          <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto font-light">
            Join thousands of satisfied clients who have discovered the power of professional spreadsheet services, from feline financial planning to emergency vehicle liquidation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="w-full sm:w-auto bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 text-base">
              Start Free Trial
            </button>
            <button className="w-full sm:w-auto bg-emerald-500 text-emerald-900 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-400 transition-all duration-200 flex items-center justify-center space-x-2 text-base">
              <Phone className="w-5 h-5" />
              <span>Contact Sales</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">IASE</h4>
                  <p className="text-xs text-slate-400 font-medium">Spreadsheet Excellence Since 1987</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Empowering organizations and individuals to achieve spreadsheet mastery through innovative solutions and unparalleled expertise.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-slate-200">Services</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Feline Tax Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency Car Purchase</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blood Test Prep</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Redundant Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-slate-200">Company</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-slate-200">Contact</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <span>info@iase.org</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li>123 Spreadsheet Lane</li>
                <li>Excel City, EC 12345</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-8">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </a>
            </div>
            <p
              className="text-slate-500 text-sm cursor-pointer hover:text-slate-300 transition"
              onClick={handleCopyrightClick}
            >
              © 2024 International Association of Spreadsheet Enthusiasts. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}