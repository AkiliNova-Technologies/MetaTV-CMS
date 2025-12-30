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
  IconPlus,
  IconTable,
  IconLayoutGrid,
  IconAlertCircle,
  IconVideo,
  IconUsers,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconCalendar,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
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
} from "./ui/alert-dialog";
import { useReduxPrograms } from "@/hooks/useReduxPrograms";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "./ui/sheet";
import { toast } from "sonner";

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
function ProgramCard({ 
  program, 
  onEdit, 
  onDelete 
}: { 
  program: Program;
  onEdit: (program: Program) => void;
  onDelete: (programId: number) => void;
}) {
  const date = new Date(program.createdAt);
  const formatted = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-1 hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-input flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {program.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {program.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <IconCalendar className="size-3" />
                {formatted}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(program)}>
                <IconEdit className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(program.id)}
              >
                <IconTrash className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {program.description || "No description provided"}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Separator className="mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <IconVideo className="size-4" />
              <span className="text-xs font-medium">Videos</span>
            </div>
            <span className="text-2xl font-bold">{program.videos.length}</span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <IconUsers className="size-4" />
              <span className="text-xs font-medium">Subscribers</span>
            </div>
            <span className="text-2xl font-bold">{program.subscribers.length}</span>
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
  trigger,
}: {
  program: Program;
  onDelete: (programId: number) => void;
  trigger?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/programs/${program.id}`);
      onDelete(program.id);
      toast.success("Program deleted successfully");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete program:", err);
      toast.error("Failed to delete program");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <IconTrash className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <IconAlertCircle className="size-5 text-red-600" />
            </div>
            Delete Program?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            Are you sure you want to delete <span className="font-semibold">{program.name}</span>? 
            This action cannot be undone and will permanently remove:
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>{program.videos.length} associated videos</li>
              <li>{program.subscribers.length} subscriber connections</li>
              <li>All program metadata and settings</li>
            </ul>
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
                <IconTrash className="mr-2 h-4 w-4" />
                Delete Program
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Add Program Sheet with improved design
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<z.infer<typeof programSchema>>();

  const formValues = watch();

  const onSubmit = async (data: z.infer<typeof programSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/programs", data);
      onAddProgram(response.data);
      toast.success("Program created successfully!");
      reset();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to add program:", err);
      toast.error("Failed to create program");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDrawer = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      reset();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="default" size="sm" className="gap-2">
            <IconPlus className="size-4" />
            <span className="hidden lg:inline">Add Program</span>
            <span className="lg:hidden">Add</span>
          </Button>
        </SheetTrigger>
      )}

      <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
        <SheetHeader className="space-y-3 pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-input flex items-center justify-center shadow-lg">
              <IconPlus className="size-6 text-white" />
            </div>
            <div>
              <SheetTitle className="text-2xl">Create New Program</SheetTitle>
              <SheetDescription className="text-base">
                Add a new program to organize your content
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-[calc(100vh-180px)]">
          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
            {/* Program Name */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconTable className="size-4" />
                  Program Details
                </CardTitle>
                <CardDescription>
                  Basic information about your program
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Program Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Morning Show, News Hour, Tech Reviews"
                    {...register("name", { required: "Program name is required" })}
                    className="text-base"
                  />
                  {errors.name && (
                    <p className="text-destructive text-xs flex items-center gap-1">
                      <IconAlertCircle className="size-3" />
                      {errors.name.message}
                    </p>
                  )}
                  {formValues.name && (
                    <p className="text-xs text-muted-foreground">
                      {formValues.name.length}/100 characters
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this program is about, its schedule, target audience, etc."
                    {...register("description")}
                    className="min-h-[120px] resize-none text-base"
                  />
                  {formValues.description && (
                    <p className="text-xs text-muted-foreground">
                      {formValues.description.length}/500 characters
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {formValues.name && (
              <Card className="border-1 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <IconCheck className="size-4" />
                    Preview
                  </CardTitle>
                  <CardDescription>
                    How your program will appear
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-background">
                    <div className="size-12 rounded-xl bg-input flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {formValues.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{formValues.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formValues.description || "No description"}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          <IconVideo className="size-3 mr-1" />
                          0 Videos
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <IconUsers className="size-3 mr-1" />
                          0 Subscribers
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer with actions */}
          <SheetFooter className="border-t pt-6 flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeDrawer}
              disabled={isSubmitting}
              className="flex-1"
            >
              <IconX className="mr-2 size-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formValues.name}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <IconLoader className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 size-4" />
                  Create Program
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// Edit Program Sheet with improved design
function EditProgramSheet({
  program,
  onUpdateProgram,
  trigger,
}: {
  program: Program;
  onUpdateProgram: (program: z.infer<typeof programSchema> & { id: number }) => void;
  trigger?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<z.infer<typeof programSchema>>({
    defaultValues: {
      name: program.name,
      description: program.description || "",
    },
  });

  const formValues = watch();

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: program.name,
        description: program.description || "",
      });
    }
  }, [isOpen, program, reset]);

  const onSubmit = async (data: z.infer<typeof programSchema>) => {
    setIsSubmitting(true);
    try {
      await api.put(`/programs/${program.id}`, data);
      onUpdateProgram({ ...data, id: program.id });
      toast.success("Program updated successfully!");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to update program:", err);
      toast.error("Failed to update program");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="link" className="text-foreground px-0 h-auto font-normal">
            {program.name}
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
        <SheetHeader className="space-y-3 pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-input flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {program.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <SheetTitle className="text-2xl">Edit Program</SheetTitle>
              <SheetDescription className="text-base">
                Update details for {program.name}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-[calc(100vh-180px)]">
          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
            {/* Program Statistics */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base">Current Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <IconVideo className="size-4" />
                      <span className="text-xs font-medium">Videos</span>
                    </div>
                    <span className="text-3xl font-bold">{program.videos.length}</span>
                  </div>
                  
                  <div className="flex flex-col items-center p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <IconUsers className="size-4" />
                      <span className="text-xs font-medium">Subscribers</span>
                    </div>
                    <span className="text-3xl font-bold">{program.subscribers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconEdit className="size-4" />
                  Program Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Program Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    {...register("name", { required: "Program name is required" })}
                    className="text-base"
                  />
                  {errors.name && (
                    <p className="text-destructive text-xs flex items-center gap-1">
                      <IconAlertCircle className="size-3" />
                      {errors.name.message}
                    </p>
                  )}
                  {formValues.name && (
                    <p className="text-xs text-muted-foreground">
                      {formValues.name.length}/100 characters
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="edit-description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    {...register("description")}
                    className="min-h-[120px] resize-none text-base"
                  />
                  {formValues.description && (
                    <p className="text-xs text-muted-foreground">
                      {formValues.description.length}/500 characters
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Changes Alert */}
            {isDirty && (
              <Alert>
                <IconAlertCircle className="h-4 w-4" />
                <AlertTitle>Unsaved Changes</AlertTitle>
                <AlertDescription>
                  You have unsaved changes. Don't forget to save before closing.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <SheetFooter className="border-t pt-6 flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              <IconX className="mr-2 size-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty || !formValues.name}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <IconLoader className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// Main ProgramTable Component
export function ProgramTable({ programs }: { programs: Program[] }) {
  const {
    programs: programData,
    reload: programsReload,
    loading,
  } = useReduxPrograms();
  const [data, setData] = React.useState<Program[]>(programs);
  const [viewMode, setViewMode] = React.useState<"table" | "card">("table");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [editingProgram, setEditingProgram] = React.useState<Program | null>(null);

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
          <EditProgramSheet
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
          <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
            {row.original.description || "No description"}
          </span>
        ),
      },
      {
        accessorKey: "videos",
        header: "Videos",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground">
            <IconVideo className="size-3 mr-1" />
            {row.original.videos.length}
          </Badge>
        ),
      },
      {
        accessorKey: "subscribers",
        header: "Subscribers",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-muted-foreground">
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
          });
          return <span className="text-sm">{formatted}</span>;
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
              <DropdownMenuItem onClick={() => setEditingProgram(row.original)}>
                <IconEdit className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
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
    <>
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
                          <span>No programs found.</span>
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
          {data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onEdit={setEditingProgram}
                  onDelete={handleDeleteProgram}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <IconTable className="size-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first program to get started
              </p>
              <AddProgramDrawer onAddProgram={handleAddProgram} showTrigger={true} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Program Sheet (controlled) */}
      {editingProgram && (
        <EditProgramSheet
          program={editingProgram}
          onUpdateProgram={handleUpdateProgram}
          trigger={<span />}
        />
      )}
    </>
  );
}