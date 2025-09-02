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
} from "lucide-react";
import type { musicSchema } from "@/constants/Schemas";

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
}: {
  music: z.infer<typeof musicSchema>;
  isPlaying: boolean;
  onPlayPause: (musicId: number) => void;
}) {
  const navigate = useNavigate();
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
            <DropdownMenuItem
              onClick={() => navigate(`/dashboard/music/edit/${music.id}`)}
            >
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

function TableCellPlayer({ music }: { music: z.infer<typeof musicSchema> }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const navigate = useNavigate();

  const handlePlayClick = () => {
    setIsPlaying(!isPlaying);
    // Add actual play logic here
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
      <div className="flex items-center gap-3">
        
          <div className="flex items-center justify-center w-[50px] h-[50px] bg-muted/50 rounded-md">
            <Disc3 className="size-8 text-muted-foreground" />
          </div>
        
        <div className="min-w-0">
          <Button
            variant="link"
            className="text-foreground p-0 h-auto font-medium text-left justify-start hover:text-primary"
            onClick={() => navigate(`/dashboard/music/${music.id}`)}
          >
            {music.title}
          </Button>
          <p className="text-sm text-muted-foreground truncate">
            {music.artist}
          </p>
        </div>
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
  const [loading] = React.useState(false);

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

  const handlePlayPause = React.useCallback((musicId: number) => {
    setCurrentlyPlaying((prev) => (prev === musicId ? null : musicId));
  }, []);

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
        cell: ({ row }) => <TableCellPlayer music={row.original} />,
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
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/dashboard/music/edit/${row.original.id}`)
                }
              >
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
    [handleDeleteMusic, handlePlayPause, currentlyPlaying, navigate]
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/music/upload")}
          >
            <IconPlus />
            <span className="hidden lg:inline">Upload Track</span>
          </Button>
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
                    <Button
                      onClick={() => navigate("/dashboard/music/upload")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <IconPlus className="size-4 mr-2" />
                      Upload Track
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}
