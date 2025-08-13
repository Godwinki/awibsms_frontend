"use client";
import { useState, useEffect } from "react";
import { LeavesTable, Leave } from "../../components/LeavesTable";
import { leaveService } from "@/lib/services/leave.service";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

export default function PendingLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filtered, setFiltered] = useState<Leave[]>([]);

  useEffect(() => {
    const fetchLeaves = async () => {
      setIsLoading(true);
      const all = await leaveService.getLeaveRequests({ status: "PENDING" });
      setLeaves(all);
      setIsLoading(false);
    };
    fetchLeaves();
  }, []);

  useEffect(() => {
    let result = leaves;
    // Search filter
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(l =>
        (l.user?.firstName?.toLowerCase().includes(s) || "") ||
        (l.user?.lastName?.toLowerCase().includes(s) || "") ||
        (l.requestNumber?.toLowerCase().includes(s) || "") ||
        (l.type?.toLowerCase().includes(s) || "") ||
        (l.reason?.toLowerCase().includes(s) || "")
      );
    }
    // Date filter
    if (dateRange?.from && dateRange?.to) {
      result = result.filter(l => {
        const created = new Date(l.createdAt);
        return created >= dateRange.from! && created <= dateRange.to!;
      });
    }
    setFiltered(result);
  }, [search, dateRange, leaves]);

  return (
    <div className="space-y-6">
      <div>
        <a href="/dashboard/leaves" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </a>
      </div>
      <h2 className="text-2xl font-bold">Pending Leave Requests</h2>
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by name, request #, type, reason..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>
      <div className="rounded-md border">
        <LeavesTable leaves={filtered} isLoading={isLoading} emptyText="No pending leave requests found." />
      </div>
    </div>
  );
}
