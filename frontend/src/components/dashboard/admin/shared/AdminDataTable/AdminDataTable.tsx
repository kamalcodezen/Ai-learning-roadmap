"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DashboardButton } from "@/src/components/dashboard/shared/patterns";
import { Label, SearchField } from "@heroui/react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/Card";
import "../../admin.css";

export interface AdminDataTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
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
  className?: string;
  scrollable?: boolean;
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
  className,
  scrollable = false,
}: AdminDataTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalPages = total !== undefined ? Math.ceil(total / take) || 1 : 1;
  const showPagination =
    total !== undefined && totalPages > 1 && onPageChange !== undefined;
  const skip = page !== undefined ? (page - 1) * take : 0;

  useEffect(() => {
    if (!scrollable) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (!scrollRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: contentRef.current,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [scrollable, rows]);

  return (
    <Card
      className={`!p-0 ${
        scrollable
          ? "h-[calc(100vh-320px)] min-h-[480px] flex flex-col rounded-lg border-2 border-background shadow-none dashboard-card overflow-hidden"
          : "rounded-lg border-2 border-background shadow-none dashboard-card"
      } ${className || ""}`}
    >
      <CardHeader className="border-b border-border/40 gap-0 p-4 shrink-0 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {searchTerm !== undefined && onSearchChange !== undefined && (
            <SearchField
              className="flex-1 w-full max-w-md"
              value={searchTerm}
              onChange={(val) => onSearchChange(val)}
            >
              <Label>Search</Label>
              <SearchField.Group
                className="rounded-lg! [border-radius:0.5rem]! transition-none!"
                style={{ borderRadius: "0.5rem", transition: "none" }}
              >
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
            <DashboardButton
              text="Export CSV"
              onClick={exportCsv}
              className="shrink-0"
            />
          )}
        </div>
      </CardHeader>

      <CardContent
        className={`flex flex-col !p-0 relative z-10 ${
          scrollable ? "h-full min-h-0 flex-1" : ""
        }`}
      >
        <div
          ref={scrollable ? scrollRef : undefined}
          className={
            scrollable
              ? "min-h-0 flex-1 overflow-y-scroll overflow-x-auto"
              : "overflow-x-auto"
          }
        >
          <div
            ref={scrollable ? contentRef : undefined}
            className={scrollable ? "min-h-full" : undefined}
          >
            <table className="w-full min-w-[600px] border-collapse">
              <thead
                className={
                  scrollable
                    ? "sticky top-0 bg-card z-10 border-b border-border/40 shadow-xs"
                    : undefined
                }
              >
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.header}
                      className={`p-4 font-medium text-sm text-[var(--color-text-primary)] uppercase tracking-wider ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                            ? "text-right"
                            : "text-left"
                      } ${col.className || ""}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={scrollable ? "divide-y divide-border/40" : undefined}>
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
                        <td
                          key={col.header}
                          className={`p-4 ${
                            col.align === "center"
                              ? "text-center"
                              : col.align === "right"
                                ? "text-right"
                                : "text-left"
                          } ${col.className || ""}`}
                        >
                          {col.render(row)} 
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showPagination && (
          <div className="flex items-center justify-between border-t border-border px-4 py-4 shrink-0">
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
