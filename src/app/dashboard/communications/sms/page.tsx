"use client";

import { useState, useEffect } from "react";
import { Send, Users, Phone, MessageSquare, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import communicationsService, { 
  ContactGroup, 
  SendSMSRequest, 
  SmsMessage,
  SmsBalance 
} from '@/lib/services/communications.service';
import { MemberService, Member } from '@/lib/services/member.service';
import { toast } from "sonner";

interface SelectedRecipient {
  id: string;
  type: 'member' | 'group' | 'phone';
  name: string;
  phoneNumber?: string;
  memberCount?: number;
}

export default function SendSMSPage() {
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<'individual' | 'group' | 'custom'>('individual');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [customPhoneNumber, setCustomPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Data
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [balance, setBalance] = useState<SmsBalance | null>(null);
  const [recentMessages, setRecentMessages] = useState<SmsMessage[]>([]);

  // Character count
  const maxLength = 160;
  const estimatedSMSCount = Math.ceil(message.length / maxLength);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch contact groups
      const groupsData = await communicationsService.getContactGroups(1, 50);
      setGroups(groupsData.groups);

      // Fetch members
      const response = await MemberService.getAll();
      const membersData = response.data;
      if (Array.isArray(membersData)) {
        setMembers(membersData);
      } else if (membersData && typeof membersData === 'object' && 'members' in membersData) {
        setMembers((membersData as any).members);
      } else {
        setMembers([]);
      }

      // Fetch balance
      const balanceData = await communicationsService.getCurrentBalance();
      setBalance(balanceData);

      // Fetch recent messages
      try {
        const messagesData = await communicationsService.getSMSHistory(1, 5);
        setRecentMessages(messagesData?.messages || []);
      } catch (messageError) {
        console.error('Error fetching recent messages:', messageError);
        setRecentMessages([]); // Ensure it's always an array
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      // Ensure all arrays are initialized even on error
      setGroups([]);
      setMembers([]);
      setRecentMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (recipientType === 'individual' && selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    if (recipientType === 'group' && selectedGroups.length === 0) {
      toast.error('Please select at least one group');
      return;
    }

    if (recipientType === 'custom' && !customPhoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      setSending(true);

      const smsData: SendSMSRequest = {
        message: message.trim(),
      };

      if (recipientType === 'individual') {
        smsData.memberIds = selectedMembers;
      } else if (recipientType === 'group') {
        smsData.groupIds = selectedGroups;
      } else if (recipientType === 'custom') {
        smsData.phoneNumber = customPhoneNumber.trim();
      }

      const result = await communicationsService.sendSMS(smsData);
      
      toast.success('SMS sent successfully!');
      
      // Reset form
      setMessage("");
      setSelectedMembers([]);
      setSelectedGroups([]);
      setCustomPhoneNumber("");
      
      // Refresh recent messages
      fetchData();

    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const handleMemberToggle = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleGroupToggle = (groupId: number) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getEstimatedCost = () => {
    let recipientCount = 0;
    
    if (recipientType === 'individual') {
      recipientCount = selectedMembers.length;
    } else if (recipientType === 'group') {
      recipientCount = selectedGroups.reduce((total, groupId) => {
        const group = groups.find(g => g.id === groupId);
        return total + (group?.memberCount || 0);
      }, 0);
    } else if (recipientType === 'custom') {
      recipientCount = customPhoneNumber ? 1 : 0;
    }

    // Assuming cost per SMS (this should come from backend)
    const costPerSMS = 50; // TSh 50 per SMS
    return recipientCount * estimatedSMSCount * costPerSMS;
  };

  const canSend = () => {
    if (!message.trim()) return false;
    if (sending) return false;
    
    if (recipientType === 'individual' && selectedMembers.length === 0) return false;
    if (recipientType === 'group' && selectedGroups.length === 0) return false;
    if (recipientType === 'custom' && !customPhoneNumber.trim()) return false;
    
    return true;
  };

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Send SMS</h1>
          <p className="text-muted-foreground">
            Send SMS messages to members or custom phone numbers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipient Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Recipients</CardTitle>
              <CardDescription>Choose how to select your recipients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={recipientType === 'individual' ? 'default' : 'outline'}
                  onClick={() => setRecipientType('individual')}
                  className="flex-1"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Select Members
                </Button>
                <Button
                  variant={recipientType === 'group' ? 'default' : 'outline'}
                  onClick={() => setRecipientType('group')}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Groups
                </Button>
                <Button
                  variant={recipientType === 'custom' ? 'default' : 'outline'}
                  onClick={() => setRecipientType('custom')}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Custom Number
                </Button>
              </div>

              {/* Individual Members Selection */}
              {recipientType === 'individual' && (
                <div className="space-y-4">
                  <Label>Select Members</Label>
                  <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2">
                    {members && members.length > 0 ? (
                      members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={selectedMembers.includes(member.id!)}
                            onCheckedChange={() => handleMemberToggle(member.id!)}
                          />
                          <Label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                            {member.fullName}
                          <span className="text-muted-foreground ml-2">
                            ({member.mobile})
                          </span>
                        </Label>
                      </div>
                    ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No members available
                      </p>
                    )}
                  </div>
                  {selectedMembers.length > 0 && (
                    <Badge variant="outline">
                      {selectedMembers.length} member(s) selected
                    </Badge>
                  )}
                </div>
              )}

              {/* Contact Groups Selection */}
              {recipientType === 'group' && (
                <div className="space-y-4">
                  <Label>Select Contact Groups</Label>
                  <div className="space-y-2">
                    {groups && groups.length > 0 ? (
                      groups.map((group) => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={selectedGroups.includes(group.id)}
                            onCheckedChange={() => handleGroupToggle(group.id)}
                          />
                          <Label htmlFor={`group-${group.id}`} className="flex-1 cursor-pointer">
                            {group.name}
                            <span className="text-muted-foreground ml-2">
                              ({group.memberCount} members)
                            </span>
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No contact groups available
                      </p>
                    )}
                  </div>
                  {selectedGroups.length > 0 && (
                    <Badge variant="outline">
                      {selectedGroups.length} group(s) selected
                    </Badge>
                  )}
                </div>
              )}

              {/* Custom Phone Number */}
              {recipientType === 'custom' && (
                <div className="space-y-4">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+255712345678"
                    value={customPhoneNumber}
                    onChange={(e) => setCustomPhoneNumber(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter phone number in international format (e.g., +255712345678)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Composition */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
              <CardDescription>Compose your SMS message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={maxLength * 3} // Allow up to 3 SMS
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {message.length} / {maxLength * 3} characters
                  </span>
                  <span>
                    {estimatedSMSCount} SMS {estimatedSMSCount > 1 ? 'messages' : 'message'}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleSendSMS} 
                disabled={!canSend()}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send SMS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Estimate */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <span className="font-medium">
                  TSh {balance && balance.currentBalance !== undefined ? balance.currentBalance.toLocaleString() : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Cost:</span>
                <span className="font-medium">
                  TSh {getEstimatedCost().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Remaining Balance:</span>
                <span className={`font-medium ${
                  (balance && balance.currentBalance !== undefined ? balance.currentBalance : 0) - getEstimatedCost() >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  TSh {((balance && balance.currentBalance !== undefined ? balance.currentBalance : 0) - getEstimatedCost()).toLocaleString()}
                </span>
              </div>
              {(balance && balance.currentBalance !== undefined ? balance.currentBalance : 0) - getEstimatedCost() < 0 && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Insufficient balance
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMessages && recentMessages.length > 0 ? (
                  recentMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {msg.status === 'delivered' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {msg.status === 'sent' && (
                          <Send className="h-4 w-4 text-blue-600" />
                        )}
                        {msg.status === 'failed' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      {msg.status === 'pending' && (
                        <div className="h-4 w-4 rounded-full border-2 border-yellow-600 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{msg.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {msg.recipientPhoneNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent messages
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
