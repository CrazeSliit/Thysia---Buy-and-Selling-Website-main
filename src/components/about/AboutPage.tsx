'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  ShoppingBag, 
  Truck, 
  Store, 
  Users, 
  Heart, 
  Shield, 
  Zap, 
  Globe, 
  Award,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Quote
} from 'lucide-react'

const AboutPage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const teamRef = useRef(null)
  
  const isHeroInView = useInView(heroRef, { once: true })
  const isStatsInView = useInView(statsRef, { once: true })
  const isFeaturesInView = useInView(featuresRef, { once: true })
  const isTeamInView = useInView(teamRef, { once: true })

  // Animated counter hook
  const useCounter = (end: number, duration: number = 2) => {
    const [count, setCount] = useState(0)
    const countMotionValue = useMotionValue(0)
    const rounded = useTransform(countMotionValue, (latest) => Math.round(latest))
    const springValue = useSpring(countMotionValue, { duration: duration * 1000 })

    useEffect(() => {
      if (isStatsInView) {
        springValue.set(end)
      }
    }, [springValue, end, isStatsInView])

    useEffect(() => {
      return springValue.on('change', (latest) => {
        setCount(Math.round(latest))
      })
    }, [springValue])

    return count
  }

  const buyersCount = useCounter(50000)
  const sellersCount = useCounter(2500)
  const driversCount = useCounter(1200)
  const ordersCount = useCounter(150000)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  const features = [
    {
      icon: ShoppingBag,
      title: "Smart Shopping Experience",
      description: "AI-powered recommendations and seamless checkout process designed for modern buyers.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Store,
      title: "Seller Empowerment Tools",
      description: "Advanced analytics, inventory management, and marketing tools to grow your business.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Truck,
      title: "Intelligent Delivery Network",
      description: "Real-time tracking, optimized routes, and flexible earning opportunities for drivers.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Trust & Security First",
      description: "End-to-end encryption, secure payments, and verified user profiles for peace of mind.",
      color: "from-red-500 to-red-600"
    }
  ]

  const stats = [
    { 
      value: buyersCount, 
      label: "Happy Buyers", 
      suffix: "K+",
      icon: Users,
      description: "Customers trust us with their shopping needs"
    },
    { 
      value: sellersCount, 
      label: "Active Sellers", 
      suffix: "+",
      icon: Store,
      description: "Businesses growing with our platform"
    },
    { 
      value: driversCount, 
      label: "Delivery Partners", 
      suffix: "+",
      icon: Truck,
      description: "Drivers earning through our network"
    },
    { 
      value: ordersCount, 
      label: "Orders Delivered", 
      suffix: "K+",
      icon: CheckCircle,
      description: "Successfully completed transactions"
    }
  ]

  const team = [
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Ex-Uber tech lead passionate about building scalable marketplace solutions.",
      linkedin: "#"
    },
    {
      name: "Emily Zhang",
      role: "Head of Design",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "Award-winning UX designer from Google, obsessed with user-centric experiences.",
      linkedin: "#"
    },
    {
      name: "David Kim",
      role: "VP of Operations",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      bio: "Logistics expert who revolutionized last-mile delivery at multiple startups.",
      linkedin: "#"
    }
  ]

  const testimonials = [
    {
      quote: "Thysia has completely transformed how I run my online business. The seller tools are incredibly intuitive.",
      author: "Jennifer Martinez",
      role: "Fashion Boutique Owner",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612c661?w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      quote: "As a driver, I love the flexibility and fair earnings. The app makes finding deliveries so easy.",
      author: "Michael Thompson",
      role: "Delivery Driver",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      quote: "Shopping on Thysia feels like having a personal assistant. The recommendations are spot-on!",
      author: "Lisa Wang",
      role: "Regular Customer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 pt-20 pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-60 -left-32 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isHeroInView ? "visible" : "hidden"}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-8"
            >
              <Zap className="w-4 h-4 mr-2" />
              Revolutionizing E-commerce
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight"
            >
              Connecting{' '}
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                Dreams
              </span>
              {' '}with{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Reality
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed"
            >
              We're building the future of commerce where buyers discover amazing products, 
              sellers grow thriving businesses, and drivers earn meaningful income—all in one 
              seamless ecosystem.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
              >
                Join Our Community
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center border border-gray-200"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Our Story
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isStatsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                  <span className="text-primary-400">{stat.suffix}</span>
                </div>
                <div className="text-xl font-semibold text-gray-300 mb-2">{stat.label}</div>
                <div className="text-gray-400 text-sm">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Our <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">Mission</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                To democratize commerce by creating an intelligent marketplace where every participant—buyers, sellers, and drivers—can thrive. We believe in the power of technology to create meaningful connections and sustainable livelihoods.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                  alt="Team collaboration"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent rounded-2xl"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Human-Centered Design</h3>
                  <p className="text-gray-600">Every feature is crafted with empathy, putting user needs at the heart of our decisions.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Impact</h3>
                  <p className="text-gray-600">Building bridges across communities and creating opportunities worldwide.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainable Growth</h3>
                  <p className="text-gray-600">Creating long-term value for all stakeholders through responsible innovation.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Why Choose <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Thysia</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We've reimagined every aspect of e-commerce to create an experience that's intuitive, powerful, and delightful.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group p-8 bg-gray-800 rounded-2xl hover:bg-gray-750 transition-all duration-300 border border-gray-700 hover:border-gray-600"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Meet Our <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate innovators from world-class companies, united by a vision to transform commerce.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isTeamInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group text-center"
              >
                <div className="relative mb-6">
                  <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              What Our <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">Community</span> Says
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real people who are growing their businesses and achieving their dreams with Thysia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-primary-200 mb-4" />
                <p className="text-gray-700 text-lg leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join thousands of successful entrepreneurs who are already building their future with Thysia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup?role=seller"
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Selling Today
              </Link>
              <Link
                href="/auth/signup?role=driver"
                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-200"
              >
                Become a Driver
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
