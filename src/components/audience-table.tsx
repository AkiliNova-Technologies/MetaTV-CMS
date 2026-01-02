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
  IconUser,
  IconAlertCircle,
  IconRefresh,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Controller, useForm } from "react-hook-form";
import { userSchema } from "@/constants/Constants";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "./ui/sheet";
import {
  Mail,
  Clock,
  Shield,
  UserCheck,
  UserX,
  Users,
  Calendar,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// Drag Handle Component
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <IconGripVertical className="text-muted-foreground size-4" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Draggable Row Component
function DraggableRow({ row }: { row: Row<z.infer<typeof userSchema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 hover:bg-muted/30 transition-colors"
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

// Enhanced User Card Component
function UserCard({
  member,
  onEdit,
  onDelete,
}: {
  member: z.infer<typeof userSchema>;
  onEdit: (member: z.infer<typeof userSchema>) => void;
  onDelete: (userId: number) => void;
}) {
  const lastLogin = member.lastLogin
    ? new Date(member.lastLogin).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`;

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
  <div className="flex items-start gap-4">
    {/* Avatar with Status Indicator */}
    <div className="relative flex-shrink-0">
      <Avatar className="size-16 border-2 border-muted">
        <AvatarImage
          src={member.avatar}
          alt={`${member.firstName} ${member.lastName}`}
        />
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {/* Status Dot */}
      <div
        className={`absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-background flex items-center justify-center ${
          member.status === "ACTIVE"
            ? "bg-green-500"
            : member.status === "PENDING"
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
      >
        {member.status === "ACTIVE" && (
          <UserCheck className="size-3 text-white" />
        )}
        {member.status === "PENDING" && (
          <Clock className="size-3 text-white" />
        )}
        {member.status === "SUSPENDED" && (
          <UserX className="size-3 text-white" />
        )}
      </div>
    </div>

    {/* Name & Email */}
    <div className="flex-1 min-w-0 overflow-hidden">
      <h3 className="font-bold text-base truncate leading-tight mb-1">
        {member.firstName} {member.lastName}
      </h3>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Mail className="size-3.5 flex-shrink-0" />
        <span className="truncate text-ellipsis overflow-hidden max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
          {member.email}
        </span>
      </div>
    </div>

    {/* Actions Menu */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 hover:bg-primary/10 flex-shrink-0"
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onEdit(member)}>
          <IconEdit className="size-4 mr-2" />
          Edit Member
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => onDelete(member.id)}
        >
          <Trash2 className="size-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</CardHeader>

      <CardContent className="space-y-3 pt-3 border-t">
        {/* Role & Status Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Role:</span>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-medium border-primary/20"
          >
            {member.role}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <UserCheck className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Status:</span>
          </div>
          <Badge
            variant={member.status === "ACTIVE" ? "default" : "secondary"}
            className={`text-xs font-medium ${
              member.status === "ACTIVE"
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                : member.status === "PENDING"
                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
            }`}
          >
            {member.status}
          </Badge>
        </div>

        {/* Last Login */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="size-3.5 flex-shrink-0" />
          <span className="truncate">
            {lastLogin ? `Last login: ${lastLogin}` : "Never logged in"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

type UserFormData = z.infer<typeof userSchema>;

// Delete Dialog Component
function DeleteMemberDialog({
  user,
  onDelete,
}: {
  user: z.infer<typeof userSchema>;
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
      toast.success("Member deleted successfully");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Failed to delete member");
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
            Delete User Member?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {user.firstName} {user.lastName}
            </span>
            ? This action cannot be undone and will permanently remove all their
            data.
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
                Delete Member
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Add Member Drawer Component
export function AddMemberDrawer({
  onAddMember,
  showTrigger = true,
  open,
  onOpenChange,
}: {
  onAddMember: (member: UserFormData) => void;
  showTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  const { reload: UsersReload } = useReduxUsers();

  const {
    register,
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
      toast.success("Member added successfully");
      reset();
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to add member:", err);
      toast.error("Failed to add member");
    }
  };

  const closeDrawer = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="default" size="sm" className="gap-2">
            <IconPlus className="size-4" />
            <span className="hidden lg:inline">Add Member</span>
            <span className="lg:hidden">Add</span>
          </Button>
        </SheetTrigger>
      )}

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
        <SheetHeader className="space-y-3 px-0">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="size-12 rounded-xl bg-input flex items-center justify-center">
              <IconUser className="size-5 text-white" />
            </div>
            Add New User Member
          </SheetTitle>
          <SheetDescription>
            Add a new member to your user with their details and role assignment
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Personal Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    placeholder="John"
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

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    placeholder="Doe"
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

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  placeholder="johndoe"
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

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  placeholder="john.doe@metatv.com"
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
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={closeDrawer}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <IconPlus className="size-4 mr-2" />
              Add Member
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// Main Table Component
export function UserTable({ user }: { user: z.infer<typeof userSchema>[] }) {
  const { loading, reload: membersReload } = useReduxUsers();
  const [data, setData] = React.useState<z.infer<typeof userSchema>[]>(user);
  const [viewMode, setViewMode] = React.useState<"table" | "card">("card");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 12,
  });
  const [editingMember, setEditingMember] = React.useState<z.infer<
    typeof userSchema
  > | null>(null);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  React.useEffect(() => {
    setData(user);
  }, [user]);

  React.useMemo(() => {
    if (!user.length) {
      membersReload();
    }
  }, [user.length, membersReload]);

  const dataIds = React.useMemo(() => user.map(({ id }) => id), [user]);

  const handleAddMember = (newMember: UserFormData) => {
    setData((prev) => [...prev, newMember]);
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

  const filteredData = React.useMemo(() => {
    if (!globalFilter) return data;

    return data.filter((member) =>
      `${member.firstName} ${member.lastName} ${member.email} ${member.username} ${member.role}`
        .toLowerCase()
        .includes(globalFilter.toLowerCase())
    );
  }, [data, globalFilter]);

  const columns = React.useMemo<ColumnDef<z.infer<typeof userSchema>>[]>(
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
        id: "name",
        header: "Member",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border">
              <AvatarImage
                src={row.original.avatar}
                alt={`${row.original.firstName} ${row.original.lastName}`}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 font-semibold">
                {row.original.firstName.charAt(0)}
                {row.original.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Button
                variant="link"
                className="text-foreground p-0 h-auto font-semibold text-left justify-start hover:text-primary"
                onClick={() => setEditingMember(row.original)}
              >
                {row.original.firstName} {row.original.lastName}
              </Button>
              <span className="text-xs text-muted-foreground">
                @{row.original.username}
              </span>
            </div>
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="size-3.5 text-muted-foreground" />
            <span className="text-sm">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-medium border-primary/20">
            <Shield className="size-3 mr-1" />
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "ACTIVE" ? "default" : "secondary"}
            className={`font-medium ${
              row.original.status === "ACTIVE"
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                : row.original.status === "PENDING"
                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
            }`}
          >
            {row.original.status === "ACTIVE" && (
              <UserCheck className="size-3 mr-1" />
            )}
            {row.original.status === "PENDING" && (
              <Clock className="size-3 mr-1" />
            )}
            {row.original.status === "SUSPENDED" && (
              <UserX className="size-3 mr-1" />
            )}
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "lastLogin",
        header: "Last Login",
        cell: ({ row }) => {
          if (!row.original.lastLogin) {
            return <span className="text-sm text-muted-foreground">Never</span>;
          }
          const date = new Date(row.original.lastLogin);
          const formatted = date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div className="flex items-center gap-2 text-sm">
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
              <DropdownMenuItem onClick={() => setEditingMember(row.original)}>
                <IconEdit className="size-4 mr-2" />
                Edit Member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteMemberDialog
                user={row.original}
                onDelete={handleDeleteMember}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [handleDeleteMember]
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
          <AddMemberDrawer onAddMember={handleAddMember} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 lg:px-6">
        <div className="relative max-w-md">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name, email, or role..."
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <IconLoader className="size-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Loading members...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
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
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Users className="size-12 text-muted-foreground opacity-50" />
                        <div>
                          <p className="font-semibold mb-1">No members found</p>
                          <p className="text-sm text-muted-foreground">
                            {globalFilter
                              ? "Try adjusting your search"
                              : "Add your first user member to get started"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {globalFilter && (
                            <Button variant="outline" onClick={clearSearch}>
                              Clear search
                            </Button>
                          )}
                          <Button variant="ghost" onClick={handleRetryFetch}>
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
            {table.getFilteredRowModel().rows.length} member(s) selected
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
            <p className="text-sm text-muted-foreground">Loading members...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((member) => (
              <UserCard
                key={member.id}
                member={member}
                onEdit={setEditingMember}
                onDelete={handleDeleteMember}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-6">
              <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-12 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-10 rounded-full bg-background border-2 flex items-center justify-center">
                <IconPlus className="size-5 text-muted-foreground" />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2">
              {globalFilter ? "No members found" : "No user members yet"}
            </h3>

            <p className="text-muted-foreground mb-6 max-w-sm">
              {globalFilter
                ? "Try adjusting your search terms or clear the filter"
                : "Start building your user by adding your first member"}
            </p>

            <div className="flex items-center gap-3">
              {globalFilter && (
                <Button variant="outline" onClick={clearSearch}>
                  <IconX className="size-4 mr-2" />
                  Clear Search
                </Button>
              )}
              <AddMemberDrawer
                onAddMember={handleAddMember}
                showTrigger={true}
              />
            </div>
          </div>
        )}
      </TabsContent>

      {/* Edit Member Sheet - Reuse your TableCellViewer logic here */}
      {editingMember && (
        <TableCellViewer
          user={editingMember}
          onUpdateMember={handleUpdateMember}
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </Tabs>
  );
}

// TableCellViewer Component (for editing)
function TableCellViewer({
  user,
  onUpdateMember,
  isOpen,
  onClose,
}: {
  user: z.infer<typeof userSchema>;
  onUpdateMember: (user: UserFormData & { id: number }) => void;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { reload: UsersReload } = useReduxUsers();

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onClose || setInternalOpen;

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
    },
  });

  React.useEffect(() => {
    if (open) {
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
  }, [open, user, reset]);

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.put(`/users/${user.id}`, data);
      onUpdateMember({ ...data, id: user.id });
      await UsersReload();
      toast.success("Member updated successfully");
      setOpen(false);
    } catch (err) {
      console.error("Failed to update user:", err);
      setError("Failed to update user. Please try again.");
      toast.error("Failed to update member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
        <SheetHeader className="space-y-3 px-0">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="size-12 rounded-xl bg-input flex items-center justify-center">
              <IconEdit className="size-5 text-white" />
            </div>
            Edit Member
          </SheetTitle>
          <SheetDescription>
            Update details for {user.firstName} {user.lastName}
          </SheetDescription>
        </SheetHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <IconAlertCircle className="h-4 w-4" />
            <AlertTitle>Update Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Personal Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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

                <div className="space-y-2">
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

              <div className="space-y-2">
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

              <div className="space-y-2">
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
            </CardContent>
          </Card>

          {/* Role & Status */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">User Status</h3>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" defaultValue={user.status}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">
                          <div className="flex items-center gap-2">
                            <UserCheck className="size-4" />
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="PENDING">
                          <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="SUSPENDED">
                          <div className="flex items-center gap-2">
                            <UserX className="size-4" />
                            Suspended
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconEdit className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
