// components/video-table-improved.tsx
// Drop-in replacement for your current video-table component
// This version has better image handling, loading states, and error recovery

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
  IconAlertCircle,
  // IconRefresh,
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
  Image as ImageIcon,
} from "lucide-react";
import type { videoSchema } from "@/constants/Schemas";
import { useReduxVideos } from "@/hooks/useReduxVideos";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { toast } from "sonner";

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

function formatFileSize(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
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

function DraggableRow({ row }: { row: Row<z.infer<typeof videoSchema>> }) {
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

// Improved image component with better error handling
function OptimizedImage({ 
  src, 
  alt, 
  className,
  fallbackSrc = "/default-thumbnail.jpg"
}: { 
  src: string; 
  alt: string; 
  className?: string;
  fallbackSrc?: string;
}) {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    console.error(`Failed to load image: ${imgSrc}`);
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback if not already using it
    if (imgSrc !== fallbackSrc && retryCount === 0) {
      setImgSrc(fallbackSrc);
      setRetryCount(1);
      setHasError(false);
      setIsLoading(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // const handleRetry = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setHasError(false);
  //   setIsLoading(true);
  //   // Force reload by adding cache buster
  //   setImgSrc(`${src}?retry=${Date.now()}`);
  // };

  if (hasError && retryCount > 0) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted ${className}`}>
        <ImageIcon className="size-8 text-muted-foreground mb-2" />
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
          className="text-xs"
        >
          Retry
        </Button> */}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-muted ${className}`}>
          <IconLoader className="animate-spin size-6 text-muted-foreground" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        crossOrigin="anonymous"
      />
    </>
  );
}

function VideoCard({ video }: { video: z.infer<typeof videoSchema> }) {
  const navigate = useNavigate();
  const formattedDate = new Date(video.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const handleWatchClick = () => {
    navigate(`/dashboard/videos/watch-video/${video.id}`);
  };

  return (
    <Card className="group w-full overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all pt-0 duration-300">
      {/* Thumbnail Section */}
      <div className="relative cursor-pointer overflow-hidden" onClick={handleWatchClick}>
        <div className="aspect-video bg-muted relative">
          <OptimizedImage
            src={video.thumbnailUrl || "/default-thumbnail.jpg"}
            alt={`Thumbnail for ${video.title}`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="rounded-full bg-white/90 p-4 scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="size-6 text-black fill-black" />
            </div>
          </div>

          {/* Duration badge */}
          <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 backdrop-blur-sm">
            <Clock className="size-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>

          {/* Resolution badge */}
          <Badge className="absolute top-2 left-2 bg-white/90 text-black text-xs px-2 py-1 backdrop-blur-sm font-semibold">
            {video.resolution || "HD"}
          </Badge>

          {/* Status indicator */}
          {!video.isApproved && (
            <Badge className="absolute top-2 right-2 bg-orange-500/90 text-white text-xs px-2 py-1 backdrop-blur-sm">
              Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="space-y-3">
        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="size-3" />
            <span>{formatViews(video.views)} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Title and actions */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    className="font-semibold text-base leading-snug line-clamp-2 hover:text-primary cursor-pointer transition-colors"
                    onClick={handleWatchClick}
                  >
                    {video.title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {video.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Program info */}
            {video.program && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="font-medium">{video.program.name}</span>
              </p>
            )}
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleWatchClick}>
                <Play className="size-4 mr-2" />
                Watch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/dashboard/videos/edit-video/${video.id}`)
                }
              >
                <IconDotsVertical className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteVideoDialog video={video} onDelete={() => {}} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Footer */}
      <CardContent className="space-y-3 border-t pt-4">
        {/* Status and visibility */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={video.isApproved ? "default" : "secondary"}
            className="text-xs"
          >
            {video.isApproved ? (
              <>
                <CheckCircle className="size-3 mr-1" />
                Approved
              </>
            ) : (
              <>
                <XCircle className="size-3 mr-1" />
                Pending
              </>
            )}
          </Badge>
          
          <Badge variant="outline" className="text-xs">
            {video.visibility === "PUBLIC" ? (
              <Globe className="size-3 mr-1" />
            ) : (
              <Lock className="size-3 mr-1" />
            )}
            {video.visibility.toLowerCase()}
          </Badge>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {video.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 font-normal"
              >
                {tag}
              </Badge>
            ))}
            {video.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 text-muted-foreground"
              >
                +{video.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* File info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span className="font-medium uppercase">{video.format || "MP4"}</span>
          {video.size && <span>{formatFileSize(video.size)}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

type VideoFormData = {
  title: string;
  description?: string;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  tags: string[];
  isApproved: boolean;
  programId?: number;
  thumbnailUrl: string;
};

function TableCellViewer({
  video,
}: {
  video: z.infer<typeof videoSchema>;
  onUpdateVideo: (video: VideoFormData & { id: number }) => void;
}) {
  const navigate = useNavigate();

  const handleWatchClick = () => {
    navigate(`/dashboard/videos/watch-video/${video.id}`);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mini thumbnail */}
      <div className="relative size-16 rounded overflow-hidden flex-shrink-0 bg-muted">
        <OptimizedImage
          src={video.thumbnailUrl || "/default-thumbnail.jpg"}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      </div>
      <Button
        variant="link"
        className="text-foreground px-0 text-left font-medium hover:text-primary"
        onClick={handleWatchClick}
      >
        {video.title}
      </Button>
    </div>
  );
}

function DeleteVideoDialog({
  video,
  onDelete,
}: {
  video: z.infer<typeof videoSchema>;
  onDelete: (videoId: number) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { reload: videosReload } = useReduxVideos();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/videos/${video.id}`);
      onDelete(video.id);
      await videosReload();
      toast.success("Video deleted successfully");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete video:", err);
      toast.error("Failed to delete video");
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
          <XCircle className="size-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <IconAlertCircle className="size-5 text-red-600" />
            </div>
            Delete Video?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            Are you sure you want to delete <span className="font-semibold">"{video.title}"</span>? 
            This action cannot be undone.
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
                <XCircle className="mr-2 h-4 w-4" />
                Delete Video
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function VideoTable({
  videos,
}: {
  videos: z.infer<typeof videoSchema>[];
}) {
  const navigate = useNavigate();
  const { videos: videoData, reload: videosReload, loading } = useReduxVideos();
  const [data, setData] = React.useState<z.infer<typeof videoSchema>[]>(videos);
  const [viewMode, setViewMode] = React.useState<"table" | "card">("card"); // Default to card view
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 12, // Better for card view
  });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  React.useEffect(() => {
    setData(videos);
  }, [videos]);

  React.useMemo(() => {
    if (!videoData.length) {
      videosReload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataIds = React.useMemo(
    () => videos.map((video) => video.id),
    [videos]
  );

  const handleDeleteVideo = React.useCallback((videoId: number) => {
    setData((prev) => prev.filter((video) => video.id !== videoId));
  }, []);

  const handleUpdateVideo = React.useCallback(
    (updatedVideo: VideoFormData & { id: number }) => {
      setData((prev) =>
        prev.map((video) =>
          video.id === updatedVideo.id ? { ...video, ...updatedVideo } : video
        )
      );
    },
    []
  );

  const columns = React.useMemo<ColumnDef<z.infer<typeof videoSchema>>[]>(
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
        header: "Video",
        cell: ({ row }) => (
          <TableCellViewer
            video={row.original}
            onUpdateVideo={handleUpdateVideo}
          />
        ),
        enableHiding: false,
        size: 350,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (
          <span className="text-sm">{formatDuration(row.original.duration)}</span>
        ),
        size: 100,
      },
      {
        accessorKey: "resolution",
        header: "Quality",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-medium">
            {row.original.resolution || "HD"}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "visibility",
        header: "Visibility",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.visibility === "PUBLIC" && <Globe className="size-3 mr-1" />}
            {row.original.visibility === "PRIVATE" && <Lock className="size-3 mr-1" />}
            {row.original.visibility.toLowerCase()}
          </Badge>
        ),
        size: 120,
      },
      {
        accessorKey: "isApproved",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isApproved ? "default" : "secondary"}>
            {row.original.isApproved ? (
              <>
                <CheckCircle className="size-3 mr-1" />
                Approved
              </>
            ) : (
              <>
                <XCircle className="size-3 mr-1" />
                Pending
              </>
            )}
          </Badge>
        ),
        size: 120,
      },
      {
        accessorKey: "views",
        header: "Views",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Eye className="size-3 text-muted-foreground" />
            <span className="text-sm">{formatViews(row.original.views)}</span>
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "createdAt",
        header: "Uploaded",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          const formatted = date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return <span className="text-sm text-muted-foreground">{formatted}</span>;
        },
        size: 120,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground size-8"
                size="icon"
              >
                <IconDotsVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/dashboard/videos/watch-video/${row.original.id}`)
                }
              >
                <Play className="size-4 mr-2" />
                Watch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/dashboard/videos/edit-video/${row.original.id}`)
                }
              >
                <IconDotsVertical className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteVideoDialog
                video={row.original}
                onDelete={handleDeleteVideo}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 60,
      },
    ],
    [handleUpdateVideo, handleDeleteVideo, navigate]
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
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue="card"
      className="w-full flex-col justify-start gap-6"
      value={viewMode}
      onValueChange={(value) => setViewMode(value as "table" | "card")}
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Select
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "table" | "card")}
        >
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
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/dashboard/videos/create-video")}
            className="gap-2"
          >
            <IconPlus className="size-4" />
            <span className="hidden lg:inline">Add Video</span>
            <span className="lg:hidden">Add</span>
          </Button>
        </div>
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
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <IconLoader className="animate-spin size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading videos...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <IconLayoutGrid className="size-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No videos found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/dashboard/videos/create-video")}
                        >
                          <IconPlus className="size-4 mr-2" />
                          Upload Your First Video
                        </Button>
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
            {table.getFilteredRowModel().rows.length} row(s) selected
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
                <IconChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronsRight className="size-4" />
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
            <p className="text-sm text-muted-foreground">Loading videos...</p>
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
            
            {/* Card view pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronLeft className="size-4" />
              </Button>
              <span className="text-sm px-4">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
            <IconLayoutGrid className="size-16 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first video to get started
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/videos/create-video")}
              size="lg"
            >
              <IconPlus className="size-4 mr-2" />
              Upload Video
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}