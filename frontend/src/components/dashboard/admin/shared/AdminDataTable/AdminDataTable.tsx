"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DashboardButton } from "@/src/components/dashboard/shared/patterns";
import { Label, SearchField } from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";

export interface AdminDataTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

type RowKeyFunction<T> = (row: T, index?: number) => string | number;

export interface AdminDataTableProps<T> {
  columns: AdminDataTableColumn<T>[];
  rows: T[];
  rowKey: RowKeyFunction<T>;
  emptyMessage: string;
  toolbar?: ReactNode;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  exportCsv?: () => void;
  page?: number;
  take?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export default function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage,
  toolbar,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  exportCsv,
  page,
  take = 20,
  total,
  onPageChange,
}: AdminDataTableProps<T>) {
  const totalPages = total !== undefined ? Math.ceil(total / take) || 1 : 1;
  const showPagination =
    total !== undefined && totalPages > 1 && onPageChange !== undefined;
  const skip = page !== undefined ? (page - 1) * take : 0;

  return (
    <Card className="gap-0 p-0 border-[5px] border-[#eae0ff] dark:border-[#5b3491]">
      <CardHeader className="border-b border-border gap-0 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {searchTerm !== undefined && onSearchChange !== undefined && (
            <SearchField
              className="flex-1 w-full max-w-md"
              value={searchTerm}
              onChange={(val) => onSearchChange(val)}
            >
              <Label>Search</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  className="w-full"
                  placeholder={searchPlaceholder}
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          )}
          {toolbar}
          {exportCsv !== undefined && (
            <DashboardButton text="Export CSV" onClick={exportCsv} />
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className="p-4 text-left font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-4">
                    <div className="py-8 text-center text-muted-foreground">
                      {emptyMessage}
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr
                    key={rowKey(row, i)}
                    className="border-t border-[var(--color-border)] hover:bg-muted/30 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.header} className="p-4">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showPagination && (
          <div className="flex items-center justify-between border-t border-border px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {skip + 1} to {Math.min(skip + take, total!)} of {total}{" "}
              results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange!(Math.max(1, page! - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-muted)] text-foreground font-medium hover:brightness-110 disabled:opacity-50 transition"
              >
                <ArrowLeft className="h-4 w-4 mr-1 inline" /> Prev
              </button>
              <button
                onClick={() => onPageChange!(Math.min(totalPages, page! + 1))}
                disabled={page! >= totalPages}
                className="px-4 py-1.5 text-sm rounded-md bg-[var(--color-primary)] text-white font-medium hover:brightness-110 disabled:opacity-50 transition"
              >
                Next <ArrowRight className="h-4 w-4 ml-1 inline" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
