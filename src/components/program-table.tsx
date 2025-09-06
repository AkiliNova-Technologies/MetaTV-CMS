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
  // type UniqueIdentifier,
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
  IconPlus,
  IconTable,
  IconLayoutGrid,
  IconAlertCircle,
  IconVideo,
  IconUsers,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { programSchema } from "@/constants/Schemas";
import api from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
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
} from "./ui/alert-dialog"; // Import the program schema
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

// Define the Program type based on your model
type Program = z.infer<typeof programSchema> & {
  videos: { id: number }[];
  subscribers: { id: number }[];
};

// Drag Handle Component
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

// Draggable Row Component
function DraggableRow({ row }: { row: Row<Program> }) {
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

// Program Card Component
function ProgramCard({ program }: { program: Program }) {
  const date = new Date(program.createdAt);
  const formatted = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg border-1 flex items-center justify-center text-white font-semibold">
            {program.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-md">{program.name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-3 break-words">
          {program.description || "No description"}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Videos:</span>
            <Badge variant="outline" className="text-xs px-1.5">
              <IconVideo className="size-3 mr-1" />
              {program.videos.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Subscribers:</span>
            <Badge variant="outline" className="text-xs px-1.5">
              <IconUsers className="size-3 mr-1" />
              {program.subscribers.length}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Created:</span>
            <span>{program.createdAt ? formatted : "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Delete Program Dialog
function DeleteProgramDialog({
  program,
  onDelete,
}: {
  program: Program;
  onDelete: (programId: number) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/programs/${program.id}`);
      onDelete(program.id);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete program:", err);
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
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            program <span className="font-semibold">{program.name}</span> and
            all associated data.
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
              "Delete Program"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Add Program Drawer
export function AddProgramDrawer({
  onAddProgram,
  showTrigger = true,
  open,
  onOpenChange,
}: {
  onAddProgram: (program: z.infer<typeof programSchema>) => void;
  showTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof programSchema>>();

  const onSubmit = async (data: z.infer<typeof programSchema>) => {
    try {
      const response = await api.post("/programs", data);
      onAddProgram(response.data);
      reset();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to add program:", err);
    }
  };

  const closeDrawer = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Program</span>
          </Button>
        </SheetTrigger>
      )}

      <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <IconTable className="size-5" />
            Add New Program
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-6 text-sm mt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Program Name *</Label>
              <Input
                placeholder="program name"
                id="name"
                {...register("name", { required: "Program name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                placeholder="description"
                id="description"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={closeDrawer}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Program
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Edit Program Drawer
function ProgramTableCellViewer({
  program,
  onUpdateProgram,
}: {
  program: Program;
  onUpdateProgram: (
    program: z.infer<typeof programSchema> & { id: number }
  ) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<z.infer<typeof programSchema>>({
    defaultValues: {
      name: program.name,
      description: program.description || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: program.name,
        description: program.description || "",
      });
      setError(null);
    }
  }, [isOpen, program, reset]);

  const onSubmit = async (data: z.infer<typeof programSchema>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.put(`/programs/${program.id}`, data);
      onUpdateProgram({ ...data, id: program.id });
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to update program:", err);
      setError("Failed to update program. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {program.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full max-w-md ml-auto overflow-y-auto">
        <DrawerHeader className="gap-1">
          <DrawerTitle>Edit Program</DrawerTitle>
          <DrawerDescription>
            Update details for {program.name}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {error && (
            <Alert variant="destructive">
              <IconAlertCircle className="h-4 w-4" />
              <AlertTitle>Update Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Program Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Program name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
              {errors.description && (
                <p className="text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>
            <DrawerFooter className="px-0 mt-6">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <>
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Main ProgramTable Component
export function ProgramTable({ programs }: { programs: Program[] }) {
  const { programs: programData, reload: programsReload } = useReduxPrograms();
  const [data, setData] = React.useState<Program[]>(programs);
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
    setData(programs);
  }, [programs]);

  React.useMemo(() => {
    if (!programData.length) {
      programsReload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataIds = React.useMemo(() => programs.map(({ id }) => id), [programs]);

  const handleAddProgram = (newProgram: z.infer<typeof programSchema>) => {
    setData((prev) => [
      ...prev,
      {
        ...newProgram,
        videos: [],
        subscribers: [],
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleUpdateProgram = React.useCallback(
    (updatedProgram: z.infer<typeof programSchema> & { id: number }) => {
      setData((prev) =>
        prev.map((program) =>
          program.id === updatedProgram.id
            ? { ...program, ...updatedProgram }
            : program
        )
      );
    },
    []
  );

  const handleRetryFetch = async () => {
    await programsReload();
  };

  const handleDeleteProgram = React.useCallback((programId: number) => {
    setData((prev) => prev.filter((program) => program.id !== programId));
  }, []);

  const columns = React.useMemo<ColumnDef<Program>[]>(
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
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <ProgramTableCellViewer
            program={row.original}
            onUpdateProgram={handleUpdateProgram}
          />
        ),
        enableHiding: false,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <Label className="truncate max-w-xs">
            {row.original.description || "No description"}
          </Label>
        ),
      },
      {
        accessorKey: "videos",
        header: "Videos",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <IconVideo className="size-3 mr-1" />
            {row.original.videos.length}
          </Badge>
        ),
      },
      {
        accessorKey: "subscribers",
        header: "Subscribers",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <IconUsers className="size-3 mr-1" />
            {row.original.subscribers.length}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
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
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteProgramDialog
                program={row.original}
                onDelete={handleDeleteProgram}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleUpdateProgram, handleDeleteProgram]
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
      defaultValue="table"
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
          <AddProgramDrawer onAddProgram={handleAddProgram} />
        </div>
      </div>

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
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span>No programs found.</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRetryFetch}
                          className="text-sm text-primary flex items-center gap-2"
                        >
                          <IconRefresh className="size-4" />
                          Retry
                        </Button>
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
          {data.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
        {data.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No programs found.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
