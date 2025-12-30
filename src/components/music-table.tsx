import * as React from "react";
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
  IconSearch,
  IconX,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconAlertCircle,
  IconRefresh,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Globe,
  Lock,
  MoreVertical,
  Play,
  Pause,
  Music,
  Eye,
  Volume2,
  VolumeX,
  Disc3,
  Upload,
  Calendar,
  Tag,
  ImageIcon,
  FileAudio,
  Clock,
  Plus,
  Download,
  Share2,
  CheckCircle2,
  Info,
  Volume1,
  User,
  Pen,
} from "lucide-react";
import type { musicSchema } from "@/constants/Schemas";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Textarea } from "./ui/textarea";
import { useReduxMusic } from "@/hooks/useReduxMusic";
import { toast } from "sonner";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { Progress } from "@/components/ui/progress";
import { STORAGE_BUCKETS, storageUtils } from "@/config/supabase";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatPlays(plays: number) {
  if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
  return plays.toString();
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

function DraggableRow({ row }: { row: Row<z.infer<typeof musicSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 hover:bg-muted/30"
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

// Improved Image Component
function OptimizedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(false);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  const imgSrc = retryCount > 0 ? `${src}?retry=${retryCount}` : src;

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-muted ${className}`}
      >
        <IconAlertCircle className="size-6 text-muted-foreground mb-2" />
        <Button variant="ghost" size="sm" onClick={handleRetry}>
          <IconRefresh className="size-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-muted ${className}`}
        >
          <IconLoader className="animate-spin size-6 text-muted-foreground" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${
          loading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        crossOrigin="anonymous"
      />
    </>
  );
}

// Dramatically Improved Music Card
export function MusicCard({
  music,
  isPlaying,
  onPlayPause,
  onEdit,
}: {
  music: z.infer<typeof musicSchema>;
  isPlaying: boolean;
  onPlayPause: (musicId: number) => void;
  onEdit: (music: z.infer<typeof musicSchema>) => void;
}) {
  const handlePlayClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onPlayPause(music.id);
  };

  return (
    <Card className="group relative min-w-[400px] w-[400px] max-w-[400px] max-h-[200px] flex-row gap-0 overflow-hidden py-0 bg-gradient-to-br from-card to-card/50 hover:shadow-2xl transition-all duration-500 ">
      {/* Cover Image with Enhanced Overlay */}
      <div
        className="relative min-w-[200px] max-w-[200px] aspect-square bg-gradient-to-br from-primary/5 via-muted to-primary/10 cursor-pointer overflow-hidden"
        onClick={handlePlayClick}
      >
        {music.thumbnailUrl ? (
          <OptimizedImage
            src={music.thumbnailUrl}
            alt={`${music.title} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <Disc3 className="size-20 text-primary relative animate-pulse" />
            </div>
            <Music className="size-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Play/Pause Button - Enhanced */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="relative">
            {/* Button */}
            <Button
              size="icon"
              className="relative size-16 rounded-full shadow-2xl hover:scale-110 transition-transform bg-card backdrop-blur-xs transition-all duration-300"
              onClick={handlePlayClick}
            >
              {isPlaying ? (
                <Pause className="size-8 text-white" fill="white" />
              ) : (
                <Play className="size-8 text-white ml-1" fill="white" />
              )}
            </Button>
          </div>
        </div>

        {/* Top Badges Row */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          {/* Playing Indicator with Wave Animation */}
          {isPlaying && (
            <Badge className="bg-green-500/90 backdrop-blur-sm border-0 shadow-lg gap-2">
              <div className="flex items-center gap-0.5">
                <div
                  className="w-0.5 h-2 bg-white animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-0.5 h-3 bg-white animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-0.5 h-2 bg-white animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-white font-medium">Playing</span>
            </Badge>
          )}

          {/* Visibility Badge */}
          {music.visibility !== "PUBLIC" && (
            <Badge
              variant="secondary"
              className="bg-black/60 backdrop-blur-sm border-0 text-white ml-auto"
            >
              <Lock className="size-3 mr-1" />
              {music.visibility === "PRIVATE" ? "Private" : "Unlisted"}
            </Badge>
          )}
        </div>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="flex items-center justify-between text-white/90">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Clock className="size-3.5" />
              <span>{formatDuration(music.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Volume2 className="size-3.5" />
              <span>{formatPlays(music.plays)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track Info - Redesigned */}
      <CardContent className="p-4 space-y-3 flex flex-1 flex-col max-w-[200px]">
        {/* Title & Artist */}
        <div className="space-y-1.5">
          <h3
            className="font-bold text-base line-clamp-1 hover:text-primary cursor-pointer transition-colors leading-tight"
            onClick={handlePlayClick}
          >
            {music.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1.5">
            <User className="size-3.5 flex-shrink-0" />
            {music.artist}
          </p>
        </div>

        {/* Genre Tags - Improved */}
        {music.genre && music.genre.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {music.genre.slice(0, 3).map((genre, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 font-medium border-primary/20 hover:bg-primary/10 transition-colors"
              >
                {genre}
              </Badge>
            ))}
            {music.genre.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 text-muted-foreground"
              >
                +{music.genre.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons Row - More Prominent */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10"
                  onClick={() => {}}
                >
                  <Share2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share track</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(music)}>
                <Pen className="size-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="size-4 mr-2" />
                View Stats
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Release Date - If Available */}
        {music.released && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="size-3" />
            <span>
              Released{" "}
              {new Date(music.released).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TableCellPlayer({
  music,
  onPlayPause,
  onEdit,
  isPlaying,
}: {
  music: z.infer<typeof musicSchema>;
  onPlayPause: (musicId: number) => void;
  onEdit: (music: z.infer<typeof musicSchema>) => void;
  isPlaying: boolean;
}) {
  const handlePlayClick = () => {
    onPlayPause(music.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(music);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 hover:bg-primary/10"
        onClick={handlePlayClick}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="size-16 rounded">
          <AvatarImage src={music.thumbnailUrl} alt={music.title} className="object-cover object-top"/>
          <AvatarFallback className="rounded">
            <Disc3 className="size-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Button
            variant="link"
            className="text-foreground p-0 h-auto font-medium text-left justify-start hover:text-primary"
            onClick={() => onEdit(music)}
          >
            {music.title}
          </Button>
          <p className="text-sm text-muted-foreground truncate">
            {music.artist}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleEditClick}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function DeleteMusicDialog({
  music,
  onDelete,
}: {
  music: z.infer<typeof musicSchema>;
  onDelete: (musicId: number) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/music/${music.id}`);
      onDelete(music.id);
      toast.success("Track deleted successfully");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete music:", err);
      toast.error("Failed to delete track");
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
          <IconX className="size-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <IconAlertCircle className="size-5 text-red-600" />
            </div>
            Delete Track?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold">"{music.title}"</span> by{" "}
            <span className="font-semibold">{music.artist}</span>? This action
            cannot be undone.
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
                <IconX className="mr-2 h-4 w-4" />
                Delete Track
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Enhanced Upload Drawer with Multi-Step Wizard
export function UploadMusicDrawer({
  onUploadSuccess,
  music: editingMusic,
  onClose,
  open,
  showTrigger = true,
}: {
  onUploadSuccess: (newTrack: z.infer<typeof musicSchema>) => void;
  music?: z.infer<typeof musicSchema> | null;
  onClose?: () => void;
  open?: boolean;
  showTrigger?: boolean;
}) {
  const { user } = useReduxAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState<
    "files" | "details" | "review"
  >("files");

  const [formData, setFormData] = React.useState({
    title: editingMusic?.title || "",
    artist: editingMusic?.artist || "",
    audioFile: null as File | null,
    thumbnailFile: null as File | null,
    genre: editingMusic?.genre || ([] as string[]),
    visibility:
      editingMusic?.visibility ||
      ("PUBLIC" as "PUBLIC" | "PRIVATE" | "UNLISTED"),
    released: editingMusic?.released
      ? new Date(editingMusic.released).toISOString().split("T")[0]
      : "",
    licensed: editingMusic?.licensed || "",
  });

  // const [audioPreview, setAudioPreview] = React.useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(
    null
  );
  const [dragOver, setDragOver] = React.useState({
    audio: false,
    thumbnail: false,
  });

  const audioInputRef = React.useRef<HTMLInputElement>(null);
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
    if (editingMusic) {
      setFormData({
        title: editingMusic.title || "",
        artist: editingMusic.artist || "",
        audioFile: null,
        thumbnailFile: null,
        genre: editingMusic.genre || [],
        visibility: editingMusic.visibility || "PUBLIC",
        released: editingMusic.released
          ? new Date(editingMusic.released).toISOString().split("T")[0]
          : "",
        licensed: editingMusic.licensed || "",
      });
      if (editingMusic.thumbnailUrl) {
        setThumbnailPreview(editingMusic.thumbnailUrl);
      }
    }
  }, [editingMusic]);

  const handleFileChange = (
    field: "audioFile" | "thumbnailFile",
    file: File | null
  ) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (field === "thumbnailFile") {
        setThumbnailPreview(previewUrl);
      } else {
        // setAudioPreview(previewUrl);
      }
    } else {
      if (field === "thumbnailFile") {
        setThumbnailPreview(null);
      } else {
        // setAudioPreview(null);
      }
    }
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleDrop = (e: React.DragEvent, type: "audio" | "thumbnail") => {
    e.preventDefault();
    setDragOver((prev) => ({ ...prev, [type]: false }));

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (type === "audio" && file?.type.startsWith("audio/")) {
      handleFileChange("audioFile", file);
    } else if (type === "thumbnail" && file?.type.startsWith("image/")) {
      handleFileChange("thumbnailFile", file);
    }
  };

  const removeGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genre: prev.genre.filter((g) => g !== genre),
    }));
  };

  const extractAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);

      audio.addEventListener("loadedmetadata", () => {
        const duration = Math.round(audio.duration);
        URL.revokeObjectURL(objectUrl);
        resolve(duration);
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      });

      audio.src = objectUrl;
    });
  };

  // Updated UploadMusicDrawer with Supabase integration
  // Replace the handleSubmit function in your existing component with this

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.artist) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!editingMusic && !formData.audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let audioUrl = editingMusic?.audioUrl || "";
      let thumbnailUrl = editingMusic?.thumbnailUrl || "";

      // Upload audio file to Supabase if provided
      if (formData.audioFile) {
        setUploadProgress(10);
        toast.info("Uploading audio file...");

        const audioUploadResult = await storageUtils.uploadFile(
          STORAGE_BUCKETS.MUSIC,
          formData.audioFile,
          (progress) => {
            setUploadProgress(10 + progress * 0.5); // 10-60%
          }
        );

        audioUrl = audioUploadResult.url;
        setUploadProgress(60);
        toast.success("Audio uploaded!");
      }

      // Upload thumbnail to Supabase if provided
      if (formData.thumbnailFile) {
        setUploadProgress(60);
        toast.info("Uploading cover image...");

        const thumbnailUploadResult = await storageUtils.uploadFile(
          STORAGE_BUCKETS.THUMBNAILS,
          formData.thumbnailFile,
          (progress) => {
            setUploadProgress(60 + progress * 0.2); // 60-80%
          }
        );

        thumbnailUrl = thumbnailUploadResult.url;
        setUploadProgress(80);
        toast.success("Cover image uploaded!");
      }

      // Extract duration from audio file if new file
      let duration = editingMusic?.duration || 0;
      if (formData.audioFile) {
        duration = await extractAudioDuration(formData.audioFile);
      }

      setUploadProgress(85);
      toast.info("Saving track details...");

      // Prepare data for backend
      const musicData = {
        title: formData.title,
        artist: formData.artist,
        audioUrl: audioUrl,
        thumbnailUrl: thumbnailUrl,
        duration: duration,
        genre: formData.genre,
        visibility: formData.visibility,
        released: formData.released || null,
        licensed: formData.licensed || "",
        uploadedById: user?.id,
      };

      setUploadProgress(90);

      // Send to backend
      let response;
      if (editingMusic) {
        response = await api.put(`/music/${editingMusic.id}`, musicData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await api.post("/music", musicData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      setUploadProgress(100);

      onUploadSuccess(response.data.music || response.data);

      toast.success(
        editingMusic
          ? "Track updated successfully!"
          : "Track uploaded successfully!"
      );

      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Upload failed:", error);

      // Show specific error message
      const errorMessage =
        error.response?.data?.error || error.message || "Upload failed";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      artist: "",
      audioFile: null,
      thumbnailFile: null,
      genre: [],
      visibility: "PUBLIC",
      released: "",
      licensed: "",
    });
    // setAudioPreview(null);
    setThumbnailPreview(null);
    setCurrentStep("files");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
      onClose?.();
    }
  };

  const canProceedToDetails = formData.audioFile || editingMusic;
  const canProceedToReview = formData.title && formData.artist;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="default" size="sm" className="gap-2">
            <IconPlus className="size-4" />
            <span className="hidden lg:inline">
              {editingMusic ? "Edit Track" : "Upload Track"}
            </span>
            <span className="lg:hidden">Add</span>
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
        <SheetHeader className="space-y-3 px-0">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="size-12 rounded-xl bg-input flex items-center justify-center">
              <Upload className="size-5 text-white" />
            </div>
            {editingMusic ? "Edit Track" : "Upload New Track"}
          </SheetTitle>
          <SheetDescription>
            {editingMusic
              ? "Update your music track details and files"
              : "Upload your music track with all necessary details"}
          </SheetDescription>
        </SheetHeader>

        {/* Multi-Step Tabs */}
        <Tabs
          value={currentStep}
          onValueChange={(v) => setCurrentStep(v as any)}
          className="mt-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="files" className="gap-2">
              <FileAudio className="size-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              disabled={!canProceedToDetails}
              className="gap-2"
            >
              <Info className="size-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="review"
              disabled={!canProceedToReview}
              className="gap-2"
            >
              <CheckCircle2 className="size-4" />
              <span className="hidden sm:inline">Review</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-6">
            {/* FILES TAB */}
            <TabsContent value="files" className="space-y-6">
              {/* Audio File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileAudio className="size-4" />
                    Audio File {!editingMusic && "*"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                      ${
                        dragOver.audio
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                    onDrop={(e) => handleDrop(e, "audio")}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver((prev) => ({ ...prev, audio: true }));
                    }}
                    onDragLeave={() =>
                      setDragOver((prev) => ({ ...prev, audio: false }))
                    }
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(
                          "audioFile",
                          e.target.files?.[0] || null
                        )
                      }
                    />
                    <Upload className="mx-auto size-12 mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Drop audio file here</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports MP3, WAV, FLAC, OGG
                    </p>
                  </div>

                  {formData.audioFile && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-muted rounded-lg">
                      <FileAudio className="size-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {formData.audioFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.audioFile.size / (1024 * 1024)).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleFileChange("audioFile", null)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <IconX className="size-4" />
                      </Button>
                    </div>
                  )}

                  {editingMusic && !formData.audioFile && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-muted/50 rounded-lg">
                      <FileAudio className="size-5 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        Using existing audio file
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Thumbnail Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="size-4" />
                    Cover Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                      ${
                        dragOver.thumbnail
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }`}
                    onDrop={(e) => handleDrop(e, "thumbnail")}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver((prev) => ({ ...prev, thumbnail: true }));
                    }}
                    onDragLeave={() =>
                      setDragOver((prev) => ({ ...prev, thumbnail: false }))
                    }
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(
                          "thumbnailFile",
                          e.target.files?.[0] || null
                        )
                      }
                    />
                    {thumbnailPreview ? (
                      <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden">
                        <img
                          src={thumbnailPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto size-12 mb-3 text-muted-foreground" />
                        <p className="font-medium mb-1">
                          Drop cover image here
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, PNG, WebP (max 10MB)
                        </p>
                      </>
                    )}
                  </div>

                  {formData.thumbnailFile && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-muted rounded-lg">
                      <ImageIcon className="size-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {formData.thumbnailFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.thumbnailFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleFileChange("thumbnailFile", null)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <IconX className="size-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end mt-6">
                <Button
                  type="button"
                  onClick={() => setCurrentStep("details")}
                  disabled={!canProceedToDetails}
                  className="w-full mt-6"
                >
                  Next: Details
                  <IconChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </TabsContent>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Track Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Track Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter track title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) =>
                        handleInputChange("artist", e.target.value)
                      }
                      placeholder="Enter artist name"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Genre */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="size-4" />
                    Genres
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.genre.includes(value)) {
                        setFormData((prev) => ({
                          ...prev,
                          genre: [...prev.genre, value],
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select genre(s)" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "POP",
                        "HIPHOP",
                        "JAZZ",
                        "ROCK",
                        "CLASSICAL",
                        "GOSPEL",
                        "OTHER",
                      ].map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre === "HIPHOP"
                            ? "Hip Hop"
                            : genre.charAt(0) + genre.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.genre.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.genre.map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {genre}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-4 hover:bg-destructive hover:text-destructive-foreground ml-1"
                            onClick={() => removeGenre(genre)}
                          >
                            <IconX className="size-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Visibility & Release Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Publishing Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Eye className="size-4" />
                      Visibility
                    </Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(
                        value: "PUBLIC" | "PRIVATE" | "UNLISTED"
                      ) => handleInputChange("visibility", value)}
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
                    <Label
                      htmlFor="released"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="size-4" />
                      Release Date
                    </Label>
                    <Input
                      id="released"
                      type="date"
                      value={formData.released}
                      onChange={(e) =>
                        handleInputChange("released", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* License */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    License Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="licensed"
                    value={formData.licensed}
                    onChange={(e) =>
                      handleInputChange("licensed", e.target.value)
                    }
                    placeholder="e.g., All Rights Reserved, Creative Commons BY-SA, etc."
                    rows={3}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("files")}
                  className="flex-1"
                >
                  <IconChevronLeft className="mr-2 size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep("review")}
                  disabled={!canProceedToReview}
                  className="flex-1"
                >
                  Next: Review
                  <IconChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </TabsContent>

            {/* REVIEW TAB */}
            <TabsContent value="review" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Track</CardTitle>
                  <CardDescription>
                    Check all details before uploading
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    {thumbnailPreview && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={thumbnailPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-xl">{formData.title}</h3>
                      <p className="text-muted-foreground">{formData.artist}</p>
                      {formData.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.genre.map((genre) => (
                            <Badge key={genre} variant="secondary">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Visibility
                      </p>
                      <Badge variant="outline">
                        {formData.visibility === "PUBLIC" && (
                          <Globe className="size-3 mr-1" />
                        )}
                        {formData.visibility === "PRIVATE" && (
                          <Lock className="size-3 mr-1" />
                        )}
                        {formData.visibility}
                      </Badge>
                    </div>
                    {formData.released && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Release Date
                        </p>
                        <p className="font-medium">
                          {new Date(formData.released).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {formData.licensed && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">
                        License
                      </p>
                      <p className="text-sm">{formData.licensed}</p>
                    </div>
                  )}

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("details")}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <IconChevronLeft className="mr-2 size-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !formData.title ||
                    !formData.artist ||
                    (!editingMusic && !formData.audioFile) ||
                    isUploading
                  }
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <IconLoader className="mr-2 size-4 animate-spin" />
                      {uploadProgress < 100
                        ? `Uploading ${uploadProgress}%`
                        : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 size-4" />
                      {editingMusic ? "Update Track" : "Upload Track"}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Enhanced Music Player Widget - Improved Layout
function MusicPlayerWidget({
  music,
  isPlaying,
  onPlayPause,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  audioElement,
}: {
  music: z.infer<typeof musicSchema>;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  audioElement: HTMLAudioElement | null;
}) {
  // Guard clause for null music
  if (!music) return null;

  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(music.duration || 0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [showVolume, setShowVolume] = React.useState(false);

  React.useEffect(() => {
    if (!audioElement) return;

    const updateTime = () => setCurrentTime(audioElement.currentTime);
    const updateDuration = () =>
      setDuration(audioElement.duration || music.duration || 0);

    audioElement.addEventListener("timeupdate", updateTime);
    audioElement.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audioElement.removeEventListener("timeupdate", updateTime);
      audioElement.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioElement, music.duration]);

  React.useEffect(() => {
    if (!audioElement) return;
    if (audioElement.src !== music.audioUrl) {
      audioElement.src = music.audioUrl;
      audioElement.load();
      if (isPlaying) {
        audioElement.play().catch(console.error);
      }
    }
  }, [music.audioUrl, audioElement, isPlaying]);

  React.useEffect(() => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.play().catch(console.error);
    } else {
      audioElement.pause();
    }
  }, [isPlaying, audioElement]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const seekPosition = (e.clientX - rect.left) / rect.width;
    const seekTime = seekPosition * duration;
    audioElement.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    if (!audioElement) return;
    if (isMuted) {
      audioElement.volume = volume;
      setIsMuted(false);
    } else {
      audioElement.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = ([newVolume]: number[]) => {
    setVolume(newVolume);
    if (audioElement) {
      audioElement.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[480px] z-50 shadow-2xl border-2 backdrop-blur-sm bg-background/95">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            <CardTitle className="text-sm font-semibold">Now Playing</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={onClose}
          >
            <IconX className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Album Art & Info */}
        <div className="flex items-center gap-4">
          <Avatar className="size-20 rounded-lg shadow-md">
            <AvatarImage
              src={music.thumbnailUrl}
              alt={music.title}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
              <Music className="size-10 text-primary" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg truncate leading-tight mb-1">
              {music.title}
            </h4>
            <p className="text-sm text-muted-foreground truncate">
              {music.artist}
            </p>
            {music.genre && music.genre.length > 0 && (
              <div className="flex gap-1 mt-2">
                {music.genre.slice(0, 2).map((genre, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs px-2 py-0"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="h-2 bg-muted rounded-full overflow-hidden cursor-pointer group relative"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-150 relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls - Centered Layout */}
        <div className="flex items-center justify-between pt-2">
          {/* Left Side - Quick Actions */}
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 hover:bg-primary/10"
                  >
                    <Plus className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add to playlist</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 hover:bg-primary/10"
                  >
                    <Download className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Center - Playback Controls */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    className="size-10 hover:bg-primary/10 disabled:opacity-30"
                  >
                    <IconPlayerTrackPrev className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous track</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              size="icon"
              onClick={onPlayPause}
              className="size-14 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="size-6" fill="white" />
              ) : (
                <Play className="size-6 ml-0.5" fill="white" />
              )}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNext}
                    disabled={!hasNext}
                    className="size-10 hover:bg-primary/10 disabled:opacity-30"
                  >
                    <IconPlayerTrackNext className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next track</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Right Side - Volume & More */}
          <div className="flex relative items-center gap-3">
            {/* Volume Control */}
            <TooltipProvider>
              <Tooltip open={showVolume ? false : undefined}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                    className="size-9 hover:bg-primary/10 relative"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="size-5" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="size-5" />
                    ) : (
                      <Volume2 className="size-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Volume Slider Popover */}
            {showVolume && (
              <div
                className="absolute bottom-full right-8 mb-2 p-3 bg-popover border rounded-lg shadow-lg"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {Math.round(volume * 100)}%
                  </span>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.01}
                    orientation="vertical"
                    className="h-24"
                  />
                </div>
              </div>
            )}

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 hover:bg-primary/10"
                >
                  <MoreVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Share2 className="size-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Info className="size-4 mr-2" />
                  Track Info
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <IconLayoutGrid className="size-4 mr-2" />
                  Go to Album
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="size-4 mr-2" />
                  Go to Artist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MusicTable({
  music,
}: {
  music: z.infer<typeof musicSchema>[];
}) {
  const { music: musicData, reload: musicReload, loading } = useReduxMusic();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [data, setData] = React.useState<z.infer<typeof musicSchema>[]>(music);
  const [viewMode, setViewMode] = React.useState<"table" | "card">("card");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 12,
  });
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [genreFilter, setGenreFilter] = React.useState("all");
  const [visibilityFilter, setVisibilityFilter] = React.useState("all");
  const [currentlyPlaying, setCurrentlyPlaying] = React.useState<number | null>(
    null
  );
  const [currentTrack, setCurrentTrack] = React.useState<z.infer<
    typeof musicSchema
  > | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [showPlayer, setShowPlayer] = React.useState(false);
  const [editingMusic, setEditingMusic] = React.useState<z.infer<
    typeof musicSchema
  > | null>(null);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  React.useEffect(() => {
    setData(music);
  }, [music]);

  React.useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  React.useMemo(() => {
    if (!musicData.length) {
      musicReload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataIds = React.useMemo(() => music.map((track) => track.id), [music]);

  const uniqueGenres = React.useMemo(() => {
    const genres = new Set<string>();
    data.forEach((track) => {
      track.genre?.forEach((g) => genres.add(g));
    });
    return Array.from(genres).sort();
  }, [data]);

  const filteredData = React.useMemo(() => {
    let filtered = data;

    if (globalFilter) {
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
          track.artist.toLowerCase().includes(globalFilter.toLowerCase()) ||
          track.genre?.some((g) =>
            g.toLowerCase().includes(globalFilter.toLowerCase())
          )
      );
    }

    if (genreFilter !== "all") {
      filtered = filtered.filter((track) => track.genre?.includes(genreFilter));
    }

    if (visibilityFilter !== "all") {
      filtered = filtered.filter(
        (track) => track.visibility === visibilityFilter.toUpperCase()
      );
    }

    return filtered;
  }, [data, globalFilter, genreFilter, visibilityFilter]);

  const handleDeleteMusic = React.useCallback((musicId: number) => {
    setData((prev) => prev.filter((track) => track.id !== musicId));
  }, []);

  const handlePlayPause = React.useCallback(
    (musicId: number) => {
      const track = data.find((t) => t.id === musicId);
      if (track) {
        if (currentlyPlaying === musicId) {
          setIsPlaying(false);
          setCurrentlyPlaying(null);
        } else {
          setCurrentTrack(track);
          setCurrentlyPlaying(musicId);
          setIsPlaying(true);
          setShowPlayer(true);
        }
      }
    },
    [data, currentlyPlaying]
  );

  const hasNext = React.useMemo(() => {
    if (!currentTrack) return false;
    const currentIndex = filteredData.findIndex(
      (track) => track.id === currentTrack.id
    );
    return currentIndex < filteredData.length - 1;
  }, [currentTrack, filteredData]);

  const hasPrevious = React.useMemo(() => {
    if (!currentTrack) return false;
    const currentIndex = filteredData.findIndex(
      (track) => track.id === currentTrack.id
    );
    return currentIndex > 0;
  }, [currentTrack, filteredData]);

  const handleNext = React.useCallback(() => {
    if (!currentTrack || !hasNext) return;
    const currentIndex = filteredData.findIndex(
      (track) => track.id === currentTrack.id
    );
    if (currentIndex < filteredData.length - 1) {
      const nextTrack = filteredData[currentIndex + 1];
      setCurrentTrack(nextTrack);
      setCurrentlyPlaying(nextTrack.id);
      setIsPlaying(true);
    }
  }, [currentTrack, filteredData, hasNext]);

  const handlePrevious = React.useCallback(() => {
    if (!currentTrack || !hasPrevious) return;
    const currentIndex = filteredData.findIndex(
      (track) => track.id === currentTrack.id
    );
    if (currentIndex > 0) {
      const previousTrack = filteredData[currentIndex - 1];
      setCurrentTrack(previousTrack);
      setCurrentlyPlaying(previousTrack.id);
      setIsPlaying(true);
    }
  }, [currentTrack, filteredData, hasPrevious]);

  const handleUploadSuccess = React.useCallback(
    (newTrack: z.infer<typeof musicSchema>) => {
      setData((prev) => {
        const existingIndex = prev.findIndex((t) => t.id === newTrack.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newTrack;
          return updated;
        }
        return [newTrack, ...prev];
      });
    },
    []
  );

  const columns = React.useMemo<ColumnDef<z.infer<typeof musicSchema>>[]>(
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
        id: "track",
        header: "Track",
        cell: ({ row }) => (
          <TableCellPlayer
            music={row.original}
            onPlayPause={handlePlayPause}
            onEdit={setEditingMusic}
            isPlaying={currentlyPlaying === row.original.id}
          />
        ),
        enableHiding: false,
        size: 300,
      },
      {
        accessorKey: "artist",
        header: "Artist",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.artist}</span>
        ),
      },
      {
        accessorKey: "genre",
        header: "Genre",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.genre?.slice(0, 2).map((genre, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
            {(row.original.genre?.length || 0) > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(row.original.genre?.length || 0) - 2}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {formatDuration(row.original.duration)}
          </span>
        ),
      },
      {
        accessorKey: "plays",
        header: "Plays",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Volume2 className="size-3 text-muted-foreground" />
            <span>{formatPlays(row.original.plays)}</span>
          </div>
        ),
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.visibility === "PUBLIC" ? (
              <Globe className="size-3 mr-1" />
            ) : (
              <Lock className="size-3 mr-1" />
            )}
            {row.original.visibility.toLowerCase()}
          </Badge>
        ),
      },
      {
        accessorKey: "released",
        header: "Released",
        cell: ({ row }) => {
          if (!row.original.released)
            return <span className="text-muted-foreground">-</span>;
          const date = new Date(row.original.released);
          return (
            <span className="text-sm">
              {date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
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
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => handlePlayPause(row.original.id)}
              >
                <Play className="size-4 mr-2" />
                {currentlyPlaying === row.original.id ? "Pause" : "Play"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingMusic(row.original)}>
                <IconDotsVertical className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="size-4 mr-2" />
                Add to Playlist
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteMusicDialog
                music={row.original}
                onDelete={handleDeleteMusic}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [handleDeleteMusic, handlePlayPause, currentlyPlaying]
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

  const clearFilters = () => {
    setGlobalFilter("");
    setGenreFilter("all");
    setVisibilityFilter("all");
  };

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
          <UploadMusicDrawer
            onUploadSuccess={handleUploadSuccess}
            music={editingMusic}
            onClose={() => setEditingMusic(null)}
            open={!!editingMusic}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks, artists, genres..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-10"
            />
            {globalFilter && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 size-6"
                onClick={() => setGlobalFilter("")}
              >
                <IconX className="size-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-40">
                <Music className="size-4 mr-1" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {uniqueGenres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={visibilityFilter}
              onValueChange={setVisibilityFilter}
            >
              <SelectTrigger className="w-32">
                <Eye className="size-4 mr-1" />
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>

            {(globalFilter ||
              genreFilter !== "all" ||
              visibilityFilter !== "all") && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <IconX className="size-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {(globalFilter ||
          genreFilter !== "all" ||
          visibilityFilter !== "all") && (
          <div className="flex flex-wrap gap-2">
            {globalFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {globalFilter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setGlobalFilter("")}
                >
                  <IconX className="size-3" />
                </Button>
              </Badge>
            )}
            {genreFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Genre: {genreFilter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setGenreFilter("all")}
                >
                  <IconX className="size-3" />
                </Button>
              </Badge>
            )}
            {visibilityFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Visibility: {visibilityFilter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setVisibilityFilter("all")}
                >
                  <IconX className="size-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table View */}
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
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
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
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <IconLoader className="animate-spin size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Loading tracks...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-36 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Music className="size-12 text-muted-foreground opacity-50" />
                        <div>
                          <p className="font-semibold mb-1">No tracks found</p>
                          <p className="text-sm text-muted-foreground">
                            {globalFilter ||
                            genreFilter !== "all" ||
                            visibilityFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Upload your first track to get started"}
                          </p>
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
            {table.getFilteredRowModel().rows.length} track(s) selected
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Tracks per page
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
            <IconLoader className="animate-spin size-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading tracks...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid gap-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {filteredData.map((track) => (
              
                <MusicCard
                  key={track.id}
                  music={track}
                  isPlaying={currentlyPlaying === track.id}
                  onPlayPause={handlePlayPause}
                  onEdit={setEditingMusic}
                />
              
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-6">
              <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="size-12 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-10 rounded-full bg-background border-2 flex items-center justify-center">
                <Plus className="size-5 text-muted-foreground" />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2">
              {globalFilter ||
              genreFilter !== "all" ||
              visibilityFilter !== "all"
                ? "No tracks found"
                : "Your music library is empty"}
            </h3>

            <p className="text-muted-foreground mb-6 max-w-sm">
              {globalFilter ||
              genreFilter !== "all" ||
              visibilityFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "Start building your collection by uploading your first track"}
            </p>

            <div className="flex items-center gap-3">
              {(globalFilter ||
                genreFilter !== "all" ||
                visibilityFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  <IconX className="size-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <UploadMusicDrawer
                onUploadSuccess={handleUploadSuccess}
                music={null}
                showTrigger={true}
              />
            </div>
          </div>
        )}
      </TabsContent>

      {showPlayer && currentTrack && (
        <MusicPlayerWidget
          music={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={() => handlePlayPause(currentTrack.id)}
          onClose={() => {
            setShowPlayer(false);
            setIsPlaying(false);
            setCurrentlyPlaying(null);
          }}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          audioElement={audioRef.current}
        />
      )}
    </Tabs>
  );
}
