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

type Settings = {
  // General Settings
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

  // Content Settings
  maxUploadSize: number;
  allowedFormats: string[];
  enableLiveChat: boolean;
  maxViewers: number;

  // Notifications
  welcomeEmail: boolean;
  commentNotifications: boolean;

  // System
  storageProvider: string;
  cdnUrl: string;
  maintenanceMode: boolean;
};

export default function DashboardSettings() {
  const [settings, setSettings] = useState<Settings>({
    // General Settings
    appName: "MediaHub",
    appDescription: "A modern media sharing platform",
    contactEmail: "support@mediahub.com",
    supportPhone: "+1 (555) 123-4567",

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

    // Content Settings
    maxUploadSize: 500,
    allowedFormats: ["mp4", "mov", "avi", "mp3", "wav"],
    enableLiveChat: true,
    maxViewers: 1000,

    // Notifications
    welcomeEmail: true,
    commentNotifications: false,

    // System
    storageProvider: "aws",
    cdnUrl: "https://cdn.mediahub.com",
    maintenanceMode: false,
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

  const handleNestedChange = (
  parent: 'socialLogins', // Only allow 'socialLogins' as parent
  field: keyof Settings['socialLogins'], 
  value: boolean
) => {
  setSettings(prev => ({
    ...prev,
    [parent]: {
      ...prev[parent],
      [field]: value
    }
  }))
}   

  const saveSettings = (section: string) => {
    console.log(`Saving ${section} settings:`, settings);
    // Here you would typically make an API call to save settings
  };

  return (
    <div className="container mx-auto px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your platform configuration and preferences
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Admin
        </Badge>
      </div>

      <Separator />

      <Tabs defaultValue="general" className="space-y-6">
        {/* ---------------- Tabs ---------------- */}
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users & Access</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
          <TabsTrigger value="localization">Localization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* ---------------- General ---------------- */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Information</CardTitle>
              <CardDescription>
                Basic details about your application that users will see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name</Label>
                  <Input
                    id="appName"
                    value={settings.appName}
                    onChange={(e) =>
                      handleInputChange("appName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appDesc">Description</Label>
                <Textarea
                  id="appDesc"
                  value={settings.appDescription}
                  onChange={(e) =>
                    handleInputChange("appDescription", e.target.value)
                  }
                  placeholder="Describe your platform..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={settings.supportPhone}
                  onChange={(e) =>
                    handleInputChange("supportPhone", e.target.value)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("general")}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding & Theming</CardTitle>
              <CardDescription>
                Customize the look and feel of your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo Upload</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        Logo
                      </span>
                    </div>
                    <Input type="file" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Favicon Upload</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        Icon
                      </span>
                    </div>
                    <Input type="file" className="flex-1" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        handleInputChange("primaryColor", e.target.value)
                      }
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        handleInputChange("primaryColor", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        handleInputChange("secondaryColor", e.target.value)
                      }
                      className="w-12 h-12 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        handleInputChange("secondaryColor", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("branding")}>
                Save Branding
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---------------- Users & Access ---------------- */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Define access levels for different user roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="role-management" className="text-base">
                    Role Management
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable custom role creation and permission assignments
                  </p>
                </div>
                <Switch id="role-management" />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Default Roles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="font-medium">Admin</div>
                    <div className="text-sm text-muted-foreground">
                      Full system access
                    </div>
                  </div>
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="font-medium">Moderator</div>
                    <div className="text-sm text-muted-foreground">
                      Content moderation capabilities
                    </div>
                  </div>
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="font-medium">Creator</div>
                    <div className="text-sm text-muted-foreground">
                      Upload and manage content
                    </div>
                  </div>
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="font-medium">User</div>
                    <div className="text-sm text-muted-foreground">
                      Basic viewing permissions
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Manage Roles</Button>
              <Button>Save Permissions</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Configure how users sign in to your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="2fa" className="text-base">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to enable 2FA for added security
                  </p>
                </div>
                <Switch
                  id="2fa"
                  checked={settings.enable2FA}
                  onCheckedChange={(checked) =>
                    handleInputChange("enable2FA", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-verification" className="text-base">
                    Email Verification
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify their email address
                  </p>
                </div>
                <Switch
                  id="email-verification"
                  checked={settings.emailVerification}
                  onCheckedChange={(checked) =>
                    handleInputChange("emailVerification", checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Social Logins</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="google-login">Google</Label>
                    <Switch
                      id="google-login"
                      checked={settings.socialLogins.google}
                      onCheckedChange={(checked) =>
                        handleNestedChange("socialLogins", "google", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="facebook-login">Facebook</Label>
                    <Switch
                      id="facebook-login"
                      checked={settings.socialLogins.facebook}
                      onCheckedChange={(checked) =>
                        handleNestedChange("socialLogins", "facebook", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="apple-login">Apple</Label>
                    <Switch
                      id="apple-login"
                      checked={settings.socialLogins.apple}
                      onCheckedChange={(checked) =>
                        handleNestedChange("socialLogins", "apple", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("authentication")}>
                Save Authentication
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---------------- Content ---------------- */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video & Music Defaults</CardTitle>
              <CardDescription>
                Configure default settings for uploaded content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) =>
                      handleInputChange("maxUploadSize", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDuration">Max Duration (minutes)</Label>
                  <Input id="maxDuration" type="number" placeholder="120" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedFormats">Allowed Formats</Label>
                <Input
                  id="allowedFormats"
                  value={settings.allowedFormats.join(", ")}
                  onChange={(e) =>
                    handleInputChange(
                      "allowedFormats",
                      e.target.value.split(",").map((item) => item.trim())
                    )
                  }
                  placeholder="mp4, mov, avi, mp3, wav"
                />
                <p className="text-sm text-muted-foreground">
                  Separate formats with commas
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-thumbnails" className="text-base">
                    Auto-generate Thumbnails
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Extract thumbnails from video content automatically
                  </p>
                </div>
                <Switch id="auto-thumbnails" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("content")}>
                Save Content Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Livestream Settings</CardTitle>
              <CardDescription>
                Configure settings for live streaming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="live-chat" className="text-base">
                    Enable Live Chat
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow viewers to chat during live streams
                  </p>
                </div>
                <Switch
                  id="live-chat"
                  checked={settings.enableLiveChat}
                  onCheckedChange={(checked) =>
                    handleInputChange("enableLiveChat", checked)
                  }
                  defaultChecked
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxViewers">Max Concurrent Viewers</Label>
                  <Input
                    id="maxViewers"
                    type="number"
                    value={settings.maxViewers}
                    onChange={(e) =>
                      handleInputChange("maxViewers", e.target.value)
                    }
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latency">Default Latency</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger id="latency">
                      <SelectValue placeholder="Select latency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="ultra-low">Ultra Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-record" className="text-base">
                    Auto-record Streams
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Save streams for future viewing
                  </p>
                </div>
                <Switch id="auto-record" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("livestream")}>
                Save Livestream Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---------------- Monetization ---------------- */}
        <TabsContent value="monetization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ads Configuration</CardTitle>
              <CardDescription>
                Set up advertising and monetization options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-ads" className="text-base">
                    Enable Ads
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show advertisements on your platform
                  </p>
                </div>
                <Switch id="enable-ads" />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Ad Placement</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pre-roll">Pre-roll Ads</Label>
                    <Switch id="pre-roll" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mid-roll">Mid-roll Ads</Label>
                    <Switch id="mid-roll" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-roll">Post-roll Ads</Label>
                    <Switch id="post-roll" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="banner-ads">Banner Ads</Label>
                    <Switch id="banner-ads" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad-frequency">
                  Ad Frequency Cap (per hour)
                </Label>
                <Input id="ad-frequency" type="number" placeholder="4" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("ads")}>
                Save Ad Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Sharing</CardTitle>
              <CardDescription>
                Configure how revenue is shared with creators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-share">Platform Share (%)</Label>
                  <Input id="platform-share" type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creator-share">Creator Share (%)</Label>
                  <Input id="creator-share" type="number" placeholder="70" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-threshold">Payout Threshold ($)</Label>
                <Input id="payout-threshold" type="number" placeholder="50" />
                <p className="text-sm text-muted-foreground">
                  Minimum amount creators must earn before receiving payment
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-methods">Payment Methods</Label>
                <Select defaultValue="stripe">
                  <SelectTrigger id="payment-methods">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("revenue")}>
                Save Revenue Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---------------- Localization ---------------- */}
        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>
                Configure localization and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="default-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-region">Default Region</Label>
                  <Select defaultValue="us">
                    <SelectTrigger id="default-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-translate" className="text-base">
                    Auto-translate Content
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically translate user-generated content
                  </p>
                </div>
                <Switch id="auto-translate" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="geo-restrictions" className="text-base">
                    Enable Geo-restrictions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict content based on user location
                  </p>
                </div>
                <Switch id="geo-restrictions" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("localization")}>
                Save Localization
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legal & Compliance</CardTitle>
              <CardDescription>
                Configure legal documents and compliance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Terms of Service</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Upload New
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Current: terms-of-service-v2.1.pdf
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Privacy Policy</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Upload New
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Current: privacy-policy-v1.5.pdf
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gdpr">GDPR Compliance</Label>
                  <Switch id="gdpr" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ccpa">CCPA Compliance</Label>
                  <Switch id="ccpa" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="age-restriction">Age Restriction (18+)</Label>
                  <Switch id="age-restriction" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("compliance")}>
                Save Compliance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---------------- Notifications ---------------- */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure email notifications sent to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="welcome-email" className="text-base">
                    Welcome Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send welcome email to new users
                  </p>
                </div>
                <Switch
                  id="welcome-email"
                  checked={settings.welcomeEmail}
                  onCheckedChange={(checked) =>
                    handleInputChange("welcomeEmail", checked)
                  }
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="password-reset" className="text-base">
                    Password Reset
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send password reset emails
                  </p>
                </div>
                <Switch id="password-reset" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="comment-notifications" className="text-base">
                    New Comment Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notify users about new comments on their content
                  </p>
                </div>
                <Switch
                  id="comment-notifications"
                  checked={settings.commentNotifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("commentNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="content-published" className="text-base">
                    Content Published
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notify users when their content is published
                  </p>
                </div>
                <Switch id="content-published" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("email")}>
                Save Email Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Configure push notifications sent to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-new-follower" className="text-base">
                    New Follower
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notify users when they gain new followers
                  </p>
                </div>
                <Switch id="push-new-follower" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-live" className="text-base">
                    Live Stream Started
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notify followers when a creator goes live
                  </p>
                </div>
                <Switch id="push-live" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-trending" className="text-base">
                    Trending Content
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Notify users about trending content they might like
                  </p>
                </div>
                <Switch id="push-trending" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("push")}>
                Save Push Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Alerts</CardTitle>
              <CardDescription>
                Configure alerts sent to administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="alert-system-load" className="text-base">
                    High System Load
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when system resources are strained
                  </p>
                </div>
                <Switch id="alert-system-load" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="alert-storage" className="text-base">
                    Storage Usage
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when storage reaches critical levels
                  </p>
                </div>
                <Switch id="alert-storage" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="alert-suspicious" className="text-base">
                    Suspicious Activity
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Alert on potential security issues
                  </p>
                </div>
                <Switch id="alert-suspicious" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("alerts")}>
                Save Alert Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---------------- System ---------------- */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage & CDN</CardTitle>
              <CardDescription>
                Configure where and how your content is stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storage-provider">Storage Provider</Label>
                <Select
                  value={settings.storageProvider}
                  onValueChange={(value) =>
                    handleInputChange("storageProvider", value)
                  }
                >
                  <SelectTrigger id="storage-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">AWS S3</SelectItem>
                    <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                    <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    <SelectItem value="local">Local Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cdnUrl">CDN URL</Label>
                <Input
                  id="cdnUrl"
                  value={settings.cdnUrl}
                  onChange={(e) => handleInputChange("cdnUrl", e.target.value)}
                  placeholder="https://cdn.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("storage")}>
                Save Storage Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Take your site offline for maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode" className="text-base">
                    Enable Maintenance Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show a maintenance page to all visitors
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleInputChange("maintenanceMode", checked)
                  }
                />
              </div>

              {settings.maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">
                    Maintenance Message
                  </Label>
                  <Textarea
                    id="maintenance-message"
                    placeholder="We're performing maintenance and will be back shortly..."
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("maintenance")}>
                {settings.maintenanceMode
                  ? "Enter Maintenance Mode"
                  : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ---------------- Integrations ---------------- */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API & Webhooks</CardTitle>
              <CardDescription>
                Configure API access and webhook integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-version">API Version</Label>
                <Select defaultValue="v1">
                  <SelectTrigger id="api-version">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">v1 (Current)</SelectItem>
                    <SelectItem value="v2">v2 (Beta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-rate-limit">
                  API Rate Limit (requests/minute)
                </Label>
                <Input id="api-rate-limit" type="number" placeholder="100" />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Webhook Endpoints</h4>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="webhook-events">Send events for:</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="webhook-events" className="w-40">
                      <SelectValue placeholder="Select events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="content">Content Events</SelectItem>
                      <SelectItem value="user">User Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("api")}>
                Save API Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>Connect to analytics services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-analytics">
                  Google Analytics Tracking ID
                </Label>
                <Input id="google-analytics" placeholder="UA-XXXXX-Y" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                <Input id="facebook-pixel" placeholder="XXXXXXXXXXXXXXX" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymize-data" className="text-base">
                    Anonymize IP Addresses
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Protect user privacy by anonymizing data
                  </p>
                </div>
                <Switch id="anonymize-data" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("analytics")}>
                Save Analytics Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
