import { ColumnDef } from "@tanstack/react-table";
import { Member } from '@/lib/services/member.service';
import { Button } from '@/components/ui/button';
import { Eye, Edit, CreditCard, FileText, MoreHorizontal, Trash } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// No useRouter here since this is not a component

export const createColumns = (): ColumnDef<Member>[] => [
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: info => info.getValue() as string,
  },
  {
    accessorKey: 'mobile',
    header: 'Phone',
    cell: info => info.getValue() as string,
  },
  {
    accessorKey: 'nin',
    header: 'NIN',
    cell: info => info.getValue() as string,
  },
  {
    accessorKey: 'district',
    header: 'District',
    cell: info => info.getValue() as string,
  },
  {
    accessorKey: 'dateOfBirth',
    header: 'Date of Birth',
    cell: info => info.getValue() ? new Date(info.getValue() as string).toLocaleDateString() : '',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const member = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/dashboard/members/${member.id}`} passHref>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </Link>
            
            <Link href={`/dashboard/members/${member.id}/edit`} passHref>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Member
              </DropdownMenuItem>
            </Link>
            
            <Link href={`/dashboard/members/${member.id}/accounts`} passHref>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Accounts
              </DropdownMenuItem>
            </Link>
            
            <Link href={`/dashboard/members/${member.id}/documents`} passHref>
              <DropdownMenuItem className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Manage Documents
              </DropdownMenuItem>
            </Link>
            
            <DropdownMenuSeparator />
            
            <Link href={`/dashboard/members/${member.id}/delete`} passHref>
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete Member
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
