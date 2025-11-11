import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Music, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Download,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import NeonCard from '@/components/NeonCard';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  // User Settings
  const [userSettings, setUserSettings] = useState({
    email: 'user@example.com',
    name: 'Demo User',
    notifications: {
      email: true,
      analysisComplete: true,
      weeklyDigest: false,
      newFeatures: true,
    },
    privacy: {
      autoDelete: true,
      retentionPeriod: '7', // days
      shareAnalytics: false,
      publicProfile: false,
    },
    analysis: {
      defaultQuality: 'high',
      autoAnalyze: false,
      includeMoodAnalysis: true,
      includeGenreDetection: true,
    }
  });

  const handleSave = (section: string) => {
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated successfully.`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export will be ready in a few minutes. We'll email you when it's ready.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "We've sent you an email with instructions to confirm account deletion.",
      variant: "destructive",
    });
  };

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
                <Link to="/settings" className="text-primary font-medium">Settings</Link>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              </nav>
            </div>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account, privacy, and analysis preferences</p>
          </div>

          <Tabs defaultValue="account" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Analysis
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
              <NeonCard title="Account Information" description="Manage your basic account details" glowing>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={userSettings.name}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={userSettings.email}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">Change Password</h4>
                      <p className="text-sm text-muted-foreground">Update your account password</p>
                    </div>
                    <Button variant="outline">Update Password</Button>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave('account')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </NeonCard>

              <NeonCard title="Account Actions" description="Manage your account data and settings">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">Download all your analysis data and settings</p>
                    </div>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </NeonCard>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <NeonCard title="Data Privacy" description="Control how your data is handled and stored" glowing>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-delete" className="text-sm font-medium">Auto-delete uploaded files</Label>
                      <p className="text-sm text-muted-foreground">Automatically delete audio files after analysis</p>
                    </div>
                    <Switch
                      id="auto-delete"
                      checked={userSettings.privacy.autoDelete}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          privacy: { ...prev.privacy, autoDelete: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retention">File Retention Period</Label>
                    <Select 
                      value={userSettings.privacy.retentionPeriod}
                      onValueChange={(value) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          privacy: { ...prev.privacy, retentionPeriod: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                        <SelectItem value="30">1 month</SelectItem>
                        <SelectItem value="never">Never delete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="share-analytics" className="text-sm font-medium">Share anonymous analytics</Label>
                      <p className="text-sm text-muted-foreground">Help improve our service by sharing anonymous usage data</p>
                    </div>
                    <Switch
                      id="share-analytics"
                      checked={userSettings.privacy.shareAnalytics}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          privacy: { ...prev.privacy, shareAnalytics: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="public-profile" className="text-sm font-medium">Public profile</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your analysis statistics</p>
                    </div>
                    <Switch
                      id="public-profile"
                      checked={userSettings.privacy.publicProfile}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          privacy: { ...prev.privacy, publicProfile: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave('privacy')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Privacy Settings
                    </Button>
                  </div>
                </div>
              </NeonCard>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <NeonCard title="Notification Preferences" description="Choose what notifications you'd like to receive" glowing>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-sm font-medium">Email notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={userSettings.notifications.email}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analysis-complete" className="text-sm font-medium">Analysis completion</Label>
                      <p className="text-sm text-muted-foreground">Get notified when your analysis is ready</p>
                    </div>
                    <Switch
                      id="analysis-complete"
                      checked={userSettings.notifications.analysisComplete}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, analysisComplete: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-digest" className="text-sm font-medium">Weekly digest</Label>
                      <p className="text-sm text-muted-foreground">Weekly summary of your analysis activity</p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={userSettings.notifications.weeklyDigest}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, weeklyDigest: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="new-features" className="text-sm font-medium">New features</Label>
                      <p className="text-sm text-muted-foreground">Be the first to know about new analysis features</p>
                    </div>
                    <Switch
                      id="new-features"
                      checked={userSettings.notifications.newFeatures}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          notifications: { ...prev.notifications, newFeatures: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave('notifications')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notification Settings
                    </Button>
                  </div>
                </div>
              </NeonCard>
            </TabsContent>

            {/* Analysis Settings */}
            <TabsContent value="analysis" className="space-y-6">
              <NeonCard title="Analysis Preferences" description="Customize your default analysis settings" glowing>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="quality">Default Analysis Quality</Label>
                    <Select 
                      value={userSettings.analysis.defaultQuality}
                      onValueChange={(value) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          analysis: { ...prev.analysis, defaultQuality: value }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Fast (Basic metrics only)</SelectItem>
                        <SelectItem value="standard">Standard (Most features)</SelectItem>
                        <SelectItem value="high">High Quality (All features)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-analyze" className="text-sm font-medium">Auto-analyze uploads</Label>
                      <p className="text-sm text-muted-foreground">Automatically start analysis after file upload</p>
                    </div>
                    <Switch
                      id="auto-analyze"
                      checked={userSettings.analysis.autoAnalyze}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          analysis: { ...prev.analysis, autoAnalyze: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mood-analysis" className="text-sm font-medium">Include mood analysis</Label>
                      <p className="text-sm text-muted-foreground">Analyze emotional characteristics of the audio</p>
                    </div>
                    <Switch
                      id="mood-analysis"
                      checked={userSettings.analysis.includeMoodAnalysis}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          analysis: { ...prev.analysis, includeMoodAnalysis: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="genre-detection" className="text-sm font-medium">Genre detection</Label>
                      <p className="text-sm text-muted-foreground">Automatically detect and classify music genre</p>
                    </div>
                    <Switch
                      id="genre-detection"
                      checked={userSettings.analysis.includeGenreDetection}
                      onCheckedChange={(checked) => 
                        setUserSettings(prev => ({ 
                          ...prev, 
                          analysis: { ...prev.analysis, includeGenreDetection: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => handleSave('analysis')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Analysis Settings
                    </Button>
                  </div>
                </div>
              </NeonCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;