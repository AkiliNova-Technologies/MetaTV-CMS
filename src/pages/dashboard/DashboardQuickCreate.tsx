import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  Music,
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { LivestreamDrawer } from "@/components/livestream-table";
import { UploadMusicDrawer } from "@/components/music-table";
import { AddMemberDrawer } from "@/components/team-table";
import { AddProgramDrawer } from "@/components/program-table";
import { useReduxUsers } from "@/hooks/useReduxUsers";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import { useReduxMusic } from "@/hooks/useReduxMusic";
import { useReduxLiveStreams } from "@/hooks/useReduxLiveStreams";
import { toast } from "sonner";
import { IconBroadcast } from "@tabler/icons-react";

export default function DashboardQuickCreate() {
  const navigate = useNavigate();
  const [activeDrawer, setActiveDrawer] = React.useState<string | null>(null);

  const { reload: memberReload } = useReduxUsers();
  const { reload: programReload } = useReduxPrograms();
  const { reload: musicReload } = useReduxMusic();
  const { reload: livestreamReload } = useReduxLiveStreams();

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
  };

  const quickCreateItems = [
    {
      id: "video",
      label: "Upload Video",
      description: "Upload and manage your video content with ease",
      icon: Video,
      action: () => navigate("/dashboard/videos/create-video"),
      badge: "Video",
      badgeVariant: "default" as const,
      gradient: "from-bg-card/10 to-pink-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/10",
      features: ["HD Quality", "Auto Processing", "Analytics"],
    },
    {
      id: "livestream",
      label: "Start Livestream",
      description: "Go live and connect with your audience in real-time",
      icon: IconBroadcast,
      action: () => setActiveDrawer("livestream"),
      badge: "Live",
      badgeVariant: "destructive" as const,
      gradient: "from-bg-card/10 to-orange-500/10",
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-500/10",
      features: ["HD Streaming", "Live Chat", "Recording"],
    },
    {
      id: "music",
      label: "Upload Music",
      description: "Add tracks to your music library and share with fans",
      icon: Music,
      action: () => setActiveDrawer("music"),
      badge: "Audio",
      badgeVariant: "secondary" as const,
      gradient: "from-bg-card/10 to-cyan-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10",
      features: ["High Fidelity", "Metadata", "Playlists"],
    },
    {
      id: "member",
      label: "Add Team Member",
      description: "Invite colleagues to collaborate on your projects",
      icon: Users,
      action: () => setActiveDrawer("member"),
      badge: "Team",
      badgeVariant: "secondary" as const,
      gradient: "from-bg-card/10 to-emerald-500/10",
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-500/10",
      features: ["Role Management", "Permissions", "Activity Log"],
    },
    {
      id: "program",
      label: "Create Program",
      description: "Organize content into programs and series",
      icon: Calendar,
      action: () => setActiveDrawer("program"),
      badge: "Program",
      badgeVariant: "secondary" as const,
      gradient: "from-bg-card/10 to-amber-500/10",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      iconBg: "bg-yellow-500/10",
      features: ["Categories", "Scheduling", "Collections"],
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b px-6 py-8 md:py-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="size-3" />
                  Quick Actions
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Create & Manage
                <span className="block text-primary mt-2">Your Content</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Everything you need to create, manage, and organize your media content 
                in one powerful dashboard.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Create Cards */}
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickCreateItems.map((item, index) => (
            <Card
              key={item.id}
              className={`group relative overflow-hidden cursor-pointer 
                hover:shadow-2xl hover:border-primary/30 
                transition-all duration-500
                bg-gradient-to-br ${item.gradient}`}
              onClick={item.action}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative space-y-4 pb-4">
                {/* Icon and Badge */}
                <div className="flex items-start justify-between">
                  <div className={`size-14 rounded-xl ${item.iconBg} flex items-center justify-center 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`size-7 ${item.iconColor}`} />
                  </div>
                  <Badge variant={item.badgeVariant} className="text-xs font-medium">
                    {item.badge}
                  </Badge>
                </div>

                {/* Title and Description */}
                <div className="space-y-2">
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {item.label}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed line-clamp-2">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4 pt-4 border-t">
                {/* Features List */}
                <div className="space-y-2">
                  {item.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group/btn hover:bg-white/10!"
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                  }}
                >
                  <span className="font-medium">Get Started</span>
                  <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>

            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-12 border-dashed bg-muted/30">
          <CardContent className="p-8">
            <div className="flex items-start gap-6 flex-col md:flex-row">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="size-8 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold">Need Help Getting Started?</h3>
                <p className="text-muted-foreground">
                  Our comprehensive documentation and support team are here to help you 
                  make the most of your content management platform.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="sm">
                    View Documentation
                  </Button>
                  <Button variant="ghost" size="sm">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drawers */}
      {activeDrawer === "livestream" && (
        <LivestreamDrawer
          open={true}
          onClose={handleCloseDrawer}
          showTrigger={false}
          onSave={() => {
            handleCloseDrawer();
            livestreamReload();
            toast.success("Livestream created successfully!");
          }}
        />
      )}

      {activeDrawer === "music" && (
        <UploadMusicDrawer
          open={true}
          onClose={handleCloseDrawer}
          showTrigger={false}
          onUploadSuccess={() => {
            handleCloseDrawer();
            musicReload();
            toast.success("Music uploaded successfully!");
          }}
        />
      )}

      {activeDrawer === "member" && (
        <AddMemberDrawer
          showTrigger={false}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseDrawer();
            }
          }}
          onAddMember={() => {
            handleCloseDrawer();
            memberReload();
            toast.success("Member added successfully!");
          }}
        />
      )}

      {activeDrawer === "program" && (
        <AddProgramDrawer
          showTrigger={false}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseDrawer();
            }
          }}
          onAddProgram={() => {
            handleCloseDrawer();
            programReload();
            toast.success("Program added successfully!");
          }}
        />
      )}
    </div>
  );
}