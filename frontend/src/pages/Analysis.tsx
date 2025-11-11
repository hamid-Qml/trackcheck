import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Share2, Music, Clock, Volume2, Activity, Zap, TrendingUp } from 'lucide-react';
import AudioWaveform from '@/components/AudioWaveform';
import NeonCard from '@/components/NeonCard';

const Analysis = () => {
  const { id } = useParams();

  // Mock analysis data
  const analysisData = {
    id: id || 'demo-1',
    fileName: 'Summer Vibes.mp3',
    uploadDate: '2024-01-15 14:30:22',
    duration: '3:42',
    fileSize: '8.5 MB',
    sampleRate: '44.1 kHz',
    bitrate: '320 kbps',
    format: 'MP3',
    
    // Extracted metrics
    metrics: {
      tempo: 128,
      loudness: -14.2,
      energy: 0.78,
      danceability: 0.85,
      valence: 0.73,
      acousticness: 0.12,
      instrumentalness: 0.001,
      speechiness: 0.04,
      liveness: 0.18,
    },
    
    // Spectral analysis
    spectral: {
      spectralCentroid: 2847.3,
      spectralBandwidth: 1923.4,
      spectralRolloff: 7234.1,
      zeroCrossingRate: 0.089,
    },
    
    // AI Commentary
    aiCommentary: {
      overall: "This track demonstrates a vibrant, upbeat electronic dance composition with excellent production quality. The consistent tempo and high energy levels make it well-suited for dance floors and energetic environments.",
      technical: "The audio exhibits strong dynamic range with a professional loudness level at -14.2 LUFS. The spectral analysis reveals a well-balanced frequency distribution with prominent mid-range content, indicating good mix translation across different playback systems.",
      creative: "The high danceability score (0.85) combined with positive valence (0.73) suggests this track would excel in uplifting, energetic contexts. The minimal acoustic elements and low speechiness indicate a focus on instrumental electronic production.",
      recommendations: [
        "Consider slight high-frequency boost for enhanced clarity on smaller speakers",
        "The track's energy profile makes it ideal for fitness playlists and dance events",
        "Similar tempo tracks could complement this in a DJ set or playlist context"
      ]
    }
  };

  const MetricCard = ({ title, value, unit, description, progress }: {
    title: string;
    value: number;
    unit?: string;
    description: string;
    progress?: number;
  }) => (
    <Card className="bg-card/60 border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">{title}</h4>
          <span className="text-lg font-bold text-primary">
            {value}{unit}
          </span>
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mb-2 h-2" />
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold">{analysisData.fileName}</h1>
                <p className="text-sm text-muted-foreground">Analysis completed on {analysisData.uploadDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Audio Overview */}
            <NeonCard title="Audio Overview" glowing>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Waveform Analysis</h4>
                    <AudioWaveform className="h-24 bg-primary/5 rounded-lg p-4" animated />
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{analysisData.duration}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Format:</span>
                        <p className="font-medium">{analysisData.format}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sample Rate:</span>
                        <p className="font-medium">{analysisData.sampleRate}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bitrate:</span>
                        <p className="font-medium">{analysisData.bitrate}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        <Clock className="h-3 w-3 mr-1" />
                        {analysisData.metrics.tempo} BPM
                      </Badge>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                        <Volume2 className="h-3 w-3 mr-1" />
                        {analysisData.metrics.loudness} LUFS
                      </Badge>
                      <Badge variant="secondary" className="bg-accent/20 text-accent">
                        <Zap className="h-3 w-3 mr-1" />
                        {Math.round(analysisData.metrics.energy * 100)}% Energy
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </NeonCard>

            {/* Analysis Tabs */}
            <Tabs defaultValue="metrics" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="metrics">Audio Metrics</TabsTrigger>
                <TabsTrigger value="spectral">Spectral Analysis</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard
                    title="Danceability"
                    value={Math.round(analysisData.metrics.danceability * 100)}
                    unit="%"
                    description="How suitable the track is for dancing"
                    progress={analysisData.metrics.danceability * 100}
                  />
                  <MetricCard
                    title="Valence"
                    value={Math.round(analysisData.metrics.valence * 100)}
                    unit="%"
                    description="Musical positivity and uplifting quality"
                    progress={analysisData.metrics.valence * 100}
                  />
                  <MetricCard
                    title="Energy"
                    value={Math.round(analysisData.metrics.energy * 100)}
                    unit="%"
                    description="Perceptual measure of intensity and power"
                    progress={analysisData.metrics.energy * 100}
                  />
                  <MetricCard
                    title="Acousticness"
                    value={Math.round(analysisData.metrics.acousticness * 100)}
                    unit="%"
                    description="Likelihood of the track being acoustic"
                    progress={analysisData.metrics.acousticness * 100}
                  />
                  <MetricCard
                    title="Instrumentalness"
                    value={Math.round(analysisData.metrics.instrumentalness * 100)}
                    unit="%"
                    description="Predicts whether a track contains vocals"
                    progress={analysisData.metrics.instrumentalness * 100}
                  />
                  <MetricCard
                    title="Liveness"
                    value={Math.round(analysisData.metrics.liveness * 100)}
                    unit="%"
                    description="Presence of audience in the recording"
                    progress={analysisData.metrics.liveness * 100}
                  />
                </div>
              </TabsContent>

              <TabsContent value="spectral" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <MetricCard
                    title="Spectral Centroid"
                    value={Math.round(analysisData.spectral.spectralCentroid)}
                    unit=" Hz"
                    description="Brightness of the sound, weighted mean of frequencies"
                  />
                  <MetricCard
                    title="Spectral Bandwidth"
                    value={Math.round(analysisData.spectral.spectralBandwidth)}
                    unit=" Hz"
                    description="Width of the spectrum, measure of how spread out it is"
                  />
                  <MetricCard
                    title="Spectral Rolloff"
                    value={Math.round(analysisData.spectral.spectralRolloff)}
                    unit=" Hz"
                    description="Frequency below which 85% of spectral energy is contained"
                  />
                  <MetricCard
                    title="Zero Crossing Rate"
                    value={Number(analysisData.spectral.zeroCrossingRate.toFixed(3))}
                    description="Rate at which the signal changes from positive to negative"
                  />
                </div>
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-6">
                <div className="grid gap-6">
                  <NeonCard title="Overall Assessment">
                    <p className="text-sm leading-relaxed">{analysisData.aiCommentary.overall}</p>
                  </NeonCard>
                  
                  <NeonCard title="Technical Analysis">
                    <p className="text-sm leading-relaxed">{analysisData.aiCommentary.technical}</p>
                  </NeonCard>
                  
                  <NeonCard title="Creative Insights">
                    <p className="text-sm leading-relaxed">{analysisData.aiCommentary.creative}</p>
                  </NeonCard>
                  
                  <NeonCard title="Recommendations">
                    <ul className="space-y-2">
                      {analysisData.aiCommentary.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </NeonCard>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <Card className="bg-card/60 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-center">Reference Comparison</CardTitle>
                    <CardDescription className="text-center">
                      No reference sample was provided for this analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a reference sample during analysis to see detailed comparisons
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/dashboard">Start New Analysis</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <NeonCard title="Quick Stats" glowing>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tempo</span>
                  <span className="font-medium">{analysisData.metrics.tempo} BPM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Loudness</span>
                  <span className="font-medium">{analysisData.metrics.loudness} LUFS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Key</span>
                  <span className="font-medium">C Major</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time Signature</span>
                  <span className="font-medium">4/4</span>
                </div>
              </div>
            </NeonCard>

            {/* Analysis Score */}
            <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
              <CardHeader>
                <CardTitle className="text-center">Overall Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">8.7</div>
                <p className="text-sm text-muted-foreground">Production Quality</p>
                <Progress value={87} className="mt-4" />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <Link to="/dashboard">Analyze Another Track</Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/history">View Analysis History</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;