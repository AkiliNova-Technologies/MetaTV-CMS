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

// Mock user data - in a real app, this would come from authentication context
// const mockUser = {
//   id: "user-123",
//   name: "Alex Johnson",
//   username: "alexj",
//   email: "alex.johnson@example.com",
//   emailVerified: true,
//   phone: "+1 (555) 123-4567",
//   role: "CREATOR", // Can be 'admin', 'moderator', 'creator', or 'user'
//   avatar: "/avatars/alex.jpg",
//   createdAt: "2023-05-15",
// };

export default function DashboardAccount() {
  const [activeTab, setActiveTab] = useState("account");
//   const [user] = useState(mockUser);
  const {user} = useReduxAuth();
  const [profile, setProfile] = useState({
    displayName: `${user?.firstName} ${user?.lastName}`,
    fistName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
    email: user?.email,
    // phone: user?.phone || "",
    phone:  "",
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

  // Add proper TypeScript types to the handler functions
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
    // API call would go here
  };

  const savePreferences = () => {
    console.log("Saving preferences:", preferences);
    // API call would go here
  };

  const saveSecurity = () => {
    console.log("Saving security settings:", security);
    // API call would go here
  };

  return (
    <div className="container mx-auto p-6 space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your profile and account preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 capitalize">
            {user?.role}
          </Badge>
          {/* <Badge
            variant={user?.emailVerified ? "default" : "secondary"}
            className="px-3 py-1"
          >
            {user?.emailVerified ? "Verified" : "Unverified"}
          </Badge> */}
        </div>
      </div>

      <Separator />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {/* {user.role === "creator" && <TabsTrigger value="creator">Creator</TabsTrigger>} */}
          {(user?.role === "SUPER_ADMIN" ||
            user?.role === "ADMIN" ||
            user?.role === "MODERATOR") && (
            <TabsTrigger value="admin">Admin</TabsTrigger>
          )}
        </TabsList>

        {/* Account Tab - Universal for all users */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you on the
                platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback className="text-2xl">
                    {user?.firstName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2 flex-1">
                  <Label>Profile Picture</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Upload New
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: Square image, at least 200x200 pixels
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) =>
                      handleProfileChange("displayName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) =>
                      handleProfileChange("username", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      handleProfileChange("email", e.target.value)
                    }
                  />
                  {/* {!user.emailVerified && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-blue-600"
                    >
                      Verify your email
                    </Button>
                  )} */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>

          {/* For basic users - Watch history, favorites, etc. */}
          {(user?.role === "USER" || user?.role === "CREATOR") && (
            <Card>
              <CardHeader>
                <CardTitle>Your Content</CardTitle>
                <CardDescription>
                  Manage your viewing history and saved content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                  >
                    <span className="text-lg">📺</span>
                    <span>Watch History</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                  >
                    <span className="text-lg">💾</span>
                    <span>Saved Content</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                  >
                    <span className="text-lg">⭐</span>
                    <span>Favorites</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Preferences Tab - Universal for all users */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks and feels for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) =>
                    handlePreferenceChange("theme", value)
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) =>
                    handlePreferenceChange("language", value)
                  }
                >
                  <SelectTrigger id="language">
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
            </CardContent>
            <CardFooter>
              <Button onClick={savePreferences}>Save Preferences</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how and when we contact you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates, security alerts, and more via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("emailNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" className="text-base">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerts on your device about new content and updates
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("pushNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications" className="text-base">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive text messages for important alerts
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("smsNotifications", checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content-updates">Content Updates</Label>
                  <Switch
                    id="content-updates"
                    checked={preferences.contentUpdates}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("contentUpdates", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newsletter">Newsletter</Label>
                  <Switch
                    id="newsletter"
                    checked={preferences.newsletter}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("newsletter", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={savePreferences}>
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab - Universal for all users */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="2fa" className="text-base">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="2fa"
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    handleSecurityChange("twoFactorEnabled", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="login-alerts" className="text-base">
                    Login Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your account is accessed from a new device
                  </p>
                </div>
                <Switch
                  id="login-alerts"
                  checked={security.loginAlerts}
                  onCheckedChange={(checked) =>
                    handleSecurityChange("loginAlerts", checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View Login Activity
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Connected Devices
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSecurity}>Save Security Settings</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Download Your Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                >
                  Delete Account
                </Button>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>
                  By using our service, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creator Tab - Only for users with creator role */}
        {user?.role === "CREATOR" && (
          <TabsContent value="creator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Channel Settings</CardTitle>
                <CardDescription>
                  Customize your creator channel and content defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Channel Banner</Label>
                  <div className="h-32 w-full rounded-md bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">
                      Upload channel banner (1500x500 recommended)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Upload Banner
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="channelDescription">
                    Channel Description
                  </Label>
                  <Textarea
                    id="channelDescription"
                    placeholder="Describe your channel to potential subscribers..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultVisibility">
                      Default Content Visibility
                    </Label>
                    <Select defaultValue="public">
                      <SelectTrigger id="defaultVisibility">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monetization">Default Monetization</Label>
                    <Select defaultValue="enabled">
                      <SelectTrigger id="monetization">
                        <SelectValue placeholder="Select monetization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Social Media Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input placeholder="Twitter URL" />
                    <Input placeholder="Instagram URL" />
                    <Input placeholder="YouTube URL" />
                    <Input placeholder="Website URL" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Channel Settings</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monetization & Earnings</CardTitle>
                <CardDescription>
                  Manage your revenue settings and view your earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">$1,245.67</div>
                    <div className="text-sm text-muted-foreground">
                      This Month
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">$4,892.31</div>
                    <div className="text-sm text-muted-foreground">
                      Lifetime
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">12.4K</div>
                    <div className="text-sm text-muted-foreground">
                      Subscribers
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Payout Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Tax Information
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Admin Tab - Only for users with admin/moderator role */}
        {(user?.role === "ADMIN" || user?.role === "MODERATOR") && (
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Tools</CardTitle>
                <CardDescription>
                  Access administrative functions and moderation tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Permissions</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Content Moderation</Badge>
                    <Badge variant="secondary">User Management</Badge>
                    <Badge variant="secondary">Analytics View</Badge>
                    {user?.role === "ADMIN" && (
                      <Badge variant="default">System Settings</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                  >
                    <span className="text-lg">👥</span>
                    <span>User Management</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                  >
                    <span className="text-lg">📊</span>
                    <span>Content Analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                  >
                    <span className="text-lg">⚙️</span>
                    <span>System Settings</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                  >
                    <span className="text-lg">📝</span>
                    <span>Moderation Queue</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moderation Preferences</CardTitle>
                <CardDescription>
                  Configure your moderation workflow and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="flag-alerts" className="text-base">
                      Flagged Content Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when content is flagged for review
                    </p>
                  </div>
                  <Switch id="flag-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="moderation-digest" className="text-base">
                      Daily Moderation Digest
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of moderation activities
                    </p>
                  </div>
                  <Switch id="moderation-digest" defaultChecked />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Recent Activity</Label>
                  <div className="text-sm text-muted-foreground">
                    <p>• Reviewed 12 content items today</p>
                    <p>• Processed 3 user reports</p>
                    <p>• Last activity: 15 minutes ago</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Moderation Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
