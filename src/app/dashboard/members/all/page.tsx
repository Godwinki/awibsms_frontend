"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCwIcon, SearchIcon, FilterIcon, UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MemberService, Member } from '@/lib/services/member.service';
import { createColumns } from './columns';
import { DataTable } from './data-table';

export default function AllMembersPage() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = createColumns();

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await MemberService.getAll();
      setMembers(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(q) ||
      m.mobile?.toLowerCase().includes(q) ||
      m.nin?.toLowerCase().includes(q) ||
      m.district?.toLowerCase().includes(q) ||
      m.dateOfBirth?.toLowerCase?.().includes(q)
    );
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Member Management</h1>
          <p className="text-muted-foreground">Manage SACCO members and their details</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-background rounded-lg px-3 py-2 border">
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
          <Input
            className="border-0 bg-transparent focus:ring-0 focus:border-0"
            placeholder="Search members by name, phone, NIN, or district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh">
          <RefreshCwIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <DataTable columns={columns} data={filteredMembers} />
    </div>
  );
}


