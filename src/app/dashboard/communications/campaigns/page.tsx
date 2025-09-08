"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Send,
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Pause
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import communicationsService, { 
  SmsCampaign, 
  CreateCampaignRequest,
  ContactGroup 
} from '@/lib/services/communications.service';
import { MemberService, Member } from '@/lib/services/member.service';
import { toast } from "sonner";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Form states
  const [selectedCampaign, setSelectedCampaign] = useState<SmsCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<CreateCampaignRequest>({
    name: "",
    message: "",
    groupIds: [],
    memberIds: []
  });
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  useEffect(() => {
    fetchCampaigns();
    fetchGroups();
    fetchMembers();
  }, [page, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const data = await communicationsService.getCampaigns(page, 10, status);
      setCampaigns(data.campaigns);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await communicationsService.getContactGroups(1, 50);
      setGroups(data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
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

  const handleCreateCampaign = async () => {
    if (!campaignForm.name.trim() || !campaignForm.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedGroups.length === 0 && selectedMembers.length === 0) {
      toast.error('Please select at least one group or member');
      return;
    }

    try {
      const data: CreateCampaignRequest = {
        ...campaignForm,
        groupIds: selectedGroups,
        memberIds: selectedMembers
      };

      await communicationsService.createCampaign(data);
      toast.success('Campaign created successfully');
      setCreateDialogOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleEditCampaign = async () => {
    if (!selectedCampaign || !campaignForm.name.trim() || !campaignForm.message.trim()) {
      return;
    }

    try {
      await communicationsService.updateCampaign(selectedCampaign.id, campaignForm);
      toast.success('Campaign updated successfully');
      setEditDialogOpen(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const handleApproveCampaign = async (campaign: SmsCampaign) => {
    try {
      await communicationsService.approveCampaign(campaign.id);
      toast.success('Campaign approved successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast.error('Failed to approve campaign');
    }
  };

  const handleSendCampaign = async (campaign: SmsCampaign) => {
    if (!confirm(`Are you sure you want to send the campaign "${campaign.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await communicationsService.sendCampaign(campaign.id);
      toast.success('Campaign sent successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const handleCancelCampaign = async (campaign: SmsCampaign) => {
    if (!confirm(`Are you sure you want to cancel the campaign "${campaign.name}"?`)) {
      return;
    }

    try {
      await communicationsService.cancelCampaign(campaign.id);
      toast.success('Campaign cancelled successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      toast.error('Failed to cancel campaign');
    }
  };

  const handleViewCampaign = async (campaign: SmsCampaign) => {
    try {
      const data = await communicationsService.getCampaignDetails(campaign.id);
      setSelectedCampaign(data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      toast.error('Failed to load campaign details');
    }
  };

  const openEditDialog = (campaign: SmsCampaign) => {
    setSelectedCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      message: campaign.message,
      groupIds: [],
      memberIds: []
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setCampaignForm({
      name: "",
      message: "",
      groupIds: [],
      memberIds: []
    });
    setSelectedGroups([]);
    setSelectedMembers([]);
    setSelectedCampaign(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'sending': return <Clock className="h-4 w-4" />;
      case 'approved': return <Send className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.message.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">SMS Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage bulk SMS campaigns
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="sending">Sending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {campaign.message}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {campaign.totalRecipients} recipients
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(campaign.status)}
                        {campaign.status.toUpperCase()}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">
                        Sent: {campaign.totalSent}/{campaign.totalRecipients}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(campaign.totalSent / campaign.totalRecipients) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    TSh {campaign.totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.createdAt).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => handleViewCampaign(campaign)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {campaign.status === 'draft' && (
                          <>
                            <DropdownMenuItem onClick={() => openEditDialog(campaign)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApproveCampaign(campaign)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {campaign.status === 'approved' && (
                          <DropdownMenuItem onClick={() => handleSendCampaign(campaign)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Now
                          </DropdownMenuItem>
                        )}
                        
                        {(campaign.status === 'draft' || campaign.status === 'approved') && (
                          <DropdownMenuItem 
                            onClick={() => handleCancelCampaign(campaign)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first SMS campaign to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create SMS Campaign</DialogTitle>
            <DialogDescription>
              Create a new bulk SMS campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <Label htmlFor="campaign-message">Message</Label>
                <Textarea
                  id="campaign-message"
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                  placeholder="Enter your message"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {campaignForm.message.length} characters
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Select Recipients</h4>
              
              {/* Contact Groups */}
              <div>
                <Label>Contact Groups</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGroups([...selectedGroups, group.id]);
                          } else {
                            setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                          }
                        }}
                      />
                      <Label className="flex-1 cursor-pointer">
                        {group.name} ({group.memberCount} members)
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Members */}
              <div>
                <Label>Individual Members</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
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
                      <Label className="flex-1 cursor-pointer">
                        {member.fullName} ({member.mobile})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign}>Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Campaign Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name}</DialogTitle>
            <DialogDescription>Campaign Details</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedCampaign.status)}>
                    {selectedCampaign.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Total Recipients</Label>
                  <p>{selectedCampaign.totalRecipients}</p>
                </div>
                <div>
                  <Label>Messages Sent</Label>
                  <p>{selectedCampaign.totalSent}</p>
                </div>
                <div>
                  <Label>Total Cost</Label>
                  <p>TSh {selectedCampaign.totalCost.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p>{selectedCampaign.message}</p>
                </div>
              </div>
              <div>
                <Label>Created</Label>
                <p>{new Date(selectedCampaign.createdAt).toLocaleString()}</p>
              </div>
              {selectedCampaign.sentAt && (
                <div>
                  <Label>Sent At</Label>
                  <p>{new Date(selectedCampaign.sentAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
