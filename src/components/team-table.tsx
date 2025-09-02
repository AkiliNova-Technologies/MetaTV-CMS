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
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTable,
  IconLayoutGrid,
  IconUser,
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
// import { Textarea } from "@/components/ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { teamSchema } from "@/constants/Constants";
import api from "@/utils/api";
import { useReduxUsers } from "@/hooks/useReduxUsers";
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

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

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

function DraggableRow({ row }: { row: Row<z.infer<typeof teamSchema>> }) {
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
        transition: transition,
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

function TeamCard({ member }: { member: z.infer<typeof teamSchema> }) {
  const date = new Date(member.lastLogin);
  const formatted = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg border-1 blackscale flex items-center justify-center text-white font-semibold">
            {member.firstName.charAt(0)}
            {member.lastName.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-xs text-muted-foreground">{member.email}</p>
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
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Role:</span>
            <Badge variant="outline" className="text-xs px-1.5">
              {member.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline" className="text-xs px-1.5">
              {member.status === "ACTIVE" ? (
                <IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400 mr-1" />
              ) : (
                <IconLoader className="size-3 mr-1" />
              )}
              {member.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last Login:</span>
            <span>
              {member.lastLogin ? formatted : "_ / __ / ____ , __:__"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type UserFormData = z.infer<typeof teamSchema>;

function DeleteMemberDialog({
  user,
  onDelete,
}: {
  user: z.infer<typeof teamSchema>;
  onDelete: (userId: number) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { reload: UsersReload } = useReduxUsers();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/users/${user.id}`);
      onDelete(user.id);
      await UsersReload();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete user:", err);
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
              {user.firstName} {user.lastName}
            </span>
            's account and remove all their data from our servers.
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
              "Delete User"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AddMemberDrawer({
  onAddMember,
}: {
  onAddMember: (member: UserFormData) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const { reload: UsersReload } = useReduxUsers();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>();

  const onSubmit = async (data: UserFormData) => {
    const defaultPassword = `${data.firstName}${data.lastName}`
      .toLowerCase()
      .replace(/\s+/g, "");

    const newMember = {
      ...data,
      status: "ACTIVE" as const,
      password: defaultPassword,
    };

    try {
      await api.post("/users", newMember);
      onAddMember(newMember);
      await UsersReload();
      reset();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add Member</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-full w-full max-w-md ml-auto overflow-y-auto">
        <DrawerHeader className="gap-1">
          <DrawerTitle className="flex items-center gap-2">
            <IconUser className="size-5" />
            Add New Team Member
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                {...register("username", {
                  required: "Username is required",
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-xs">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="role">Role *</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="CREATOR">Creator</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-red-500 text-xs">{errors.role.message}</p>
              )}
            </div>

            <DrawerFooter className="px-0 mt-6">
              <Button type="submit">Add Member</Button>
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

export function TeamTable({ team }: { team: z.infer<typeof teamSchema>[] }) {
  const { reload: membersReload } = useReduxUsers();
  const [data, setData] = React.useState<z.infer<typeof teamSchema>[]>(team);
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
    setData(team);
  }, [team]);

  const dataIds = React.useMemo(() => team.map(({ id }) => id), [team]);

  const handleAddMember = (newMember: UserFormData) => {
    setData((prev: z.infer<typeof teamSchema>[]) => [...prev, newMember]);
  };

  const handleUpdateMember = React.useCallback(
    (updatedUser: UserFormData & { id: number }) => {
      setData((prev) =>
        prev.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        )
      );
    },
    []
  );

  const handleDeleteMember = React.useCallback((userId: number) => {
    setData((prev) => prev.filter((user) => user.id !== userId));
  }, []);

  const handleRetryFetch = async () => {
    await membersReload();
  };

  const columns = React.useMemo<ColumnDef<z.infer<typeof teamSchema>>[]>(
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
      // 👇 Combined Name Column
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <TableCellViewer
            user={row.original}
            onUpdateMember={handleUpdateMember}
          />
        ),
        enableHiding: false,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          return <Label>{row.original.email}</Label>;
        },
        enableHiding: false,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <div className="w-32">
            <Badge variant="outline" className="text-muted-foreground px-1.5">
              {row.original.role}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="text-muted-foreground px-1.5 flex items-center gap-1"
          >
            {row.original.status === "ACTIVE" ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            ) : (
              <IconLoader />
            )}
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "lastLogin",
        header: () => <div className="w-full text-left">Last Login</div>,
        cell: ({ row }) => {
          const date = new Date(row.original.lastLogin);
          if (!row.original.lastLogin) {
            return <Label>dd/ mm/ yyyy</Label>;
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
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteMemberDialog
                user={row.original}
                onDelete={handleDeleteMember}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleUpdateMember, handleDeleteMember]
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
      setData((data: z.infer<typeof teamSchema>[]) => {
        const oldIndex = dataIds.indexOf(Number(active.id));
        const newIndex = dataIds.indexOf(Number(over.id));
        return arrayMove(data, oldIndex, newIndex);
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
                  .map((column) => {
                    return (
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
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <AddMemberDrawer onAddMember={handleAddMember} />
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
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
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
                        <span>No members found.</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRetryFetch}
                          className="text-sm text-primary hover:underline flex items-center gap-2"
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
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
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
          {team.map((member: z.infer<typeof teamSchema>) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
        {team.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No team members found.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function TableCellViewer({
  user,
  onUpdateMember,
}: {
  user: z.infer<typeof teamSchema>;
  onUpdateMember: (user: UserFormData) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { reload: UsersReload } = useReduxUsers();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      // Add other fields as needed
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      });
      setError(null);
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.put(`/users/${user.id}`, data);
      onUpdateMember({ ...data, id: user.id });
      await UsersReload();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to update user:", err);
      setError("Failed to update user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {user.firstName} {user.lastName}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-full w-full max-w-md ml-auto overflow-y-auto">
        <DrawerHeader className="gap-1">
          <DrawerTitle>Edit User Information</DrawerTitle>
          <DrawerDescription>
            Update details for {user.firstName} {user.lastName}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                {...register("username", {
                  required: "Username is required",
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-xs">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="role">Role *</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={user.role === "SUPER_ADMIN"} // Example: disable for certain roles
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="CREATOR">Creator</SelectItem>
                      {/* Add other roles as needed */}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-red-500 text-xs">{errors.role.message}</p>
              )}
            </div>

            {/* Status Field */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="status">Status *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
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
