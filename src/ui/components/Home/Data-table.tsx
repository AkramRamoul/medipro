import * as React from "react";
import {
  ColumnDef,
  flexRender,
  SortingState,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NewPatientModal from "../NewPatient/NewPatientModal";
import { Plus, Search } from "lucide-react";

interface DataTableProps<
  TData extends { id: string; first_name: string; last_name: string },
  TValue,
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<
  TData extends { id: string; first_name: string; last_name: string },
  TValue,
>({ columns, data }: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const navigate = useNavigate();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <NewPatientModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="flex flex-col space-y-4 items-center bg-background text-foreground transition-colors">
        <div className="flex items-center py-2 w-[800px] max-w-full mx-auto space-x-5">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Search className="w-5 h-5" />
            </span>
            <Input
              placeholder="Filter by name..."
              value={
                (table.getColumn("lastname")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("lastname")?.setFilterValue(event.target.value)
              }
              className="pl-10 bg-card border border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            className="w-fit flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <span>Add New Patient</span>
            <Plus className="w-4 h-4 font-bold" />
          </Button>
        </div>

        <div className="rounded-md border border-border w-[800px] max-w-full mx-auto bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted even:bg-background"
                    onClick={() => navigate(`/pat/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-foreground">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-center space-x-2 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-foreground border-border"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-foreground border-border"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
