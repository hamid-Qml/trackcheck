import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Calendar, 
  Music, 
  Play, 
  Trash2, 
  Download, 
  Filter,
  Clock,
  Volume2,
  Zap,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NeonCard from '@/components/NeonCard';
import { useToast } from '@/hooks/use-toast';

const History = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  // Mock analysis history data
  const analysisHistory = [
    {
      id: '1',
      fileName: 'Summer Vibes.mp3',
      uploadDate: '2024-01-15',
      uploadTime: '14:30',
      status: 'completed',
      duration: '3:42',
      fileSize: '8.5 MB',
      tempo: 128,
      loudness: -14.2,
      energy: 0.78,
      score: 8.7,
      hasReference: false,
    },
    {
      id: '2',
      fileName: 'Jazz Session.wav',
      uploadDate: '2024-01-14',
      uploadTime: '09:15',
      status: 'completed',
      duration: '5:28',
      fileSize: '52.3 MB',
      tempo: 95,
      loudness: -18.5,
      energy: 0.45,
      score: 9.2,
      hasReference: true,
    },
    {
      id: '3',
      fileName: 'Electronic Beat.mp3',
      uploadDate: '2024-01-13',
      uploadTime: '16:45',
      status: 'completed',
      duration: '4:15',
      fileSize: '9.8 MB',
      tempo: 140,
      loudness: -11.3,
      energy: 0.92,
      score: 7.9,
      hasReference: false,
    },
    {
      id: '4',
      fileName: 'Acoustic Demo.wav',
      uploadDate: '2024-01-12',
      uploadTime: '11:20',
      status: 'processing',
      duration: '2:58',
      fileSize: '28.7 MB',
      tempo: null,
      loudness: null,
      energy: null,
      score: null,
      hasReference: false,
    },
    {
      id: '5',
      fileName: 'Rock Anthem.mp3',
      uploadDate: '2024-01-11',
      uploadTime: '13:10',
      status: 'failed',
      duration: '3:33',
      fileSize: '7.2 MB',
      tempo: null,
      loudness: null,
      energy: null,
      score: null,
      hasReference: false,
    },
  ];

  const filteredHistory = analysisHistory.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string, fileName: string) => {
    toast({
      title: "Analysis deleted",
      description: `${fileName} has been removed from your history.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const AnalysisCard = ({ analysis }: { analysis: typeof analysisHistory[0] }) => (
    <Card className="bg-card/60 border-primary/30 hover:bg-card/80 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Music className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground truncate">{analysis.fileName}</h3>
              <Badge variant="outline" className={getStatusColor(analysis.status)}>
                {analysis.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {analysis.uploadDate} at {analysis.uploadTime}
              </span>
              <span>{analysis.duration}</span>
              <span>{analysis.fileSize}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {analysis.status === 'completed' && (
                <DropdownMenuItem asChild>
                  <Link to={`/analysis/${analysis.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Results
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDelete(analysis.id, analysis.fileName)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {analysis.status === 'completed' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{analysis.tempo}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                BPM
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">{analysis.loudness}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Volume2 className="h-3 w-3" />
                LUFS
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{Math.round((analysis.energy || 0) * 100)}%</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" />
                Energy
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{analysis.score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>
        )}

        {analysis.status === 'processing' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Analysis in progress...
          </div>
        )}

        {analysis.status === 'failed' && (
          <div className="text-sm text-red-400 mb-4">
            Analysis failed. Please try uploading again.
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {analysis.hasReference && (
              <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                With Reference
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {analysis.status === 'completed' && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/analysis/${analysis.id}`}>
                  <Play className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
            )}
            {analysis.status === 'failed' && (
              <Button variant="outline" size="sm">
                <Play className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                <Link to="/history" className="text-primary font-medium">History</Link>
                <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              </nav>
            </div>
            <Button asChild>
              <Link to="/dashboard">New Analysis</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
              <p className="text-muted-foreground">View and manage your past audio analyses</p>
            </div>
          </div>

          {/* Search and Filters */}
          <NeonCard>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="processing">Processing</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </NeonCard>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-primary/10 border-primary/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{analysisHistory.length}</div>
                <div className="text-sm text-muted-foreground">Total Analyses</div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {analysisHistory.filter(a => a.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {analysisHistory.filter(a => a.status === 'processing').length}
                </div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/10 border-secondary/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {analysisHistory.filter(a => a.hasReference).length}
                </div>
                <div className="text-sm text-muted-foreground">With Reference</div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis List */}
          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((analysis) => (
                <AnalysisCard key={analysis.id} analysis={analysis} />
              ))
            ) : (
              <Card className="bg-card/60 border-primary/30">
                <CardContent className="text-center py-16">
                  <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No analyses found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'Start by uploading your first audio file'}
                  </p>
                  <Button asChild>
                    <Link to="/dashboard">Start New Analysis</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Load More */}
          {filteredHistory.length > 0 && (
            <div className="text-center">
              <Button variant="outline">Load More Results</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;