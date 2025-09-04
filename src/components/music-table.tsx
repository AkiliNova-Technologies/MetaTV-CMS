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
  //   IconAlertCircle,
  IconSearch,
  //   IconFilter,
  IconX,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
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
import { Card, CardContent } from "@/components/ui/card";
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
  Globe,
  Lock,
  MoreVertical,
  Play,
  Pause,
  Music,
  Eye,
  Volume2,
  Disc3,
  Upload,
  Calendar,
  Tag,
  ImageIcon,
  FileAudio,
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

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
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
  const [isImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  const handlePlayClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onPlayPause(music.id);
  };

  return (
    <Card className="flex items-start flex-row w-full h-[90px] px-2 py-2 bg-gradient-to-r from-background to-muted/20 hover:shadow-md border-muted/40 hover:border-primary/20 transition">
      {/* Cover Image */}
      <div
        className="relative flex-shrink-0 w-[70px] h-[70px] rounded-md overflow-hidden bg-muted cursor-pointer group"
        onClick={handlePlayClick}
      >
        {!music.thumbnailUrl || imageError || isImageLoading ? (
          <div className="flex items-center justify-center w-full h-full bg-muted/50">
            <Disc3 className="size-8 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={music.thumbnailUrl}
            alt={`${music.title} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImageError(true)}
          />
        )}

        {/* Play / Pause Overlay */}
        <div className="absolute h-full inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="icon"
            className="bg-primary hover:bg-primary/90 rounded-full shadow-lg"
            onClick={handlePlayClick}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 ml-[1px]" />
            )}
          </Button>
        </div>
      </div>

      {/* Title + Artist + Menu */}
      <CardContent className="flex flex-1 items-center justify-between ml-0 pl-0 h-full">
        <div
          className="flex flex-col overflow-hidden cursor-pointer gap-1"
          onClick={handlePlayClick}
        >
          <span className="font-semibold text-md truncate">{music.title}</span>
          <span className="text-xs text-muted-foreground truncate">
            {music.artist}
          </span>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPlayPause(music.id)}>
              {isPlaying ? "Pause" : "Play"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(music)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>Add to Playlist</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
  // const navigate = useNavigate();

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
        <div className="flex items-center justify-center w-[50px] h-[50px] bg-muted/50 rounded-md">
          {music.thumbnailUrl ? (
            // <img
            //   src={music.thumbnailUrl}
            //   alt={music.title}
            //   className="w-full h-full object-cover rounded-md"
            //   />
            <Disc3 className="size-8 text-muted-foreground" />
          ) : (
            <Disc3 className="size-8 text-muted-foreground" />
          )}
        </div>

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
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete music:", err);
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
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-semibold">
              "{music.title}" by {music.artist}
            </span>{" "}
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
              "Delete Track"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UploadMusicDrawer({
  onUploadSuccess,
  music: editingMusic,
  onClose,
  open,
}: {
  onUploadSuccess: (newTrack: z.infer<typeof musicSchema>) => void;
  music?: z.infer<typeof musicSchema> | null;
  onClose?: () => void;
  open?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: editingMusic?.title || "",
    artist: editingMusic?.artist || "",
    audioFile: null as File | null,
    thumbnailFile: null as File | null,
    genre: editingMusic?.genre || ([] as string[]),
    visibility:
      editingMusic?.visibility ||
      ("PUBLIC" as "PUBLIC" | "PRIVATE" | "UNLISTED"),
    released: editingMusic?.released || "",
    licensed: editingMusic?.licensed || "",
  });
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
        released: editingMusic.released || "",
        licensed: editingMusic.licensed || "",
      });
    }
  }, [editingMusic]);

  const handleFileChange = (
    field: "audioFile" | "thumbnailFile",
    file: File | null
  ) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.artist || !formData.audioFile) return;

    setIsUploading(true);
    try {
      // Simulate API call
      const mockTrack: z.infer<typeof musicSchema> = {
        id: Date.now(),
        title: formData.title,
        artist: formData.artist,
        audioUrl: URL.createObjectURL(formData.audioFile),
        thumbnailUrl: formData.thumbnailFile
          ? URL.createObjectURL(formData.thumbnailFile)
          : "",
        duration: 180, // Mock duration
        plays: 0,
        genre: formData.genre,
        visibility: formData.visibility,
        released: formData.released || null,
        licensed: formData.licensed || "All Rights Reserved",
        createdAt: new Date().toISOString(),
        uploadedBy: {
          id: 1,
          name: "Current User",
        },
        likes: [],
      };

      onUploadSuccess(mockTrack);
      setIsOpen(false);
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
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
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
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Upload Track</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            {editingMusic ? "Edit Track" : "Upload New Track"}
          </SheetTitle>
          <SheetDescription>
            Upload your music track with all the necessary details
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 text-sm">
          <form onSubmit={handleSubmit} className="space-y-6 mb-8 ">
            {/* Audio File Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileAudio className="size-4" />
                Audio File *
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${
                  dragOver.audio
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }
                ${formData.audioFile ? "border-green-500 bg-green-50" : ""}
              `}
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
                    handleFileChange("audioFile", e.target.files?.[0] || null)
                  }
                />
                {formData.audioFile ? (
                  <div className="text-sm text-green-600">
                    ✓ {formData.audioFile.name}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Drag & drop audio file here or click to browse
                    <div className="text-xs mt-1">Supports MP3, WAV, FLAC</div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="size-4" />
                Cover Image
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${
                  dragOver.thumbnail
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }
                ${formData.thumbnailFile ? "border-green-500 bg-green-50" : ""}
              `}
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
                {formData.thumbnailFile ? (
                  <div className="text-sm text-green-600">
                    ✓ {formData.thumbnailFile.name}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Drag & drop image here or click to browse
                    <div className="text-xs mt-1">JPG, PNG, WebP</div>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Track Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter track title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist *</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) => handleInputChange("artist", e.target.value)}
                  placeholder="Enter artist name"
                  required
                />
              </div>
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="size-4" />
                Genres
              </Label>
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
                <SelectContent
                  className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-72 overflow-auto min-w-[16rem]"
                  style={{ minWidth: "16rem" }}
                >
                  {[
                    "Pop",
                    "Rock",
                    "Hip-Hop",
                    "Rap",
                    "Electronic",
                    "Dance",
                    "R&B",
                    "Soul",
                    "Jazz",
                    "Blues",
                    "Classical",
                    "Country",
                    "Folk",
                    "Reggae",
                    "Metal",
                    "Punk",
                    "Indie",
                    "Alternative",
                    "Latin",
                    "K-Pop",
                    "Soundtrack",
                    "Other",
                  ].map((genre) => (
                    <SelectItem
                      key={genre}
                      value={genre}
                      className="col-span-1 whitespace-nowrap"
                    >
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.genre.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
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
                        className="size-4 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeGenre(genre)}
                      >
                        <IconX className="size-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Visibility & Release Date */}
            <div className="flex gap-3">
              {/* Visibility */}
              <div className="flex-1 space-y-2">
                <Label className="flex items-center gap-2">
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

              {/* Release Date */}
              <div className="flex-1 space-y-2">
                <Label htmlFor="released" className="flex items-center gap-2">
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
            </div>

            {/* License */}
            <div className="space-y-2">
              <Label htmlFor="licensed">License</Label>
              <Textarea
                id="licensed"
                value={formData.licensed}
                onChange={(e) => handleInputChange("licensed", e.target.value)}
                placeholder="License information (e.g., All Rights Reserved, Creative Commons, etc.)"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  !formData.title ||
                  !formData.artist ||
                  !formData.audioFile ||
                  isUploading
                }
              >
                {isUploading ? (
                  <>
                    <IconLoader className="mr-2 size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 size-4" />
                    Upload Track
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

function MusicPlayerWidget({
  music,
  isPlaying,
  onPlayPause,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: {
  music: z.infer<typeof musicSchema>;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-100 bg-background border rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Now Playing</h4>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <IconX className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md overflow-hidden">
          {music.thumbnailUrl ? (
            // <img
            //   src={music.thumbnailUrl}
            //   alt={music.title}
            //   className="w-full h-full object-cover"
            // />
            <Disc3 className="w-full h-full text-muted-foreground p-2" />
          ) : (
            <Disc3 className="w-full h-full text-muted-foreground p-2" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{music.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {music.artist}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={!hasPrevious ? "opacity-50" : ""}
          >
            <IconPlayerTrackPrev className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onPlayPause}>
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next"
            onClick={onNext}
            disabled={!hasNext}
            className={!hasNext ? "opacity-50" : ""}
          >
            <IconPlayerTrackNext className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">0:00</span>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: "0%" }}></div>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDuration(music.duration)}
        </span>
      </div>
    </div>
  );
}

export function MusicTable({
  music,
}: {
  music: z.infer<typeof musicSchema>[];
}) {
  const navigate = useNavigate();
  const [data, setData] = React.useState<z.infer<typeof musicSchema>[]>(music);
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
  const [loading] = React.useState(false);
  // const { loading } = useReduxMusic();

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

  const dataIds = React.useMemo(() => music.map((track) => track.id), [music]);

  // Get unique genres for filter
  const uniqueGenres = React.useMemo(() => {
    const genres = new Set<string>();
    data.forEach((track) => {
      track.genre?.forEach((g) => genres.add(g));
    });
    return Array.from(genres).sort();
  }, [data]);

  // Filter data based on filters
  const filteredData = React.useMemo(() => {
    let filtered = data;

    // Global search filter
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

    // Genre filter
    if (genreFilter !== "all") {
      filtered = filtered.filter((track) => track.genre?.includes(genreFilter));
    }

    // Visibility filter
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
          // Pause if already playing
          setIsPlaying(false);
          setCurrentlyPlaying(null);
        } else {
          // Play new track or resume
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
      setData((prev) => [newTrack, ...prev]);
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
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => handlePlayPause(row.original.id)}
              >
                {currentlyPlaying === row.original.id ? "Pause" : "Play"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingMusic(row.original)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Add to Playlist</DropdownMenuItem>
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
        const newData = arrayMove(data, oldIndex, newIndex);
        // Optional: Save new order to backend
        // api.put('/music/order', { order: newData.map(track => track.id) });
        return newData;
      });
    }
  }

  const handleViewModeSelect = (value: string) => {
    if (value === "table" || value === "card") {
      setViewMode(value);
    }
  };

  const clearFilters = () => {
    setGlobalFilter("");
    setGenreFilter("all");
    setVisibilityFilter("all");
  };

  return (
    <Tabs
      defaultValue="table"
      className="w-full flex-col justify-start gap-6"
      value={viewMode}
      onValueChange={(value) => setViewMode(value as "table" | "card")}
    >
      {/* Header with View Toggle and Actions */}
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
          <UploadMusicDrawer
            onUploadSuccess={handleUploadSuccess}
            music={editingMusic}
            onClose={() => setEditingMusic(null)}
            open={!!editingMusic}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Input */}
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

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            {/* Genre Filter */}
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-46">
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

            {/* Visibility Filter */}
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

            {/* Clear Filters */}
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

        {/* Active Filters Display */}
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

      {loading && (
        <div className="flex items-center justify-center h-32 mx-4 lg:mx-6">
          <IconLoader className="animate-spin size-8 text-muted-foreground" />
        </div>
      )}

      {!loading && (
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
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Music className="size-12 text-muted-foreground/50" />
                            <span>No tracks found.</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-sm text-primary hover:underline"
                              >
                                Clear filters
                              </Button>
                              <span className="text-muted-foreground">or</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate("/dashboard/music/upload")
                                }
                                className="text-sm text-primary hover:underline"
                              >
                                Upload your first track
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

            {/* Table Pagination */}
            <div className="flex items-center justify-between px-4">
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} track(s) selected.
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label
                    htmlFor="rows-per-page"
                    className="text-sm font-medium"
                  >
                    Tracks per page
                  </Label>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => table.setPageSize(Number(value))}
                  >
                    <SelectTrigger
                      size="sm"
                      className="w-20"
                      id="rows-per-page"
                    >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
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
            {filteredData.length === 0 && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center space-y-4">
                  <Music className="size-16 mx-auto text-muted-foreground/50" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No tracks found</h3>
                    <p className="text-sm">
                      {globalFilter ||
                      genreFilter !== "all" ||
                      visibilityFilter !== "all"
                        ? "Try adjusting your filters or search terms"
                        : "Start by uploading your first track"}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {(globalFilter ||
                      genreFilter !== "all" ||
                      visibilityFilter !== "all") && (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    )}

                    <UploadMusicDrawer
                      onUploadSuccess={handleUploadSuccess}
                      music={editingMusic}
                      onClose={() => setEditingMusic(null)}
                      open={!!editingMusic}
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </>
      )}

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
        />
      )}
    </Tabs>
  );
}
