import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Leave {
  id: string;
  requestNumber: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  type: string;
  reason: string;
  status: string;
  createdAt: Date;
  user?: {
    firstName: string;
    lastName: string;
    department?: string;
  };
  requestedBy?: {
    firstName: string;
    lastName: string;
    department?: string;
  };
}

interface LeavesTableProps {
  leaves: Leave[];
  isLoading?: boolean;
  emptyText?: string;
}

export function LeavesTable({ leaves, isLoading, emptyText }: LeavesTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'PENDING': 'default',
      'APPROVED': 'success',
      'REJECTED': 'destructive'
    };
    return (
      <Badge variant={variants[status] as any || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!leaves || leaves.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">{emptyText || 'No leave requests found.'}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request #</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested By</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaves.map((leave) => (
          <TableRow key={leave.id}>
            <TableCell className="font-medium">{leave.requestNumber}</TableCell>
            <TableCell>{leave.type}</TableCell>
            <TableCell>{formatDate(new Date(leave.startDate))}</TableCell>
            <TableCell>{formatDate(new Date(leave.endDate))}</TableCell>
            <TableCell>{getStatusBadge(leave.status)}</TableCell>
            <TableCell>{leave.requestedBy ? `${leave.requestedBy.firstName} ${leave.requestedBy.lastName}` : (leave.user ? `${leave.user.firstName} ${leave.user.lastName}` : '-')}</TableCell>
            <TableCell>
              <Link 
                href={`/dashboard/leaves/${leave.id}`}
                className="text-primary hover:underline"
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
