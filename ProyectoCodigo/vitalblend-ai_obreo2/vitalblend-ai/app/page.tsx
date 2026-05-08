import Link from "next/link";
import { ArrowRight, Check, Brain, Leaf, Activity } from "lucide-react";

export default function WelcomeScreen() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your unique health profile",
    },
    {
      icon: Leaf,
      title: "100% Natural Ingredients",
      description: "Only premium fruit-based compounds, no synthetic additives",
    },
    {
      icon: Activity,
      title: "Personalized for You",
      description: "Custom blends tailored to your fitness goals and lifestyle",
    },
  ];

  const benefits = [
    "Science-backed fruit bioactive compounds",
    "Matched to your specific fitness goals",
    "Addresses your health symptoms naturally",
    "Optimized for your training intensity",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1758406632226-b8c539011cd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd2VsbG5lc3MlMjBuYXR1cmFsJTIwc3VwcGxlbWVudHMlMjBiZXJyaWVzfGVufDF8fHx8MTc3NDAwODE3MXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Wellness Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-background" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center mt-12 md:mt-0">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column */}
            <div className="space-y-8">
              {/* Logo y Título */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl overflow-hidden flex items-center justify-center shadow-lg shadow-primary/50 bg-white">
                   <Leaf className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">VitalBlend AI</h1>
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm mt-1">
                    <p className="text-xs text-primary font-semibold">Powered by AI</p>
                  </div>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Your Personalized <br/>
                  <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                    Natural Supplement
                  </span>
                </h2>
                <p className="text-xl text-gray-300 max-w-xl">
                  AI-powered fruit blends tailored to your fitness goals, health needs, and
                  lifestyle. Natural, science-backed, personalized.
                </p>
              </div>

              {/* CTAs (Botones que llevan al login) */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-14 px-8 bg-primary hover:brightness-110 text-primary-foreground font-semibold text-lg rounded-2xl shadow-lg shadow-primary/30 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-lg rounded-2xl backdrop-blur-sm transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 pt-4">
                {["100% Natural", "AI Personalized", "Science-Backed", "No Synthetics"].map(
                  (badge) => (
                    <div
                      key={badge}
                      className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm text-white font-medium">{badge}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right Column - Stats Card */}
            <div className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Why Choose VitalBlend AI?
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-white/90">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology meets natural wellness
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-secondary rounded-3xl p-8 border border-border hover:border-primary/50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6 bg-gradient-to-br from-primary/10 to-emerald-400/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Ready to Transform Your Wellness?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of athletes and fitness enthusiasts using AI-powered natural supplementation.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-16 px-12 bg-primary hover:brightness-110 text-primary-foreground font-semibold text-xl rounded-2xl shadow-lg shadow-primary/30 transition-all"
          >
            Start Your Journey
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}