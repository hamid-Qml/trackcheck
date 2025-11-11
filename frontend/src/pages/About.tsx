import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Brain, 
  Zap, 
  Shield, 
  Code, 
  FileAudio,
  BarChart3,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import NeonCard from '@/components/NeonCard';
import AudioWaveform from '@/components/AudioWaveform';

// Cache invalidation comment
const About = () => {
  const supportedFormats = [
    { format: 'MP3', description: 'Most common audio format, good compression' },
    { format: 'WAV', description: 'Uncompressed, highest quality analysis' },
    { format: 'FLAC', description: 'Lossless compression, excellent for analysis' },
    { format: 'M4A', description: 'Apple format, good quality and compatibility' },
    { format: 'AAC', description: 'Advanced audio codec, efficient compression' },
    { format: 'OGG', description: 'Open source format, good quality' },
  ];

  const analysisFeatures = [
    {
      icon: Clock,
      title: 'Tempo Analysis',
      description: 'Precise BPM detection and rhythm analysis for timing insights.',
    },
    {
      icon: BarChart3,
      title: 'Spectral Analysis',
      description: 'Frequency distribution analysis including centroid, bandwidth, and rolloff.',
    },
    {
      icon: Zap,
      title: 'Energy Detection',
      description: 'Measure the intensity and dynamic range of your audio.',
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'LLM-generated commentary and creative recommendations.',
    },
    {
      icon: Activity,
      title: 'Audio Characteristics',
      description: 'Danceability, valence, acousticness, and other musical features.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Optional file deletion and secure processing of your audio.',
    },
  ];

  const faqItems = [
    {
      question: 'How does SoundMind AI analyze audio?',
      answer: 'We use a hybrid approach combining Python-based feature extraction with AI-powered analysis. First, our algorithms extract quantitative metrics like tempo, loudness, and spectral properties. Then, an LLM processes these metrics to generate human-readable insights and recommendations.',
    },
    {
      question: 'What audio formats are supported?',
      answer: 'We support all major audio formats including MP3, WAV, FLAC, M4A, AAC, and OGG. For the most accurate analysis, we recommend using lossless formats like WAV or FLAC when possible.',
    },
    {
      question: 'How long does analysis take?',
      answer: 'Most analyses complete within 30-60 seconds, depending on file size and selected quality settings. High-quality analysis with all features enabled may take up to 2 minutes for longer tracks.',
    },
    {
      question: 'What happens to my uploaded files?',
      answer: 'By default, uploaded files are automatically deleted after analysis completion for your privacy. You can change this setting to retain files for comparison or future reference in your privacy settings.',
    },
    {
      question: 'Can I compare my audio to reference tracks?',
      answer: 'Yes! Upload a reference sample alongside your main audio file to get detailed comparison analysis, including similarity metrics and differential insights.',
    },
    {
      question: 'Is there a file size limit?',
      answer: 'Yes, we currently support files up to 50MB in size. For most audio formats, this allows for tracks up to 30-45 minutes in length.',
    },
    {
      question: 'How accurate is the analysis?',
      answer: 'Our analysis accuracy depends on the audio quality and format. We achieve high accuracy for tempo detection (±1 BPM), loudness measurement (±0.5 LUFS), and other technical metrics. AI-generated insights are based on established audio analysis research.',
    },
    {
      question: 'Can I export my analysis results?',
      answer: 'Absolutely! You can export detailed analysis reports in PDF format, or download raw data in JSON format for further processing or integration with other tools.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Music className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">SoundMind AI</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">History</Link>
                <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
                <Link to="/about" className="text-primary font-medium">About</Link>
              </nav>
            </div>
            <Button asChild>
              <Link to="/dashboard">Try Analysis</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <AudioWaveform className="h-16" animated />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              SoundMind AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced audio analysis platform combining cutting-edge signal processing with AI-powered insights. 
              Upload your audio and discover the hidden patterns in your sound.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/dashboard">Start Analysis</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/history">View Examples</Link>
              </Button>
            </div>
          </div>

          {/* How It Works */}
          <NeonCard title="How SoundMind AI Works" description="Our hybrid approach to intelligent audio analysis" glowing>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <FileAudio className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">1. Upload Audio</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your audio file in any supported format. Optionally add a reference track for comparison.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                  <Code className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold">2. Extract Features</h3>
                <p className="text-sm text-muted-foreground">
                  Python-based analyzers extract quantitative metrics: tempo, loudness, spectral properties, and more.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">3. AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Large language models process the metrics to generate insights, commentary, and recommendations.
                </p>
              </div>
            </div>
          </NeonCard>

          {/* Tabs for detailed information */}
          <Tabs defaultValue="features" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="formats">Supported Formats</TabsTrigger>
              <TabsTrigger value="methodology">Methodology</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisFeatures.map((feature, index) => (
                  <Card key={index} className="bg-card/60 border-primary/30 hover:bg-card/80 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Supported Formats Tab */}
            <TabsContent value="formats" className="space-y-6">
              <NeonCard title="Audio Format Support" description="All major audio formats supported with optimized processing">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supportedFormats.map((format, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                      <Badge variant="secondary" className="bg-primary/20 text-primary font-mono">
                        {format.format}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{format.format}</p>
                        <p className="text-xs text-muted-foreground">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Recommended for Best Results
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    For the most accurate analysis, we recommend using <strong>WAV</strong> or <strong>FLAC</strong> formats 
                    as they preserve the full audio quality without compression artifacts that might affect analysis accuracy.
                  </p>
                </div>
              </NeonCard>
            </TabsContent>

            {/* Methodology Tab */}
            <TabsContent value="methodology" className="space-y-6">
              <NeonCard title="Technical Methodology" description="Understanding our hybrid analysis approach" glowing>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Signal Processing Layer</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Our Python-based analysis engine uses industry-standard libraries including librosa, scipy, and numpy 
                      to extract meaningful audio features. This layer handles the heavy computational work of converting 
                      audio waveforms into quantitative metrics.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Temporal Features</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Tempo and beat tracking</li>
                          <li>• Onset detection</li>
                          <li>• Rhythm patterns</li>
                          <li>• Dynamic range analysis</li>
                        </ul>
                      </div>
                      <div className="bg-secondary/5 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Spectral Features</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Frequency distribution</li>
                          <li>• Spectral centroid & bandwidth</li>
                          <li>• MFCC coefficients</li>
                          <li>• Harmonic analysis</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI Intelligence Layer</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The extracted features are processed by large language models trained to understand musical 
                      characteristics and audio engineering principles. This layer translates raw numbers into 
                      meaningful insights, creative suggestions, and actionable recommendations.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Privacy & Security</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      All processing happens on secure servers with optional file deletion after analysis. 
                      We never store audio content permanently unless explicitly requested, and all data 
                      transmission uses industry-standard encryption.
                    </p>
                  </div>
                </div>
              </NeonCard>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6">
              <NeonCard title="Frequently Asked Questions" description="Everything you need to know about SoundMind AI">
                <Accordion type="single" collapsible className="space-y-2">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-primary/20 rounded-lg px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </NeonCard>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <div className="text-center space-y-6 py-12">
            <h2 className="text-3xl font-bold">Ready to Analyze Your Audio?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of musicians, producers, and audio enthusiasts who use SoundMind AI 
              to understand and improve their sound.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  <Music className="h-4 w-4 mr-2" />
                  Start Your Analysis
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/history">View Sample Results</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;