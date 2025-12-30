import React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconTable,
  IconLayoutGrid,
  IconPlus,
  IconAlertCircle,
  IconRefresh,
  IconCircle,
  IconClock,
  IconSquare,
  IconX,
  IconEdit,
  IconSearch,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type {
  Row,
  SortingState,
  VisibilityState,
  ColumnDef,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/utils/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Globe,
  Lock,
  MoreVertical,
  Play,
  XCircle,
  Users,
  Wifi,
  Video,
  ImageIcon,
  Tag,
  Upload,

  Image,
  Tv,
  Trash2,
  Hash,
  Share2,
  Radio,
} from "lucide-react";
import { livestreamSchema } from "@/constants/Schemas";
import { useReduxLiveStreams } from "@/hooks/useReduxLiveStreams";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import type { Livestream, LivestreamStatus } from "@/types/livestream";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const LiveStreamCategory = {
  NEWS: "NEWS",
  ENTERTAINMENT: "ENTERTAINMENT",
  SPORTS: "SPORTS",
  EDUCATION: "EDUCATION",
  MUSIC: "MUSIC",
  SERMONS: "SERMONS",
} as const;

export type LiveStreamCategory =
  | "NEWS"
  | "ENTERTAINMENT"
  | "SPORTS"
  | "EDUCATION"
  | "MUSIC"
  | "SERMONS";

interface LivestreamDrawerProps {
  onSave: (livestream: z.infer<typeof livestreamSchema>) => void;
  livestream?: z.infer<typeof livestreamSchema> | null;
  onClose?: () => void;
  open?: boolean;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`
    : `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatViews(views: number) {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function getStatusBadge(status: LivestreamStatus) {
  const variants = {
    LIVE: {
      variant: "destructive" as const,
      color: "text-red-500",
      icon: IconCircle,
    },
    SCHEDULED: {
      variant: "secondary" as const,
      color: "text-orange-500",
      icon: IconClock,
    },
    ENDED: {
      variant: "outline" as const,
      color: "text-gray-500",
      icon: IconSquare,
    },
    PREPARING: {
      variant: "outline" as const,
      color: "text-blue-500",
      icon: IconLoader,
    },
  };

  const config = variants[status];
  const StatusIcon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <StatusIcon
        className={cn(
          "size-3",
          config.color,
          status === "LIVE" && "animate-pulse"
        )}
      />
      {status.toLowerCase()}
    </Badge>
  );
}

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function DraggableRow({ row }: { row: Row<z.infer<typeof livestreamSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Part 3: Enhanced Livestream Drawer Component

interface LivestreamDrawerProps {
  onSave: (livestream: z.infer<typeof livestreamSchema>) => void;
  livestream?: z.infer<typeof livestreamSchema> | null;
  onClose?: () => void;
  open?: boolean;
}

export function LivestreamDrawer({
  onSave,
  livestream: editingLivestream,
  onClose,
  open,
  showTrigger = true,
}: LivestreamDrawerProps & { showTrigger?: boolean }) {
  const { programs, loading } = useReduxPrograms();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: editingLivestream?.title || "",
    description: editingLivestream?.description || "",
    status: editingLivestream?.status || "PREPARING",
    scheduledAt: editingLivestream?.scheduledAt
      ? new Date(editingLivestream.scheduledAt).toISOString().slice(0, 16)
      : "",
    visibility: editingLivestream?.visibility || "PUBLIC",
    isRecording: editingLivestream?.isRecording || false,
    quality: editingLivestream?.quality || "1080p",
    category: editingLivestream?.category || "",
    tags: editingLivestream?.tags || ([] as string[]),
    programId: editingLivestream?.programId?.toString() || "",
    thumbnailUrl: editingLivestream?.thumbnailUrl || "",
  });

  const [newTag, setNewTag] = React.useState("");
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(
    editingLivestream?.thumbnailUrl || null
  );
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  React.useEffect(() => {
    if (editingLivestream) {
      setFormData({
        title: editingLivestream.title || "",
        description: editingLivestream.description || "",
        status: editingLivestream.status || "PREPARING",
        scheduledAt: editingLivestream.scheduledAt
          ? new Date(editingLivestream.scheduledAt).toISOString().slice(0, 16)
          : "",
        visibility: editingLivestream.visibility || "PUBLIC",
        isRecording: editingLivestream.isRecording || false,
        quality: editingLivestream.quality || "1080p",
        category: editingLivestream.category || "",
        tags: editingLivestream.tags || [],
        programId: editingLivestream.programId?.toString() || "",
        thumbnailUrl: editingLivestream.thumbnailUrl || "",
      });
      setThumbnailFile(null);
      setThumbnailPreview(editingLivestream.thumbnailUrl || null);
    }
  }, [editingLivestream]);

  const handleFileChange = (file: File | null) => {
    setThumbnailFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    } else {
      setThumbnailPreview(editingLivestream?.thumbnailUrl || null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file?.type.startsWith("image/")) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const submissionFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags" && Array.isArray(value)) {
          submissionFormData.append(key, JSON.stringify(value));
        } else if (key === "programId" && value === "") {
          // Skip empty programId
        } else if (value !== null && value !== undefined && value !== "") {
          submissionFormData.append(key, value.toString());
        }
      });

      if (formData.scheduledAt) {
        submissionFormData.append(
          "scheduledAt",
          new Date(formData.scheduledAt).toISOString()
        );
      }

      if (thumbnailFile) {
        submissionFormData.append("livestreamThumbnail", thumbnailFile);
      }

      let response;

      if (editingLivestream) {
        response = await api.put(
          `/livestreams/${editingLivestream.id}`,
          submissionFormData
        );
        toast.success("Livestream updated successfully");
      } else {
        response = await api.post("/livestreams", submissionFormData);
        toast.success("Livestream created successfully");
      }

      const validatedData = livestreamSchema.parse(response.data);
      onSave(validatedData);
      setIsOpen(false);

      if (!editingLivestream) {
        resetForm();
      }
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "PREPARING",
      scheduledAt: "",
      visibility: "PUBLIC",
      isRecording: false,
      quality: "1080p",
      category: "",
      tags: [],
      programId: "",
      thumbnailUrl: "",
    });
    setNewTag("");
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setDragOver(false);
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
          onClose?.();
        }
      }}
    >
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="default" size="sm" className="gap-2">
            <IconPlus className="size-4" />
            <span className="hidden lg:inline">Create Stream</span>
            <span className="lg:hidden">Create</span>
          </Button>
        </SheetTrigger>
      )}
      
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
        <SheetHeader className="space-y-3 px-0">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="size-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <Radio className="size-5 text-red-600" />
            </div>
            {editingLivestream ? "Edit Livestream" : "Create New Livestream"}
          </SheetTitle>
          <SheetDescription>
            {editingLivestream
              ? "Update your livestream details and settings"
              : "Set up your new livestream with all necessary configuration"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-base">Basic Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter an engaging title for your stream"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="What will you be streaming about?"
                  rows={3}
                />
              </div>

              {/* Thumbnail Upload with Preview */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Stream Thumbnail
                </Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
                    dragOver
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] || null)
                    }
                  />
                  {thumbnailPreview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Upload className="mx-auto size-12 mb-3 text-muted-foreground" />
                  )}
                  <p className="font-medium mb-1">
                    {thumbnailPreview ? "Change thumbnail" : "Drop thumbnail here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG, WebP (16:9 ratio recommended)
                  </p>
                </div>

                {thumbnailFile && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Image className="size-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">
                        {thumbnailFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(thumbnailFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileChange(null);
                      }}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scheduling Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Clock className="size-4" />
                Scheduling
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Stream Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "LIVE" | "SCHEDULED" | "ENDED" | "PREPARING") =>
                    handleInputChange("status", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREPARING">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        Preparing
                      </div>
                    </SelectItem>
                    <SelectItem value="SCHEDULED">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        Scheduled
                      </div>
                    </SelectItem>
                    <SelectItem value="LIVE">
                      <div className="flex items-center gap-2">
                        <Radio className="size-4" />
                        Live
                      </div>
                    </SelectItem>
                    <SelectItem value="ENDED">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4" />
                        Ended
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    handleInputChange("scheduledAt", e.target.value)
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Stream Settings Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Video className="size-4" />
                Stream Settings
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quality">Stream Quality</Label>
                <Select
                  value={formData.quality}
                  onValueChange={(value) => handleInputChange("quality", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p HD</SelectItem>
                    <SelectItem value="1080p">1080p Full HD</SelectItem>
                    <SelectItem value="1440p">1440p 2K</SelectItem>
                    <SelectItem value="2160p">2160p 4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Video className="size-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="isRecording" className="cursor-pointer font-medium">
                      Record Stream
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Save stream for later viewing
                    </p>
                  </div>
                </div>
                <Checkbox
                  id="isRecording"
                  checked={formData.isRecording}
                  onCheckedChange={(checked) =>
                    handleInputChange("isRecording", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Visibility & Categorization Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Eye className="size-4" />
                Visibility & Categories
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: "PUBLIC" | "PRIVATE" | "UNLISTED") =>
                    handleInputChange("visibility", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      <div className="flex items-center gap-2">
                        <Globe className="size-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="PRIVATE">
                      <div className="flex items-center gap-2">
                        <Lock className="size-4" />
                        Private
                      </div>
                    </SelectItem>
                    <SelectItem value="UNLISTED">
                      <div className="flex items-center gap-2">
                        <Eye className="size-4" />
                        Unlisted
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LiveStreamCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="programId">Program</Label>
                <Select
                  value={formData.programId}
                  onValueChange={(value) =>
                    handleInputChange("programId", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loading ? "Loading programs..." : "Select a program (optional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.length === 0 ? (
                      <div className="px-3 py-2 text-muted-foreground text-sm">
                        No programs available
                      </div>
                    ) : (
                      programs.map((program) => (
                        <SelectItem
                          key={program.id}
                          value={program.id.toString()}
                        >
                          {program.name || `Program #${program.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="size-4" />
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag (press Enter)"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-4 hover:bg-destructive hover:text-destructive-foreground ml-1"
                          onClick={() => removeTag(tag)}
                        >
                          <IconX className="size-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.title || !formData.scheduledAt || isSaving}
            >
              {isSaving ? (
                <>
                  <IconLoader className="mr-2 size-4 animate-spin" />
                  {editingLivestream ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Radio className="mr-2 size-4" />
                  {editingLivestream ? "Update Stream" : "Create Stream"}
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

  

function LivestreamCard({
  livestream,
  onEdit,
}: {
  livestream: Livestream;
  onEdit: (livestream: Livestream) => void;
}) {
  const navigate = useNavigate();
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  const formattedDate = new Date(
    livestream.scheduledAt ?? ""
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleRetryImage = () => {
    setImageError(false);
    setIsImageLoading(true);
  };

  const handleJoinStream = () => {
    navigate(`/dashboard/livestreams/watch/${livestream.id}`);
  };

  const handleEdit = () => {
    onEdit(livestream);
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
      {/* Thumbnail Section with Enhanced Overlay */}
      <div className="relative aspect-video bg-gradient-to-br from-red-500/5 via-muted to-orange-500/5 overflow-hidden cursor-pointer">
        {/* Image Loading/Error States */}
        {(isImageLoading || imageError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            {isImageLoading && !imageError && (
              <IconLoader className="animate-spin size-8 text-muted-foreground" />
            )}
            {imageError && (
              <>
                <IconAlertCircle className="size-8 text-red-500 mb-2" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryImage}
                  className="gap-2"
                >
                  <IconRefresh className="size-4" />
                  Retry
                </Button>
              </>
            )}
          </div>
        )}

        {/* Thumbnail Image */}
        {livestream.thumbnailUrl && (
          <img
            src={livestream.thumbnailUrl}
            alt={livestream.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              "group-hover:scale-105",
              imageError && "hidden"
            )}
            loading="lazy"
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setIsImageLoading(false);
              setImageError(true);
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play Button Overlay (for LIVE streams) */}
        {livestream.status === "LIVE" && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handleJoinStream}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/40 rounded-full blur-xl scale-150 animate-pulse" />
              <Button
                size="icon"
                className="relative size-16 rounded-full shadow-2xl hover:scale-110 transition-transform bg-red-600/90 backdrop-blur-sm"
              >
                <Play className="size-8 text-white ml-1" fill="white" />
              </Button>
            </div>
          </div>
        )}

        {/* Status Badge (Top Left) */}
        <div className="absolute top-3 left-3">
          {getStatusBadge(livestream.status)}
        </div>

        {/* LIVE Indicator (Bottom Left) */}
        {livestream.status === "LIVE" && (
          <Badge className="absolute bottom-3 left-3 bg-red-600/90 backdrop-blur-sm border-0 shadow-lg gap-1.5">
            <div className="size-2 rounded-full bg-white animate-pulse" />
            <Wifi className="size-3" />
            <span className="font-bold">LIVE</span>
          </Badge>
        )}

        {/* Duration Badge (Bottom Right) */}
        {(livestream.duration ?? 0) > 0 && (
          <Badge className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm border-0 text-white gap-1">
            <Clock className="size-3" />
            {formatDuration(livestream.duration ?? 0)}
          </Badge>
        )}

        {/* Quality Badge (Top Right) */}
        <Badge variant="secondary" className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm border-0 font-medium">
          {livestream.quality}
        </Badge>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="flex items-center justify-between text-white/90 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              {livestream.status === "LIVE" ? (
                <>
                  <Users className="size-3.5" />
                  <span>{formatViews(livestream.currentViewers)} watching</span>
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
                  <span>{formatViews(livestream.totalViews)} views</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className="font-bold text-base leading-tight line-clamp-2 hover:text-primary cursor-pointer transition-colors"
                    onClick={handleJoinStream}
                  >
                    {livestream.title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>{livestream.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Program and Category */}
            {(livestream.program || livestream.category) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {livestream.program && (
                  <div className="flex items-center gap-1">
                    <Tv className="size-3" />
                    <span>{livestream.program.name}</span>
                  </div>
                )}
                {livestream.category && (
                  <div className="flex items-center gap-1">
                    <Hash className="size-3" />
                    <span>{livestream.category}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/10">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {livestream.status === "LIVE" && (
                <>
                  <DropdownMenuItem onClick={handleJoinStream}>
                    <Play className="size-4 mr-2" />
                    Join Stream
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleEdit}>
                <IconEdit className="size-4 mr-2" />
                Edit Stream
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="size-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {livestream.status !== "LIVE" && (
                <DeleteLivestreamDialog livestream={livestream} onDelete={() => {}} />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs border-t pt-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Recording:</span>
            <Badge 
              variant={livestream.isRecording ? "default" : "outline"} 
              className={cn(
                "text-xs px-2 py-0 gap-1",
                livestream.isRecording && "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
              )}
            >
              {livestream.isRecording ? (
                <CheckCircle className="size-3" />
              ) : (
                <XCircle className="size-3" />
              )}
              {livestream.isRecording ? "On" : "Off"}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs px-2 py-0 gap-1">
            {livestream.visibility === "PUBLIC" ? (
              <Globe className="size-3" />
            ) : (
              <Lock className="size-3" />
            )}
            {livestream.visibility.toLowerCase()}
          </Badge>
        </div>

        {/* Peak Viewers */}
        {(livestream.peakViewers ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3" />
            <span>Peak: {formatViews(livestream.peakViewers ?? 0)} viewers</span>
          </div>
        )}

        {/* Tags */}
        {livestream.tags && livestream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {livestream.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0 font-medium border-primary/20 hover:bg-primary/10 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {livestream.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0 text-muted-foreground">
                +{livestream.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Hover Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-500/50 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </Card>
  );
}

function TableCellViewer({
  livestream,
}: {
  livestream: z.infer<typeof livestreamSchema>;
}) {
  const navigate = useNavigate();

  const handleWatchClick = () => {
    navigate(`/dashboard/livestreams/watch/${livestream.id}`);
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10 border">
        <AvatarImage
          src={livestream.thumbnailUrl ?? undefined}
          alt={livestream.title}
        />
        <AvatarFallback className="bg-gradient-to-br from-red-500/20 to-orange-500/20">
          <Tv className="size-5 text-red-600" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <Button
          variant="link"
          className="text-foreground p-0 h-auto font-semibold text-left justify-start hover:text-primary"
          onClick={handleWatchClick}
        >
          {livestream.title}
        </Button>
        {livestream.category && (
          <span className="text-xs text-muted-foreground">
            {livestream.category}
          </span>
        )}
      </div>
    </div>
  );
}

function DeleteLivestreamDialog({
  livestream,
  onDelete,
}: {
  livestream: z.infer<typeof livestreamSchema>;
  onDelete: (livestreamId: number) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { reload: livestreamsReload } = useReduxLiveStreams();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/livestreams/${livestream.id}`);
      onDelete(livestream.id);
      await livestreamsReload();
      toast.success("Livestream deleted successfully");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete livestream:", err);
      toast.error("Failed to delete livestream");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <Trash2 className="size-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <IconAlertCircle className="size-5 text-red-600" />
            </div>
            Delete Livestream?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{livestream.title}</span>? This
            action cannot be undone and will permanently remove all stream data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Livestream
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Part 4: Main LiveStream Table Component

export function LiveStreamTable({
  livestreams,
}: {
  livestreams: z.infer<typeof livestreamSchema>[];
}) {
  const navigate = useNavigate();
  const {
    livestreams: livestreamData,
    reload: livestreamsReload,
    loading,
  } = useReduxLiveStreams();
  
  const [data, setData] = React.useState<z.infer<typeof livestreamSchema>[]>(livestreams);
  const [editingLivestream, setEditingLivestream] = React.useState<z.infer<typeof livestreamSchema> | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"table" | "card">("card");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 12,
  });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  React.useEffect(() => {
    setData(livestreams);
  }, [livestreams]);

  React.useMemo(() => {
    if (!livestreamData.length) {
      livestreamsReload();
    }
  }, [livestreamData.length, livestreamsReload]);

  const dataIds = React.useMemo(
    () => livestreams.map((livestream) => livestream.id),
    [livestreams]
  );

  const handleCreateLivestream = (livestream: z.infer<typeof livestreamSchema>) => {
    setData((prev) => [...prev, livestream]);
  };

  const handleUpdateLivestream = (updatedLivestream: z.infer<typeof livestreamSchema>) => {
    setData((prev) =>
      prev.map((stream) =>
        stream.id === updatedLivestream.id ? updatedLivestream : stream
      )
    );
  };

  const handleDeleteLivestream = React.useCallback((livestreamId: number) => {
    setData((prev) => prev.filter((livestream) => livestream.id !== livestreamId));
  }, []);

  const filteredData = React.useMemo(() => {
    if (!globalFilter) return data;
    return data.filter((stream) =>
      `${stream.title} ${stream.category} ${stream.program?.name} ${stream.status}`
        .toLowerCase()
        .includes(globalFilter.toLowerCase())
    );
  }, [data, globalFilter]);

  const columns = React.useMemo<ColumnDef<z.infer<typeof livestreamSchema>>[]>(
    () => [
      {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
        size: 40,
      },
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        id: "title",
        header: "Stream",
        cell: ({ row }) => <TableCellViewer livestream={row.original} />,
        enableHiding: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "currentViewers",
        header: "Viewers",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="font-medium">{formatViews(row.original.currentViewers)}</span>
          </div>
        ),
      },
      {
        accessorKey: "totalViews",
        header: "Total Views",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Eye className="size-3.5 text-muted-foreground" />
            <span>{formatViews(row.original.totalViews)}</span>
          </div>
        ),
      },
      {
        accessorKey: "quality",
        header: "Quality",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-medium">
            {row.original.quality}
          </Badge>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <Badge variant="outline" className="gap-1">
            {row.original.visibility === "PUBLIC" ? (
              <Globe className="size-3" />
            ) : (
              <Lock className="size-3" />
            )}
            {row.original.visibility.toLowerCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "scheduledAt",
        header: "Scheduled",
        cell: ({ row }) => {
          const date = new Date(row.original.scheduledAt ?? "");
          const formatted = isNaN(date.getTime())
            ? "N/A"
            : date.toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
          return (
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="size-3.5 text-muted-foreground" />
              {formatted}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="data-[state=open]:bg-muted size-8"
              >
                <IconDotsVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {row.original.status === "LIVE" && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(`/dashboard/livestreams/watch/${row.original.id}`)
                    }
                  >
                    <Play className="size-4 mr-2" />
                    Join Stream
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setEditingLivestream(row.original);
                  setIsDrawerOpen(true);
                }}
              >
                <IconEdit className="size-4 mr-2" />
                Edit Stream
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="size-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.original.status !== "LIVE" && (
                <DeleteLivestreamDialog
                  livestream={row.original}
                  onDelete={handleDeleteLivestream}
                />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [handleDeleteLivestream, navigate]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(Number(active.id));
        const newIndex = dataIds.indexOf(Number(over.id));
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const clearSearch = () => setGlobalFilter("");

  return (
    <Tabs
      defaultValue="card"
      className="w-full flex-col justify-start gap-6"
      value={viewMode}
      onValueChange={(value) => setViewMode(value as "table" | "card")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">Card View</SelectItem>
            <SelectItem value="table">Table View</SelectItem>
          </SelectContent>
        </Select>

        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="card" className="flex items-center gap-2">
            <IconLayoutGrid className="size-4" />
            Card View
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <IconTable className="size-4" />
            Table View
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          {viewMode === "table" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <IconLayoutColumns className="size-4" />
                  <span className="hidden lg:inline">Columns</span>
                  <IconChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <LivestreamDrawer
            onSave={(livestream) => {
              if (editingLivestream) {
                handleUpdateLivestream(livestream);
              } else {
                handleCreateLivestream(livestream);
              }
              setEditingLivestream(null);
            }}
            livestream={editingLivestream}
            open={isDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false);
              setEditingLivestream(null);
            }}
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 lg:px-6">
        <div className="relative max-w-md">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search livestreams by title, category, or status..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-10"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 size-6"
              onClick={clearSearch}
            >
              <IconX className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Table View */}
      <TabsContent value="table" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <IconLoader className="size-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading livestreams...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Radio className="size-12 text-muted-foreground opacity-50" />
                        <div>
                          <p className="font-semibold mb-1">No livestreams found</p>
                          <p className="text-sm text-muted-foreground">
                            {globalFilter ? "Try adjusting your search" : "Create your first livestream to get started"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {globalFilter && (
                            <Button variant="outline" onClick={clearSearch}>
                              Clear search
                            </Button>
                          )}
                          <Button variant="ghost" onClick={() => livestreamsReload()}>
                            <IconRefresh className="size-4 mr-2" />
                            Retry
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} stream(s) selected
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Card View */}
      <TabsContent value="card" className="px-4 lg:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <IconLoader className="size-12 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading livestreams...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((livestream) => (
              <LivestreamCard
                key={livestream.id}
                livestream={{
                  ...livestream,
                  description: livestream.description ?? "",
                  scheduledAt: livestream.scheduledAt ?? "",
                  startedAt: livestream.startedAt ?? undefined,
                  endedAt: livestream.endedAt === null ? undefined : livestream.endedAt,
                  thumbnailUrl: livestream.thumbnailUrl ?? undefined,
                }}
                onEdit={(livestream) => {
                  setEditingLivestream(livestream);
                  setIsDrawerOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-6">
              <div className="size-24 rounded-full bg-red-500/10 flex items-center justify-center">
                <Radio className="size-12 text-red-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-10 rounded-full bg-background border-2 flex items-center justify-center">
                <IconPlus className="size-5 text-muted-foreground" />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2">
              {globalFilter ? "No livestreams found" : "No livestreams yet"}
            </h3>

            <p className="text-muted-foreground mb-6 max-w-sm">
              {globalFilter
                ? "Try adjusting your search terms or clear the filter"
                : "Start broadcasting by creating your first livestream"}
            </p>

            <div className="flex items-center gap-3">
              {globalFilter && (
                <Button variant="outline" onClick={clearSearch}>
                  <IconX className="size-4 mr-2" />
                  Clear Search
                </Button>
              )}
              <LivestreamDrawer
                onSave={handleCreateLivestream}
                showTrigger={true}
              />
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
