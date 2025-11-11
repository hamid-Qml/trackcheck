import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Upload, Play, Clock, Music, FileAudio, Settings, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NeonCard from '@/components/NeonCard';
import AudioWaveform from '@/components/AudioWaveform';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [autoDelete, setAutoDelete] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const mockRecentAnalyses = [
    { id: '1', name: 'Summer Vibes.mp3', date: '2024-01-15', status: 'completed', duration: '3:42' },
    { id: '2', name: 'Jazz Session.wav', date: '2024-01-14', status: 'completed', duration: '5:28' },
    { id: '3', name: 'Electronic Beat.mp3', date: '2024-01-13', status: 'completed', duration: '4:15' },
  ];

  const handleFileUpload = (file: File, type: 'primary' | 'reference') => {
    if (type === 'primary') {
      setPrimaryFile(file);
    } else {
      setReferenceFile(file);
    }
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const handleAnalysis = () => {
    if (!primaryFile) {
      toast({
        title: "No file selected",
        description: "Please upload an audio file first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Mock analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis complete!",
        description: "Your audio analysis is ready.",
      });
      navigate('/analysis/demo-1');
    }, 3000);
  };

  const FileUploadArea = ({ 
    file, 
    onFileSelect, 
    type, 
    title, 
    description 
  }: {
    file: File | null;
    onFileSelect: (file: File) => void;
    type: string;
    title: string;
    description: string;
  }) => (
    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <Upload className="h-12 w-12 text-primary/60" />
        <div>
          <p className="text-lg font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {file ? (
          <div className="bg-primary/10 px-4 py-2 rounded-md">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <Input
            type="file"
            accept=".mp3,.wav,.flac,.m4a,.aac"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) onFileSelect(selectedFile);
            }}
            className="max-w-xs"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <Music className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">SoundMind AI</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-primary font-medium">Dashboard</Link>
                <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">History</Link>
                <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Upload Area */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Audio Analysis Dashboard</h1>
              <p className="text-muted-foreground">Upload your audio files and get AI-powered insights in seconds.</p>
            </div>

            {/* Primary File Upload */}
            <NeonCard title="Primary Audio File" description="Upload the main audio file you want to analyze" glowing>
              <FileUploadArea
                file={primaryFile}
                onFileSelect={(file) => handleFileUpload(file, 'primary')}
                type="primary"
                title="Drop your audio file here"
                description="Supports MP3, WAV, FLAC, M4A, AAC (max 50MB)"
              />
            </NeonCard>

            {/* Reference File Upload */}
            <NeonCard title="Reference Sample (Optional)" description="Upload a reference track for comparison analysis">
              <FileUploadArea
                file={referenceFile}
                onFileSelect={(file) => handleFileUpload(file, 'reference')}
                type="reference"
                title="Drop reference file here"
                description="Optional: Compare your audio against this reference"
              />
            </NeonCard>

            {/* Analysis Settings */}
            <NeonCard title="Analysis Settings">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-delete" className="text-sm font-medium">Auto-delete files after analysis</Label>
                    <p className="text-xs text-muted-foreground">Files will be automatically deleted for privacy</p>
                  </div>
                  <Switch
                    id="auto-delete"
                    checked={autoDelete}
                    onCheckedChange={setAutoDelete}
                  />
                </div>
                <Separator />
                <div className="flex gap-4">
                  <Button 
                    onClick={handleAnalysis} 
                    disabled={!primaryFile || isAnalyzing}
                    className="flex-1"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" disabled={!primaryFile}>
                    <FileAudio className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </NeonCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Preview */}
            {primaryFile && (
              <NeonCard title="Audio Preview" glowing>
                <div className="space-y-4">
                  <AudioWaveform className="h-16" animated />
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">File:</span> {primaryFile.name}</p>
                    <p><span className="text-muted-foreground">Size:</span> {(primaryFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><span className="text-muted-foreground">Type:</span> {primaryFile.type}</p>
                  </div>
                </div>
              </NeonCard>
            )}

            {/* Recent Analyses */}
            <NeonCard title="Recent Analyses" description="Your latest audio analysis results">
              <div className="space-y-3">
                {mockRecentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{analysis.name}</p>
                      <p className="text-xs text-muted-foreground">{analysis.date} • {analysis.duration}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/analysis/${analysis.id}`}>
                        <Play className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link to="/history">View All</Link>
                </Button>
              </div>
            </NeonCard>

            {/* Supported Formats */}
            <Card className="bg-card/60 border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-primary/10 px-2 py-1 rounded">.MP3</div>
                  <div className="bg-primary/10 px-2 py-1 rounded">.WAV</div>
                  <div className="bg-primary/10 px-2 py-1 rounded">.FLAC</div>
                  <div className="bg-primary/10 px-2 py-1 rounded">.M4A</div>
                  <div className="bg-primary/10 px-2 py-1 rounded">.AAC</div>
                  <div className="bg-primary/10 px-2 py-1 rounded">.OGG</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;