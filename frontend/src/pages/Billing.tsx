import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NeonCard from '@/components/NeonCard';
import AudioWaveform from '@/components/AudioWaveform';
import { Check, Zap, Music, Sparkles, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Billing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for hobbyists and small projects",
      features: [
        "10 audio analyses per month",
        "Basic audio feature extraction",
        "Standard LLM analysis",
        "Email support",
        "2GB storage"
      ],
      icon: Music,
      popular: false,
      buttonVariant: "outline" as const
    },
    {
      name: "Pro",
      price: "$29", 
      period: "/month",
      description: "For professionals and growing teams",
      features: [
        "100 audio analyses per month",
        "Advanced feature extraction",
        "Premium LLM analysis",
        "Priority support",
        "20GB storage",
        "Batch processing",
        "API access"
      ],
      icon: Zap,
      popular: true,
      buttonVariant: "hero" as const
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month", 
      description: "Unlimited power for large organizations",
      features: [
        "Unlimited audio analyses",
        "Custom feature extraction",
        "Advanced LLM models",
        "24/7 dedicated support", 
        "Unlimited storage",
        "White-label solution",
        "Custom integrations",
        "SLA guarantee"
      ],
      icon: Crown,
      popular: false,
      buttonVariant: "secondary" as const
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 wave-pattern opacity-10" />
      <div className="absolute top-20 right-20 floating-element">
        <Sparkles className="w-16 h-16 text-accent/30" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <AudioWaveform className="scale-200" />
          </div>
          <h1 className="text-5xl font-bold hero-text mb-4">
            Choose Your Audio Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full potential of AI-powered audio analysis. Start with our free tier or upgrade for advanced features.
          </p>
        </div>

        {/* Free tier callout */}
        <div className="mb-12">
          <NeonCard 
            title="🎵 Free Tier Available" 
            description="Get started with 3 free audio analyses per month - no signup required"
            className="max-w-md mx-auto text-center"
            glowing
          >
            <p className="text-sm text-muted-foreground mb-4">
              Perfect for trying out our platform and small experiments. Connect Supabase to enable user accounts and billing.
            </p>
            <Button variant="audio" className="w-full">
              Try Demo Analysis
            </Button>
          </NeonCard>
        </div>

        {/* Pricing plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.name}
                className={`relative bg-card/60 border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary neon-glow scale-105' 
                    : 'border-primary/30 hover:border-primary/60'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/20">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold hero-text">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.buttonVariant}
                    className="w-full"
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : `Demo ${plan.name} Plan`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center hero-text mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6">
            <NeonCard title="How does the audio analysis work?">
              <p className="text-muted-foreground">
                Our platform uses advanced Python libraries to extract audio features, then passes them to AI models for intelligent analysis and insights.
              </p>
            </NeonCard>
            
            <NeonCard title="What audio formats are supported?">
              <p className="text-muted-foreground">
                We support MP3, WAV, FLAC, and most common audio formats. Files are processed securely and can be automatically deleted after analysis.
              </p>
            </NeonCard>
            
            <NeonCard title="Can I cancel anytime?">
              <p className="text-muted-foreground">
                Yes! All plans are month-to-month with no long-term commitments. You can upgrade, downgrade, or cancel at any time.
              </p>
            </NeonCard>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-12">
          <Link 
            to="/" 
            className="text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Billing;