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
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Users,
  Bell,
  Shield,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Key,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Settings = {
  appName: string;
  appDescription: string;
  contactEmail: string;
  supportPhone: string;

  // Branding
  primaryColor: string;
  secondaryColor: string;

  // Authentication
  enable2FA: boolean;
  emailVerification: boolean;
  socialLogins: {
    google: boolean;
    facebook: boolean;
    apple: boolean;
  };

  // Notifications
  welcomeEmail: boolean;
  commentNotifications: boolean;
};

export default function DashboardSettings() {
  const [settings, setSettings] = useState<Settings>({
    // General Settings
    appName: "MetaTV",
    appDescription: "A modern media sharing platform",
    contactEmail: "support@metatv.com",
    supportPhone: "+256 7898 74647",

    // Branding
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",

    // Authentication
    enable2FA: true,
    emailVerification: true,
    socialLogins: {
      google: true,
      facebook: false,
      apple: true,
    },

    // Notifications
    welcomeEmail: true,
    commentNotifications: false,
  });

  const handleInputChange = (
    field: keyof Settings,
    value: Settings[keyof Settings]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSettings = (section: string) => {
    console.log(`Saving ${section} settings:`, settings);
    toast.success(`${section} settings saved successfully`);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b px-6 py-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-8xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              {/* Settings Icon */}
              <div className="size-20 rounded-2xl bg-card flex items-center justify-center shadow-xl">
                <Settings className="size-10 text-primary" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
                <p className="text-lg text-muted-foreground">
                  Manage your platform configuration and preferences
                </p>
              </div>
            </div>

            {/* Admin Badge */}
            <Badge className="gap-2 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 px-4 py-2">
              <Shield className="size-4" />
              Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-8xl mx-auto">
        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 py-3"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 py-3">
              <Users className="size-4" />
              <span className="hidden sm:inline">Users & Access</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 py-3"
            >
              <Bell className="size-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* ---------------- General Tab ---------------- */}
          <TabsContent value="general" className="space-y-6">
            {/* App Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Building className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>App Information</CardTitle>
                    <CardDescription>
                      Basic details about your application
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="appName"
                      className="flex items-center gap-2"
                    >
                      <Building className="size-3.5" />
                      App Name
                    </Label>
                    <Input
                      id="appName"
                      value={settings.appName}
                      onChange={(e) =>
                        handleInputChange("appName", e.target.value)
                      }
                      placeholder="Enter app name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactEmail"
                      className="flex items-center gap-2"
                    >
                      <Mail className="size-3.5" />
                      Contact Email
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) =>
                        handleInputChange("contactEmail", e.target.value)
                      }
                      placeholder="support@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appDesc" className="flex items-center gap-2">
                    <Settings className="size-3.5" />
                    Description
                  </Label>
                  <Textarea
                    id="appDesc"
                    value={settings.appDescription}
                    onChange={(e) =>
                      handleInputChange("appDescription", e.target.value)
                    }
                    placeholder="Describe your platform..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.appDescription.length}/500 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="supportPhone"
                    className="flex items-center gap-2"
                  >
                    <Phone className="size-3.5" />
                    Support Phone
                  </Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone}
                    onChange={(e) =>
                      handleInputChange("supportPhone", e.target.value)
                    }
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button
                  onClick={() => saveSettings("general")}
                  className="gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ---------------- Users & Access Tab ---------------- */}
          <TabsContent value="users" className="space-y-6">
            {/* Roles & Permissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Users className="size-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>
                      Define access levels for different user roles
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="size-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="role-management"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Role Management
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable custom role creation and permission assignments
                      </p>
                    </div>
                  </div>
                  <Switch id="role-management" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Default Roles
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <Shield className="size-4 text-purple-600" />
                        <span className="font-semibold">Admin</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Full system access and configuration
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <Shield className="size-4 text-blue-600" />
                        <span className="font-semibold">Moderator</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Content moderation capabilities
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-orange-600" />
                        <span className="font-semibold">Creator</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload and manage content
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-gray-600" />
                        <span className="font-semibold">User</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Basic viewing permissions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 flex justify-between">
                <Button variant="outline">Manage Roles</Button>
                <Button className="gap-2">
                  <CheckCircle2 className="size-4" />
                  Save Permissions
                </Button>
              </CardFooter>
            </Card>

            {/* Authentication */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <Key className="size-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>
                      Configure how users sign in to your platform
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
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
                          Require users to enable 2FA for added security
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="2fa"
                      checked={settings.enable2FA}
                      onCheckedChange={(checked) =>
                        handleInputChange("enable2FA", checked)
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="size-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor="email-verification"
                          className="text-base font-semibold cursor-pointer"
                        >
                          Email Verification
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Require users to verify their email address
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="email-verification"
                      checked={settings.emailVerification}
                      onCheckedChange={(checked) =>
                        handleInputChange("emailVerification", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button
                  onClick={() => saveSettings("authentication")}
                  className="gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Save Authentication
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* ---------------- Notifications Tab ---------------- */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Mail className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                      Configure email notifications sent to users
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="size-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="welcome-email"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Welcome Email
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Send welcome email to new users
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="welcome-email"
                    checked={settings.welcomeEmail}
                    onCheckedChange={(checked) =>
                      handleInputChange("welcomeEmail", checked)
                    }
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Key className="size-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="password-reset"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Password Reset
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Send password reset emails
                      </p>
                    </div>
                  </div>
                  <Switch id="password-reset" defaultChecked />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="size-5 text-purple-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="comment-notifications"
                        className="text-base font-semibold cursor-pointer"
                      >
                        New Comment Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users about new comments on their content
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="comment-notifications"
                    checked={settings.commentNotifications}
                    onCheckedChange={(checked) =>
                      handleInputChange("commentNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="size-5 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="content-published"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Content Published
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users when their content is published
                      </p>
                    </div>
                  </div>
                  <Switch id="content-published" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button onClick={() => saveSettings("email")} className="gap-2">
                  <CheckCircle2 className="size-4" />
                  Save Email Settings
                </Button>
              </CardFooter>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Smartphone className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>
                      Configure push notifications sent to users
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="size-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="push-new-follower"
                        className="text-base font-semibold cursor-pointer"
                      >
                        New Follower
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users when they gain new followers
                      </p>
                    </div>
                  </div>
                  <Switch id="push-new-follower" defaultChecked />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="size-5 text-red-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="push-live"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Live Stream Started
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notify followers when a creator goes live
                      </p>
                    </div>
                  </div>
                  <Switch id="push-live" defaultChecked />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="size-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="push-trending"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Trending Content
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users about trending content they might like
                      </p>
                    </div>
                  </div>
                  <Switch id="push-trending" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button onClick={() => saveSettings("push")} className="gap-2">
                  <CheckCircle2 className="size-4" />
                  Save Push Settings
                </Button>
              </CardFooter>
            </Card>

            {/* Admin Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <AlertCircle className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Admin Alerts</CardTitle>
                    <CardDescription>
                      Configure alerts sent to administrators
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="size-5 text-red-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="alert-system-load"
                        className="text-base font-semibold cursor-pointer"
                      >
                        High System Load
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Alert when system resources are strained
                      </p>
                    </div>
                  </div>
                  <Switch id="alert-system-load" defaultChecked />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="size-5 text-yellow-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="alert-storage"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Storage Usage
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Alert when storage reaches critical levels
                      </p>
                    </div>
                  </div>
                  <Switch id="alert-storage" defaultChecked />
                </div>

                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="size-5 text-purple-600" />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="alert-suspicious"
                        className="text-base font-semibold cursor-pointer"
                      >
                        Suspicious Activity
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Alert on potential security issues
                      </p>
                    </div>
                  </div>
                  <Switch id="alert-suspicious" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30">
                <Button
                  onClick={() => saveSettings("alerts")}
                  className="gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Save Alert Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
