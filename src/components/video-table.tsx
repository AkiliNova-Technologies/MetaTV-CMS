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
} from "lucide-react";
import type { videoSchema } from "@/constants/Schemas";
import { useReduxVideos } from "@/hooks/useReduxVideos";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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

function VideoCard({ video }: { video: z.infer<typeof videoSchema> }) {
  const navigate = useNavigate();
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);
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

  const handleRetryImage = () => {
    setImageError(false);
    setIsImageLoading(true);
  };

  return (
    <Card
      className="w-full max-w-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 pt-0"
      aria-label={`Video card for ${video.title}`}
    >
      {/* Thumbnail Section */}
      <div className="relative group cursor-pointer" onClick={handleWatchClick}>
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
          <img
            src={video.thumbnailUrl || "/default-thumbnail.jpg"}
            alt={`Thumbnail for ${video.title}`}
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
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              size="icon"
              className="bg-white/90 hover:bg-white text-black rounded-full"
              aria-label="Play video"
            >
              <Play className="size-5 ml-0.5" />
            </Button>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5"
        >
          <Clock className="size-3 mr-1" />
          {formatDuration(video.duration)}
        </Badge>
        <Badge
          variant="outline"
          className="absolute top-2 left-2 bg-white/90 text-black text-xs px-1.5 py-0.5"
        >
          {video.resolution || "Unknown"}
        </Badge>
      </div>

      <CardHeader className="px-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="size-3" />
            <span>{formatViews(video.views)} views</span>
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
                    onClick={handleWatchClick}
                  >
                    {video.title}
                  </h2>
                </TooltipTrigger>
                <TooltipContent>{video.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {video.program && (
              <p className="text-xs text-muted-foreground mt-1">
                Program: {video.program.name}
              </p>
            )}
            {video.category && (
              <p className="text-xs text-muted-foreground mt-1">
                Category: {video.category}
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
              <DropdownMenuItem onClick={handleWatchClick}>
                Watch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/dashboard/videos/edit-video/${video.id}`)
                }
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteVideoDialog video={video} onDelete={() => {}} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-1.5 px-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
              {video.isApproved ? (
                <CheckCircle className="size-3 text-green-500 mr-1" />
              ) : (
                <XCircle className="size-3 text-orange-500 mr-1" />
              )}
              {video.isApproved ? "Approved" : "Pending"}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {video.visibility === "PUBLIC" ? (
              <Globe className="size-3 mr-1" />
            ) : (
              <Lock className="size-3 mr-1" />
            )}
            {video.visibility.toLowerCase()}
          </Badge>
        </div>
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5"
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
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{video.format || "Unknown"}</span>
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
    <Button
      variant="link"
      className="text-foreground w-fit px-0 text-left"
      onClick={handleWatchClick}
    >
      {video.title}
    </Button>
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
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete video:", err);
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
            This action cannot be undone. This will permanently delete the video{" "}
            <span className="font-semibold">{video.title}</span> from the
            database.
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
              "Delete Video"
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
        cell: ({ row }) => (
          <TableCellViewer
            video={row.original}
            onUpdateVideo={handleUpdateVideo}
          />
        ),
        enableHiding: false,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => formatDuration(row.original.duration),
      },
      {
        accessorKey: "resolution",
        header: "Resolution",
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
        accessorKey: "isApproved",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isApproved ? "default" : "secondary"}>
            {row.original.isApproved ? "Approved" : "Pending"}
          </Badge>
        ),
      },
      {
        accessorKey: "views",
        header: "Views",
        cell: ({ row }) => formatViews(row.original.views),
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="w-full text-left">Created At</div>,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          if (!row.original.createdAt) {
            return <Label>dd/mm/yyyy</Label>;
          }
          const formatted = date.toLocaleString(undefined, {
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
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/dashboard/videos/edit-video/${row.original.id}`)
                }
              >
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
        const newData = arrayMove(data, oldIndex, newIndex);
        // Optional: Save new order to backend
        // api.put('/videos/order', { order: newData.map(video => video.id) });
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/videos/create-video")}
          >
            <IconPlus />
            <span className="hidden lg:inline">Add New Video</span>
          </Button>
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
                          <span>No videos found.</span>
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
            {data.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          {data.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No videos found.
            </div>
          )}
        </TabsContent>
      </>
    </Tabs>
  );
}
