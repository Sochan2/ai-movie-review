"use client";

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Zap, 
  Target, 
  BarChart3, 
  Search, 
  Brain, 
  FileText, 
  Share2,
  Star,
  Users,
  Shield,
  Clock,
  Sparkles,
  Film,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [demoMovie, setDemoMovie] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDemo = async () => {
    if (!demoMovie.trim()) return;
    setIsAnalyzing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
    // Redirect to main app
    window.open('/movie', '_blank');
  };

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Analysis",
      description: "Get detailed reviews in under 30 seconds with our advanced AI engine"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Personalized Insights", 
      description: "Reviews tailored to your taste preferences and viewing history"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Comprehensive Coverage",
      description: "Plot, acting, cinematography, direction - we analyze it all"
    }
  ];

  const steps = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Enter Movie Title",
      description: "Simple search interface"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Processing", 
      description: "Watch our AI analyze the film"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Get Your Review",
      description: "Receive detailed, personalized critique"
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Share & Save",
      description: "Export or share your reviews"
    }
  ];

  const showcaseFeatures = [
    "Smart Genre Detection",
    "Mood-Based Reviews", 
    "Comparison Tool",
    "Export Options",
    "AI Confidence Scores"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg transform rotate-12 blur-sm"></div>
        <div className="absolute top-40 right-20 w-24 h-36 bg-gradient-to-br from-amber-500 to-red-600 rounded-lg transform -rotate-12 blur-sm"></div>
        <div className="absolute bottom-40 left-1/4 w-28 h-40 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg transform rotate-45 blur-sm"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-4 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold">AI Movie Review</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">Demo</a>
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
              Launch App
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-4xl"
        >
          <div className="flex items-center justify-center mb-6">
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            AI Movie Reviews That Actually Make Sense
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Get instant, intelligent film critiques powered by advanced AI. 
            From blockbusters to indies - professional analysis in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg"
              onClick={() => window.open('/movie', '_blank')}
            >
              Generate Your First Review Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              50K+ Reviews Generated
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              No Credit Card Required
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Results in 30 Seconds
            </div>
          </div>
        </motion.div>

        {/* Floating Movie Cards */}
        <motion.div style={{ y: y1 }} className="absolute top-20 left-10 hidden lg:block">
          <Card className="w-32 h-48 bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <div className="text-xs text-blue-300">AI Analysis</div>
              <div className="text-center">
                <div className="text-lg font-bold">9.2/10</div>
                <div className="text-xs text-gray-300">Inception</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div style={{ y: y2 }} className="absolute top-40 right-10 hidden lg:block">
          <Card className="w-32 h-48 bg-gradient-to-br from-amber-500/20 to-red-600/20 border-amber-500/30 backdrop-blur-sm">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <div className="text-xs text-amber-300">AI Review</div>
              <div className="text-center">
                <div className="text-lg font-bold">8.8/10</div>
                <div className="text-xs text-gray-300">Parasite</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Value Proposition */}
      <section id="features" className="px-6 py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose AI Movie Review?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stop spending hours reading conflicting reviews. Get AI-powered insights that match your taste.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional-quality film analysis in just four simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full mb-6 border-2 border-cyan-500/30">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="px-6 py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need for comprehensive movie analysis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcaseFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/30 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6 flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4 flex-shrink-0" />
                    <span className="text-lg font-medium">{feature}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="px-6 py-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Try It Now
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Enter any movie title and see our AI in action
            </p>
          </motion.div>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  placeholder="Enter movie title (e.g., Inception, Parasite, Dune)"
                  value={demoMovie}
                  onChange={(e) => setDemoMovie(e.target.value)}
                  className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleDemo()}
                />
                <Button 
                  onClick={handleDemo}
                  disabled={!demoMovie.trim() || isAnalyzing}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Movie
                    </>
                  )}
                </Button>
              </div>

              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30"
                >
                  <div className="flex items-center mb-4">
                    <Brain className="h-5 w-5 text-cyan-400 mr-2 animate-pulse" />
                    <span className="text-cyan-400">AI Processing in progress...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3 }}
                      />
                    </div>
                    <div className="text-sm text-gray-400">
                      Analyzing plot structure, character development, cinematography...
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="text-center text-sm text-gray-400 mt-4">
                No signup required • Instant results • Free to try
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Movie Experience?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 50,000+ movie lovers who trust AI Movie Review for intelligent film analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg"
                onClick={() => window.open('/movie', '_blank')}
              >
                Start Reviewing Movies Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-black/40 backdrop-blur-sm border-t border-slate-700/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Film className="h-6 w-6 text-cyan-400" />
              <span className="text-lg font-bold">AI Movie Review</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-8">
            © 2024 AI Movie Review. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}