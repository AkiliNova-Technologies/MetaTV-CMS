import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import {
  User,
  Settings,
  Shield,
  Bell,
  Palette,
  Globe,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
  Download,
  Key,
  Smartphone,
  Video,
  Music,
  Crown,
  Sparkles,
  Activity,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardAccount() {
  const [activeTab, setActiveTab] = useState("account");
  const { user } = useReduxAuth();

  const [profile, setProfile] = useState({
    displayName: `${user?.firstName} ${user?.lastName}`,
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
    email: user?.email,
    phone: "",
    bio: "Digital creator passionate about tech and entertainment",
    website: "https://alexjohnson.com",
    socialMedia: {
      twitter: "alexj",
      instagram: "alexj",
      youtube: "@alexj",
    },
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    contentUpdates: true,
    newsletter: false,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    loginAlerts: true,
  });

  const handleProfileChange = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (
    field: keyof typeof preferences,
    value: string | boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecurityChange = (
    field: keyof typeof security,
    value: boolean
  ) => {
    setSecurity((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProfile = () => {
    console.log("Saving profile:", profile);
    toast.success("Profile updated successfully");
  };

  const savePreferences = () => {
    console.log("Saving preferences:", preferences);
    toast.success("Preferences saved successfully");
  };

  const saveSecurity = () => {
    console.log("Saving security settings:", security);
    toast.success("Security settings updated");
  };

  const getRoleBadgeConfig = (role: string) => {
    const configs = {
      SUPER_ADMIN: {
        variant: "default" as const,
        icon: Crown,
        className:
          "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      },
      ADMIN: {
        variant: "default" as const,
        icon: Shield,
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      },
      MODERATOR: {
        variant: "secondary" as const,
        icon: Settings,
        className:
          "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      },
      CREATOR: {
        variant: "outline" as const,
        icon: Video,
        className:
          "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
      },
      USER: { variant: "outline" as const, icon: User, className: "" },
    };
    return configs[role as keyof typeof configs] || configs.USER;
  };

  const roleConfig = getRoleBadgeConfig(user?.role || "USER");
  const RoleIcon = roleConfig.icon;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b px-6 py-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-8xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              {/* Enhanced Avatar */}
              <div className="relative group">
                <Avatar className="size-24 border-4 border-background shadow-xl">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className="text-3xl font-bold bg-card">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="size-6 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-lg text-muted-foreground">
                  @{user?.username}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={roleConfig.variant}
                    className={`gap-1.5 ${roleConfig.className}`}
                  >
                    <RoleIcon className="size-3" />
                    {user?.role}
                  </Badge>
                  <Badge className="gap-1.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                    <CheckCircle2 className="size-3" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-dashed hover:border-solid transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Activity className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Member Since
                      </p>
                      <p className="text-sm font-bold">
                        {new Date(user?.createdAt || "").toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed hover:border-solid transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Clock className="size-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Login
                      </p>
                      <p className="text-sm font-bold">Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-8xl mx-auto">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 h-auto p-1">
            <TabsTrigger
              value="account"
              className="flex items-center gap-2 py-3"
            >
              <User className="size-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2 py-3"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 py-3"
            >
              <Shield className="size-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <User className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and public profile
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="flex flex-col sm:flex-row items-start gap-6 p-4 border rounded-lg bg-muted/30">
                  <Avatar className="size-20 border-2">
                    <AvatarImage src={user?.avatar} alt={user?.username} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-base font-semibold">
                        Profile Picture
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a square image, at least 400x400 pixels for best
                        quality
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Camera className="size-4" />
                        Upload New
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive gap-2"
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="flex items-center gap-2"
                    >
                      <User className="size-3.5" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        handleProfileChange("firstName", e.target.value)
                      }
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="flex items-center gap-2"
                    >
                      <User className="size-3.5" />
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) =>
                        handleProfileChange("lastName", e.target.value)
                      }
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="size-3.5" />
                    Username
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) =>
                        handleProfileChange("username", e.target.value)
                      }
                      className="pl-7"
                      placeholder="username"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is your public username visible to others
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="size-3.5" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="size-3.5" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="size-3.5" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                    placeholder="Tell others about yourself..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {profile.bio.length}/500 characters
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button onClick={saveProfile} className="gap-2">
                  <CheckCircle2 className="size-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            {/* Your Content Card - For Users/Creators */}
            {(user?.role === "USER" || user?.role === "CREATOR") && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <Sparkles className="size-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Your Content</CardTitle>
                      <CardDescription>
                        Manage your viewing history and saved content
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/20"
                    >
                      <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Video className="size-6 text-red-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Watch History</p>
                        <p className="text-xs text-muted-foreground">
                          245 videos
                        </p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/20"
                    >
                      <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Music className="size-6 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Saved Content</p>
                        <p className="text-xs text-muted-foreground">
                          89 items
                        </p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/20"
                    >
                      <div className="size-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <Sparkles className="size-6 text-yellow-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Favorites</p>
                        <p className="text-xs text-muted-foreground">
                          34 items
                        </p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Palette className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how the app looks and feels
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="flex items-center gap-2">
                      <Palette className="size-3.5" />
                      Theme
                    </Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) =>
                        handlePreferenceChange("theme", value)
                      }
                    >
                      <SelectTrigger id="theme" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Theme</SelectItem>
                        <SelectItem value="dark"> Dark Theme</SelectItem>
                        <SelectItem value="system"> System Theme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="language"
                      className="flex items-center gap-2"
                    >
                      <Globe className="size-3.5" />
                      Language
                    </Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) =>
                        handlePreferenceChange("language", value)
                      }
                    >
                      <SelectTrigger id="language" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es"> Spanish</SelectItem>
                        <SelectItem value="fr"> French</SelectItem>
                        <SelectItem value="de"> German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button onClick={savePreferences} className="gap-2">
                  <CheckCircle2 className="size-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <Bell className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Manage how and when we contact you
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="size-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="email-notifications"
                          className="text-base font-semibold cursor-pointer"
                        >
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates, security alerts, and more via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("emailNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="size-5 text-purple-600" />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="push-notifications"
                          className="text-base font-semibold cursor-pointer"
                        >
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get alerts on your device about new content
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("pushNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="size-5 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="sms-notifications"
                          className="text-base font-semibold cursor-pointer"
                        >
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive text messages for important alerts
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={preferences.smsNotifications}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("smsNotifications", checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Email Preferences
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label
                        htmlFor="content-updates"
                        className="cursor-pointer"
                      >
                        Content Updates
                      </Label>
                      <Switch
                        id="content-updates"
                        checked={preferences.contentUpdates}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("contentUpdates", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label htmlFor="newsletter" className="cursor-pointer">
                        Newsletter
                      </Label>
                      <Switch
                        id="newsletter"
                        checked={preferences.newsletter}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("newsletter", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button onClick={savePreferences} className="gap-2">
                  <CheckCircle2 className="size-4" />
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <Shield className="size-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and authentication
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Key className="size-5 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="2fa"
                          className="text-base font-semibold cursor-pointer"
                        >
                          Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="2fa"
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        handleSecurityChange("twoFactorEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="size-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="login-alerts"
                          className="text-base font-semibold cursor-pointer"
                        >
                          Login Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified of new device logins
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="login-alerts"
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) =>
                        handleSecurityChange("loginAlerts", checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Quick Actions
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="justify-start gap-3">
                      <Key className="size-4" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="justify-start gap-3">
                      <Activity className="size-4" />
                      View Login Activity
                    </Button>
                    <Button variant="outline" className="justify-start gap-3">
                      <Smartphone className="size-4" />
                      Connected Devices
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button onClick={saveSecurity} className="gap-2">
                  <CheckCircle2 className="size-4" />
                  Save Security Settings
                </Button>
              </CardFooter>
            </Card>

            {/* Data & Privacy */}
            <Card className="border-dashed">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center">
                    <Lock className="size-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle>Data & Privacy</CardTitle>
                    <CardDescription>
                      Control your data and account management
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-auto py-4"
                  >
                    <Download className="size-4" />
                    <div className="text-left">
                      <p className="font-semibold">Download Data</p>
                      <p className="text-xs text-muted-foreground">
                        Export your information
                      </p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-auto py-4 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                    <div className="text-left">
                      <p className="font-semibold">Delete Account</p>
                      <p className="text-xs text-muted-foreground">
                        Permanently remove
                      </p>
                    </div>
                  </Button>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                  <p>
                    By using our service, you agree to our{" "}
                    <a
                      href="#"
                      className="text-primary hover:underline font-medium"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-primary hover:underline font-medium"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
