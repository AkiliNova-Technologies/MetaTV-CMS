import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Music,
  Users,
  Calendar,
  //   Plus,
  ArrowRight,
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
      label: "Create Video",
      description: "Upload and manage video content",
      icon: Video,
      action: () => navigate("/dashboard/videos/create-video"),
      badge: "Video",
      status: "secondary" as const,
    },
    {
      id: "livestream",
      label: "Create Livestream",
      description: "Go live with your audience",
      icon: Video,
      action: () => setActiveDrawer("livestream"),
      badge: "Stream",
      status: "secondary" as const,
    },
    {
      id: "music",
      label: "Upload Music",
      description: "Add new music tracks to your library",
      icon: Music,
      action: () => setActiveDrawer("music"),
      badge: "Audio",
      status: "secondary" as const,
    },
    {
      id: "member",
      label: "Add Member",
      description: "Add team members to collaborate",
      icon: Users,
      action: () => setActiveDrawer("member"),
      badge: "Team",
      status: "secondary" as const,
    },
    {
      id: "program",
      label: "Add Program",
      description: "Create new program categories",
      icon: Calendar,
      action: () => setActiveDrawer("program"),
      badge: "Program",
      status: "secondary" as const,
    },
  ];

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">
          Manage Your Content Effortlessly
        </h1>
        <p className="text-muted-foreground">
          Create videos, livestreams, music, members, and programs in one place.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-4">
        {quickCreateItems.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer w-80 h-54 flex flex-col transition-all hover:shadow-md @container/card group relative pb-16 overflow-hidden"
            onClick={item.action}
          >
            <CardHeader className="">
              <div className="p-2 rounded-lg w-10 flex justify-center items-center h-10 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <CardAction>
                <Badge variant={item.status} className="text-xs">
                  {item.badge}
                </Badge>
              </CardAction>
              <CardTitle className="text-lg font-semibold mt-2 group-hover:text-primary transition-colors">
                {item.label}
              </CardTitle>

              <CardDescription className="text-sm line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>

            <CardFooter className="absolute h-3 bottom-0 left-0 right-0 p-6 border-t border-border ">
              <div className="flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors w-full">
                <span>Click to create</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardFooter>
          </Card>
        ))}
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
