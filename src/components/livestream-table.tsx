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
  Trash,
  Image,
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
    }
  }, [editingLivestream]);

  const handleFileChange = (file: File | null) => {
    setThumbnailFile(file);
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
      // Prepare FormData for submission
      const submissionFormData = new FormData();

      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags" && Array.isArray(value)) {
          // Convert tags array to JSON string
          submissionFormData.append(key, JSON.stringify(value));
        } else if (key === "programId" && value === "") {
          // Skip empty programId
        } else if (value !== null && value !== undefined && value !== "") {
          submissionFormData.append(key, value.toString());
        }
      });

      // Add scheduledAt as ISO string
      if (formData.scheduledAt) {
        submissionFormData.append(
          "scheduledAt",
          new Date(formData.scheduledAt).toISOString()
        );
      }

      // Add thumbnail file if selected
      if (thumbnailFile) {
        submissionFormData.append("livestreamThumbnail", thumbnailFile);
      }

      let response;

      if (editingLivestream) {
        // Update existing livestream
        response = await api.put(
          `/livestreams/${editingLivestream.id}`,
          submissionFormData
        );
        toast("Success", { description: "Livestream updated successfully" });
      } else {
        // Create new livestream
        response = await api.post("/livestreams", submissionFormData);
        toast("Success", { description: "Livestream created successfully" });
      }

      const validatedData = livestreamSchema.parse(response.data);
      onSave(validatedData);
      setIsOpen(false);

      // Reset form if not editing
      if (!editingLivestream) {
        resetForm();
      }
    } catch (error) {
      console.error("Operation failed:", error);
      toast("Error", {
        description: "Operation failed. Please try again.",
      });
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
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Create Stream</span>
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <Video className="size-5" />
            {editingLivestream ? "Edit Livestream" : "Create New Livestream"}
          </SheetTitle>
          <SheetDescription>
            {editingLivestream
              ? "Update your livestream details"
              : "Configure your new livestream with all the necessary details"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 text-sm mt-0">
          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-base">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter livestream title"
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
                  placeholder="Describe your livestream"
                  rows={3}
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Thumbnail
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                  ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25"
                  }
                  `}
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
                  {thumbnailFile || formData.thumbnailUrl ? (
                    <div className="text-sm text-muted-foreground">
                      <Upload className="mx-auto size-6 mb-2" />
                      Drag & drop image here or click to browse
                      <div className="text-xs mt-1">JPG, PNG, WebP</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <Upload className="mx-auto size-6 mb-2" />
                      Drag & drop image here or click to browse
                      <div className="text-xs mt-1">JPG, PNG, WebP</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2 max-w-xs text-white truncate">
                  {/* Attachment Icon */}
                  {thumbnailFile ? (
                    <Image className="w-5 h-5" />
                  ) : formData.thumbnailUrl ? (
                    <>
                      <Image className="w-5 h-5" />
                      "Using existing thumbnail"
                    </>
                  ) : (
                    ""
                  )}

                  {/* File name or existing thumbnail */}
                  <span className="w-fit truncate">
                    {thumbnailFile
                      ? thumbnailFile.name
                      : formData.thumbnailUrl
                      ? "Using existing thumbnail"
                      : ""}
                  </span>

                  {/* Delete/Remove button */}
                  {thumbnailFile && (
                    <Button
                      variant="default"
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="ml-auto text-xs text-white bg-background hover:bg-background hover:text-red-600"
                    >
                      <Trash className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <h3 className="font-medium text-base">Scheduling</h3>

              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "LIVE" | "SCHEDULED" | "ENDED" | "PREPARING"
                  ) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="ENDED">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="scheduledAt"
                  className="flex items-center gap-2"
                >
                  <Calendar className="size-4" />
                  Scheduled Date *
                </Label>
                <Input
                  id="scheduledAt"
                  type="date"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    handleInputChange("scheduledAt", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* Stream Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-base">Stream Settings</h3>

              <div className="space-y-2">
                <Label htmlFor="quality" className="flex items-center gap-2">
                  <Video className="size-4" />
                  Quality
                </Label>
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

              {/* <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecording"
                  checked={formData.isRecording}
                  onCheckedChange={(checked) =>
                    handleInputChange("isRecording", checked)
                  }
                />
                <Label htmlFor="isRecording" className="cursor-pointer">
                  Record this stream
                </Label>
              </div> */}
            </div>

            {/* Visibility & Categorization */}
            <div className="space-y-4">
              <h3 className="font-medium text-base">
                Visibility & Categorization
              </h3>

              <div className="space-y-2">
                <Label htmlFor="visibility" className="flex items-center gap-2">
                  <Eye className="size-4" />
                  Visibility
                </Label>
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
                <Label htmlFor="category" className="flex items-center gap-2">
                  Category
                </Label>
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
                <Label className="flex items-center gap-2">
                  <Tag className="size-4" />
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add a tag"
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
                          className="size-4 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTag(tag)}
                        >
                          <IconX className="size-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="programId" className="flex items-center gap-2">
                  Program
                </Label>
                <Select
                  value={formData.programId}
                  onValueChange={(value) =>
                    handleInputChange(
                      "programId",
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loading ? "Loading programs..." : "Select a program"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.length === 0 ? (
                      <div className="px-3 py-2 text-muted-foreground text-sm">
                        No programs available
                      </div>
                    ) : (
                      <>
                        {programs.map((program) => (
                          <SelectItem
                            key={program.id}
                            value={program.id.toString()}
                          >
                            {program.name || `Program #${program.id}`}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                // disabled={!formData.title || isSaving}
              >
                {isSaving ? (
                  <>
                    <IconLoader className="mr-2 size-4 animate-spin" />
                    {editingLivestream ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Video className="mr-2 size-4" />
                    {editingLivestream ? "Update Stream" : "Create Stream"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
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
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 pt-0">
      {/* Thumbnail Section */}
      <div className="relative group cursor-pointer" onClick={handleJoinStream}>
        <div className="aspect-video bg-muted overflow-hidden">
          {(isImageLoading || imageError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted border-1">
              {isImageLoading && !imageError && (
                <IconLoader className="animate-spin size-6 text-muted-foreground" />
              )}
              {imageError && (
                <>
                  <IconAlertCircle className="size-6 text-red-500 mb-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryImage}
                    className="flex items-center gap-2"
                  >
                    <IconRefresh className="size-4" />
                    Retry
                  </Button>
                </>
              )}
            </div>
          )}
          {livestream.thumbnailUrl && (
            <img
              src={livestream.thumbnailUrl}
              alt={`Thumbnail for ${livestream.title}`}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
                imageError ? "hidden" : ""
              }`}
              loading="lazy"
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setImageError(true);
              }}
            />
          )}

          {livestream.status === "LIVE" && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Button
                size="icon"
                className="bg-red-600 hover:bg-red-700 text-white rounded-full"
                aria-label="Join livestream"
                onClick={handleJoinStream}
              >
                <Play className="size-5 ml-0.5" />
              </Button>
            </div>
          )}
        </div>

        <div className="absolute top-2 left-2">
          {getStatusBadge(livestream.status)}
        </div>

        {livestream.status === "LIVE" && (
          <Badge
            variant="destructive"
            className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 animate-pulse"
          >
            <Wifi className="size-3 mr-1" />
            LIVE
          </Badge>
        )}

        {(livestream.duration ?? 0) > 0 && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5"
          >
            <Clock className="size-3 mr-1" />
            {formatDuration(livestream.duration ?? 0)}
          </Badge>
        )}

        <Badge
          variant="outline"
          className="absolute top-2 right-2 bg-white/90 text-black text-xs px-1.5 py-0.5"
        >
          {livestream.quality}
        </Badge>
      </div>

      <CardHeader className="px-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            {livestream.status === "LIVE" ? (
              <>
                <Users className="size-3" />
                <span>{formatViews(livestream.currentViewers)} watching</span>
              </>
            ) : (
              <>
                <Eye className="size-3" />
                <span>{formatViews(livestream.totalViews)} views</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="size-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2
                    className="font-semibold text-lg leading-tight line-clamp-2 hover:text-primary cursor-pointer"
                    onClick={handleJoinStream}
                  >
                    {livestream.title}
                  </h2>
                </TooltipTrigger>
                <TooltipContent>{livestream.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {livestream.program && (
              <p className="text-xs text-muted-foreground mt-1">
                Program: {livestream.program.name}
              </p>
            )}
            {livestream.category && (
              <p className="text-xs text-muted-foreground mt-1">
                Category: {livestream.category}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6 shrink-0">
                <MoreVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {livestream.status === "LIVE" && (
                <DropdownMenuItem onClick={handleJoinStream}>
                  Join Stream
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              {livestream.status !== "LIVE" && (
                <DeleteLivestreamDialog
                  livestream={livestream}
                  onDelete={() => {}}
                />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-1.5 px-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Recording:</span>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {livestream.isRecording ? (
                <CheckCircle className="size-3 text-green-500 mr-1" />
              ) : (
                <XCircle className="size-3 text-red-500 mr-1" />
              )}
              {livestream.isRecording ? "On" : "Off"}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {livestream.visibility === "PUBLIC" ? (
              <Globe className="size-3 mr-1" />
            ) : (
              <Lock className="size-3 mr-1" />
            )}
            {livestream.visibility.toLowerCase()}
          </Badge>
        </div>

        {(livestream.peakViewers ?? 0) > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Peak viewers: {formatViews(livestream.peakViewers ?? 0)}
            </span>
          </div>
        )}

        {livestream.tags && livestream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {livestream.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {livestream.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 text-muted-foreground"
              >
                +{livestream.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
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
    <Button
      variant="link"
      className="text-foreground w-fit px-0 text-left"
      onClick={handleWatchClick}
    >
      {livestream.title}
    </Button>
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
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete livestream:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            livestream <span className="font-semibold">{livestream.title}</span>{" "}
            from the database.
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
              "Delete Livestream"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
  const [data, setData] =
    React.useState<z.infer<typeof livestreamSchema>[]>(livestreams);
  const [editingLivestream, setEditingLivestream] = React.useState<z.infer<
    typeof livestreamSchema
  > | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"table" | "card">("table");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataIds = React.useMemo(
    () => livestreams.map((livestream) => livestream.id),
    [livestreams]
  );

  const handleCreateLivestream = (
    livestream: z.infer<typeof livestreamSchema>
  ) => {
    // Add to your data array
    setData((prev) => [...prev, livestream]);
    // Optional: Send to API
  };

  const handleUpdateLivestream = (
    updatedLivestream: z.infer<typeof livestreamSchema>
  ) => {
    // Update in your data array
    setData((prev) =>
      prev.map((stream) =>
        stream.id === updatedLivestream.id ? updatedLivestream : stream
      )
    );
    // Optional: Send to API
  };

  const handleDeleteLivestream = React.useCallback((livestreamId: number) => {
    setData((prev) =>
      prev.filter((livestream) => livestream.id !== livestreamId)
    );
  }, []);


  const columns = React.useMemo<ColumnDef<z.infer<typeof livestreamSchema>>[]>(
    () => [
      {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
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
      },
      {
        id: "title",
        header: "Title",
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
        header: "Current Viewers",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="size-4 text-muted-foreground" />
            {formatViews(row.original.currentViewers)}
          </div>
        ),
      },
      {
        accessorKey: "totalViews",
        header: "Total Views",
        cell: ({ row }) => formatViews(row.original.totalViews),
      },
      {
        accessorKey: "quality",
        header: "Quality",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.quality}</Badge>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.visibility.toLowerCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "scheduledAt",
        header: () => <div className="w-full text-left">Scheduled At</div>,
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
          return <Label>{formatted}</Label>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {row.original.status === "LIVE" && (
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/dashboard/livestreams/watch/${row.original.id}`)
                  }
                >
                  Join Stream
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setEditingLivestream(row.original);
                  setIsDrawerOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
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
      },
    ],
    [handleDeleteLivestream, navigate]
  );

  const table = useReactTable({
    data,
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
        const newData = arrayMove(data, oldIndex, newIndex);
        // Optional: Save new order to backend
        // api.put('/livestreams/order', { order: newData.map(livestream => livestream.id) });
        return newData;
      });
    }
  }

  const handleViewModeSelect = (value: string) => {
    if (value === "table" || value === "card") {
      setViewMode(value);
    }
  };

  return (
    <Tabs
      defaultValue="table"
      className="w-full flex-col justify-start gap-6"
      value={viewMode}
      onValueChange={(value) => setViewMode(value as "table" | "card")}
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select value={viewMode} onValueChange={handleViewModeSelect}>
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="table">Table View</SelectItem>
            <SelectItem value="card">Card View</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <IconTable className="size-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <IconLayoutGrid className="size-4" />
            Card View
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          {viewMode === "table" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
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

      <>
        <TabsContent
          value="table"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <IconLoader className="animate-spin size-8 text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span>No livestreams found.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
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
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
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
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="card" className="flex flex-col px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map((livestream) => (
              <LivestreamCard
                key={livestream.id}
                livestream={{
                  ...livestream,
                  description: livestream.description ?? "",
                  scheduledAt: livestream.scheduledAt ?? "",
                  startedAt: livestream.startedAt ?? undefined,
                  endedAt:
                    livestream.endedAt === null
                      ? undefined
                      : livestream.endedAt,
                  thumbnailUrl: livestream.thumbnailUrl ?? undefined,
                }}
                onEdit={(livestream) => {
                  setEditingLivestream(livestream);
                  setIsDrawerOpen(true);
                }}
              />
            ))}
          </div>
          {data.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No livestreams found.
            </div>
          )}
        </TabsContent>
      </>
    </Tabs>
  );
}
