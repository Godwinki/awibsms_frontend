"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserPlus,
  ArrowLeft,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import communicationsService, { 
  ContactGroup, 
  CreateGroupRequest,
  GroupMember 
} from '@/lib/services/communications.service';
import { MemberService, Member } from '@/lib/services/member.service';
import { toast } from "sonner";

export default function ContactGroupsPage() {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);
  const [viewMembersDialogOpen, setViewMembersDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Form states
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ContactGroup | null>(null);
  const [groupForm, setGroupForm] = useState<CreateGroupRequest>({
    name: "",
    description: "",
    memberIds: []
  });
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  // Helper function to reset all dialog states
  const resetDialogStates = useCallback(() => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setAddMembersDialogOpen(false);
    setViewMembersDialogOpen(false);
    setDeleteDialogOpen(false);
    setDeleteLoading(false);
    setSelectedGroup(null);
    setGroupToDelete(null);
    setGroupForm({ name: "", description: "", memberIds: [] });
    setSelectedMembers([]);
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchMembers();
  }, [page]);

  // Handle escape key to close all dialogs
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetDialogStates();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [resetDialogStates]);

  // Prevent body scroll when any dialog is open
  useEffect(() => {
    const anyDialogOpen = createDialogOpen || editDialogOpen || addMembersDialogOpen || viewMembersDialogOpen || deleteDialogOpen;
    
    if (anyDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [createDialogOpen, editDialogOpen, addMembersDialogOpen, viewMembersDialogOpen, deleteDialogOpen]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await communicationsService.getContactGroups(page, 10);
      setGroups(data?.groups || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load contact groups');
      // Ensure groups is always an array even on error
      setGroups([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await MemberService.getAll();
      const membersData = response.data;
      if (Array.isArray(membersData)) {
        setMembers(membersData);
      } else if (membersData && typeof membersData === 'object' && 'members' in membersData) {
        setMembers((membersData as any).members);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      await communicationsService.createContactGroup(groupForm);
      toast.success('Contact group created successfully');
      
      // Properly close dialog and reset states
      setCreateDialogOpen(false);
      setGroupForm({ name: "", description: "", memberIds: [] });
      
      // Small delay to ensure dialog closes before fetching
      setTimeout(() => {
        fetchGroups();
      }, 100);
      
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create contact group');
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup || !groupForm.name.trim()) return;

    try {
      await communicationsService.updateContactGroup(selectedGroup.id, groupForm);
      toast.success('Contact group updated successfully');
      
      // Properly close dialog and reset states
      setEditDialogOpen(false);
      setSelectedGroup(null);
      setGroupForm({ name: "", description: "", memberIds: [] });
      
      // Small delay to ensure dialog closes before fetching
      setTimeout(() => {
        fetchGroups();
      }, 100);
      
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update contact group');
    }
  };

  const handleDeleteGroup = (group: ContactGroup) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteGroup = async (hardDelete: boolean) => {
    if (!groupToDelete) return;

    setDeleteLoading(true);
    try {
      await communicationsService.deleteContactGroup(groupToDelete.id, hardDelete);
      toast.success(
        hardDelete 
          ? 'Contact group permanently deleted' 
          : 'Contact group deactivated successfully'
      );
      
      // Properly close dialog and reset states
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      setDeleteLoading(false);
      
      // Small delay to ensure dialog closes before fetching
      setTimeout(() => {
        fetchGroups();
      }, 100);
      
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete contact group');
      setDeleteLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (!selectedGroup || selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    try {
      await communicationsService.addMembersToGroup(selectedGroup.id, {
        memberIds: selectedMembers
      });
      toast.success('Members added successfully');
      setAddMembersDialogOpen(false);
      setSelectedMembers([]);
      fetchGroups();
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error('Failed to add members');
    }
  };

  const handleViewMembers = async (group: ContactGroup) => {
    try {
      setSelectedGroup(group);
      const members = await communicationsService.getGroupMembers(group.id);
      setGroupMembers(members);
      setViewMembersDialogOpen(true);
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load group members');
    }
  };

  const handleRemoveMember = async (groupId: number, memberId: number) => {
    try {
      await communicationsService.removeMemberFromGroup(groupId, memberId);
      toast.success('Member removed successfully');
      // Refresh the members list
      if (selectedGroup) {
        const members = await communicationsService.getGroupMembers(selectedGroup.id);
        setGroupMembers(members);
      }
      fetchGroups();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const openEditDialog = (group: ContactGroup) => {
    setSelectedGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || "",
      memberIds: []
    });
    setEditDialogOpen(true);
  };

  const openAddMembersDialog = (group: ContactGroup) => {
    setSelectedGroup(group);
    setSelectedMembers([]);
    setAddMembersDialogOpen(true);
  };

  const filteredGroups = (groups || []).filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/communications">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Contact Groups</h1>
          <p className="text-muted-foreground">
            Organize members into groups for easy messaging
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Groups ({filteredGroups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {group.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {group.memberCount} members
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={group.isActive ? "default" : "secondary"}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(group.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewMembers(group)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Members
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAddMembersDialog(group)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Members
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(group)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteGroup(group)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredGroups.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contact groups found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first contact group to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={() => {
                    if (page > 1) setPage(page - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={pageNum === page}
                    onClick={() => {
                      setPage(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={() => {
                    if (page < totalPages) setPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Contact Group</DialogTitle>
            <DialogDescription>
              Create a new contact group to organize your members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                placeholder="Enter group description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Group</DialogTitle>
            <DialogDescription>
              Update the group information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Group Name</Label>
              <Input
                id="edit-name"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                placeholder="Enter group description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGroup}>Update Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={addMembersDialogOpen} onOpenChange={setAddMembersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Members to {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Select members to add to this contact group
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {members && members.length > 0 ? (
              members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2 p-2 border rounded">
                  <Checkbox
                    checked={selectedMembers.includes(member.id!)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMembers([...selectedMembers, member.id!]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-sm text-muted-foreground">{member.mobile}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No members available</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMembersDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMembers} disabled={selectedMembers.length === 0}>
              Add {selectedMembers.length} Member(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Members Dialog */}
      <Dialog open={viewMembersDialogOpen} onOpenChange={setViewMembersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Members in {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              {groupMembers?.length || 0} members in this group
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupMembers && groupMembers.length > 0 ? (
                  groupMembers.map((groupMember) => (
                    <TableRow key={groupMember.id}>
                      <TableCell>
                        {groupMember.member ? 
                          `${groupMember.member.firstName} ${groupMember.member.lastName}` : 
                          'Unknown Member'
                        }
                      </TableCell>
                      <TableCell>{groupMember.phoneNumber}</TableCell>
                      <TableCell>
                        {new Date(groupMember.addedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(groupMember.groupId, groupMember.memberId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      <p className="text-muted-foreground">No members in this group</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewMembersDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setGroupToDelete(null);
            setDeleteLoading(false);
          }
        }}
        title="Delete Contact Group"
        itemName={groupToDelete?.name || ""}
        itemType="contact group"
        description="Choose how you want to delete this contact group."
        onConfirm={confirmDeleteGroup}
        loading={deleteLoading}
        showHardDeleteOption={true}
        consequences={[
          "All group members will be removed from this group",
          "The group will no longer be available for SMS campaigns",
          groupToDelete?.memberCount ? `${groupToDelete.memberCount} members will be affected` : "Group members will be affected"
        ]}
        warning="This group cannot be deleted if it has active SMS campaigns."
      />
    </div>
  );
}
