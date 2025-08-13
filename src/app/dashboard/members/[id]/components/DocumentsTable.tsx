import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Document } from '@/lib/services/member.service';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, RefreshCw } from "lucide-react";

interface DocumentsTableProps {
  documents: Document[];
  documentsLoading: boolean;
  canManageMembers: () => boolean;
}

export function DocumentsTable({ documents, documentsLoading, canManageMembers }: DocumentsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Member Documents</CardTitle>
        {canManageMembers() && (
          <Button size="sm" variant="outline" disabled>
            <FileText className="h-4 w-4 mr-1" />
            Upload Document
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {documentsLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No documents found for this member</p>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.documentType || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : doc.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {doc.status || 'unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {doc.verifiedBy ? 'Staff #' + doc.verifiedBy : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
