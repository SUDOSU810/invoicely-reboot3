import React, { useState, useMemo, useId, useRef, useEffect } from "react"
import { useInvoiceAnalytics } from "../lib/hooks/useInvoiceAnalytics"
import { Link } from "react-router-dom"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronUp,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  FileText,
  Eye,
  Trash2,
  MoreHorizontal,
  Search,
  X,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

type InvoiceStatus = "paid" | "pending" | "overdue" | "cancelled"

type Invoice = {
  id: string
  invoiceNumber: string
  client: string
  amount: number
  status: InvoiceStatus
  date: string
  dueDate: string
  items: number
  description?: string
}

const multiColumnFilterFn: FilterFn<Invoice> = (row, columnId, filterValue) => {
  const searchableContent = `${row.original.invoiceNumber} ${row.original.client} ${row.original.description || ""}`.toLowerCase()
  return searchableContent.includes((filterValue ?? "").toLowerCase())
}

const statusFilterFn: FilterFn<Invoice> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true
  return filterValue.includes(row.getValue(columnId) as string)
}

export default function HistoryPage() {
  const id = useId()
  const [data, setData] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { analytics, refreshAnalytics } = useInvoiceAnalytics()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch invoices from DynamoDB
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true)
        console.log("📊 Fetching invoices from all sources...")
        
        const { invoiceService } = await import("../lib/invoice-service")
        const invoices = await invoiceService.getAllInvoices()
        console.log("Loaded invoices:", invoices)
        
        // Transform records to match the Invoice interface
        const transformedInvoices: Invoice[] = invoices.map((record: any) => ({
          id: record.id,
          invoiceNumber: record.invoiceNumber,
          client: record.clientName,
          amount: record.amount,
          status: record.status,
          date: record.date,
          dueDate: record.dueDate,
          items: record.items,
          description: record.description,
          pdfUrl: record.pdfUrl, // CRITICAL: Include pdfUrl in transformation
        }))
        
        console.log("Transformed invoices:", transformedInvoices)
        setData(transformedInvoices)
        
        // Refresh analytics when data loads
        refreshAnalytics()
      } catch (error) {
        console.error("Error fetching invoices:", error)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInvoices()
  }, [])

  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
      },
      {
        header: "Invoice #",
        accessorKey: "invoiceNumber",
        cell: ({ row }) => (
          <button
            className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline cursor-pointer"
            onClick={() => {
              // Direct access to PDF URL from invoice data
              const pdfUrl = row.original.pdfUrl
              
              if (pdfUrl) {
                window.open(pdfUrl, '_blank')
              } else {
                alert('PDF not available')
              }
            }}
          >
            {row.getValue("invoiceNumber")}
          </button>
        ),
        size: 120,
        filterFn: multiColumnFilterFn,
        enableHiding: false,
      },
      {
        header: "Client",
        accessorKey: "client",
        size: 180,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"))
          const formatted = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(amount)
          return <div className="font-semibold">{formatted}</div>
        },
        size: 120,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.getValue("status") as InvoiceStatus
          return (
            <Badge
              className={cn(
                status === "paid" && "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
                status === "pending" && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
                status === "overdue" && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
                status === "cancelled" && "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
              )}
            >
              {status === "paid" && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {status === "pending" && <Clock className="mr-1 h-3 w-3" />}
              {status === "overdue" && <AlertCircle className="mr-1 h-3 w-3" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )
        },
        size: 120,
        filterFn: statusFilterFn,
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ row }) => {
          const date = new Date(row.getValue("date"))
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        },
        size: 120,
      },
      {
        header: "Due Date",
        accessorKey: "dueDate",
        cell: ({ row }) => {
          const date = new Date(row.getValue("dueDate"))
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        },
        size: 120,
      },
      {
        header: "Items",
        accessorKey: "items",
        size: 80,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  // Direct access to PDF URL from invoice data
                  const pdfUrl = row.original.pdfUrl
                  
                  if (pdfUrl) {
                    window.open(pdfUrl, '_blank')
                  } else {
                    alert('PDF not available')
                  }
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Direct access to PDF URL from invoice data
                  const pdfUrl = row.original.pdfUrl
                  
                  if (pdfUrl) {
                    const link = document.createElement('a')
                    link.href = pdfUrl
                    link.download = `${row.original.invoiceNumber}.pdf`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  } else {
                    alert('PDF not available')
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 60,
        enableHiding: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  })

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[]
    return filterValue ?? []
  }, [table.getColumn("status")?.getFilterValue()])

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table.getColumn("status")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
  }

  const pageAnalytics = useMemo(() => {
    const total = data.reduce((sum, inv) => sum + inv.amount, 0)
    const paid = data.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
    const pending = data.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0)
    const overdue = data.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0)

    return { total, paid, pending, overdue }
  }, [data])

  const handleBulkAction = async (action: string) => {
    const selectedRows = table.getSelectedRowModel().rows
    const selectedIds = selectedRows.map((r) => r.original.id)
    
    try {
      const { invoiceService } = await import("../lib/invoice-service")
      
      if (action === "mark-paid") {
        for (const id of selectedIds) {
          await invoiceService.updateInvoiceStatus(id, 'paid')
        }
        alert(`✅ Marked ${selectedIds.length} invoices as paid`)
        // Refresh the data and analytics
        refreshAnalytics()
        window.location.reload()
      } else if (action === "delete") {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} invoices?`)) {
          for (const id of selectedIds) {
            await invoiceService.deleteInvoice(id)
          }
          alert(`✅ Deleted ${selectedIds.length} invoices`)
          // Refresh the data and analytics
          refreshAnalytics()
          window.location.reload()
        }
      }
    } catch (error) {
      console.error(`Error with bulk action ${action}:`, error)
      alert(`❌ Error performing ${action}`)
    }
    
    table.resetRowSelection()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice History</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your invoices in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                refreshAnalytics()
                window.location.reload()
              }} 
              variant="outline" 
              className="gap-2"
            >
              🔄 Refresh
            </Button>
            <Link to="/home">
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{analytics.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{analytics.paidAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.paidInvoices} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                ₹{analytics.pendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.pendingInvoices} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{analytics.overdueAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.overdueInvoices} invoices
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Input
              id={`${id}-search`}
              ref={inputRef}
              className={cn("ps-9", Boolean(table.getColumn("invoiceNumber")?.getFilterValue()) && "pe-9")}
              value={(table.getColumn("invoiceNumber")?.getFilterValue() ?? "") as string}
              onChange={(e) => table.getColumn("invoiceNumber")?.setFilterValue(e.target.value)}
              placeholder="Search invoices..."
              type="text"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
              <Search size={16} strokeWidth={2} />
            </div>
            {Boolean(table.getColumn("invoiceNumber")?.getFilterValue()) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 hover:text-foreground"
                onClick={() => {
                  table.getColumn("invoiceNumber")?.setFilterValue("")
                  inputRef.current?.focus()
                }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter size={16} strokeWidth={2} />
                Status
                {selectedStatuses.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">Filter by status</div>
                <div className="space-y-2">
                  {["paid", "pending", "overdue", "cancelled"].map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <Checkbox
                        id={`${id}-${status}`}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={(checked: boolean) => handleStatusChange(checked, status)}
                      />
                      <Label htmlFor={`${id}-${status}`} className="flex-1 font-normal capitalize">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar size={16} strokeWidth={2} />
                Date Range
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Select Period</DropdownMenuLabel>
              <DropdownMenuItem>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem>Last 3 months</DropdownMenuItem>
              <DropdownMenuItem>Last year</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Custom range...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          {table.getSelectedRowModel().rows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Bulk Actions
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">
                    {table.getSelectedRowModel().rows.length}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleBulkAction("download")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("mark-paid")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleBulkAction("delete")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Columns
                <ChevronDown size={16} strokeWidth={2} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="gap-2">
            <Download size={16} strokeWidth={2} />
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-background/30 backdrop-blur-xl">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/60">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="shrink-0 opacity-60" size={16} strokeWidth={2} />,
                          desc: <ChevronDown className="shrink-0 opacity-60" size={16} strokeWidth={2} />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-b border-border/40">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? "Loading invoices..." : "No invoices found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Label htmlFor={`${id}-pagesize`} className="max-sm:sr-only">
            Rows per page
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger id={`${id}-pagesize`} className="w-fit whitespace-nowrap">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
          <p>
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getRowCount()
              )}
            </span>{" "}
            of <span className="text-foreground">{table.getRowCount()}</span>
          </p>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronFirst size={16} strokeWidth={2} />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={16} strokeWidth={2} />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronLast size={16} strokeWidth={2} />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}