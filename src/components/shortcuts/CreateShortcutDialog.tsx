'use client'

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Code, Navigation, Square, Phone, FileText } from 'lucide-react';
import { shortcutService, CreateShortcutData } from '@/lib/services/shortcut.service';
import { toast } from 'sonner';

interface CreateShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const actionTypeOptions = [
  { value: 'navigation', label: 'Navigation', icon: Navigation, description: 'Navigate to a page or route' },
  { value: 'modal', label: 'Modal', icon: Square, description: 'Open a modal dialog' },
  { value: 'api_call', label: 'API Call', icon: Phone, description: 'Execute an API endpoint' },
  { value: 'form', label: 'Form', icon: FileText, description: 'Open or prefill a form' }
];

const moduleOptions = [
  { value: 'global', label: 'Global' },
  { value: 'members', label: 'Members' },
  { value: 'loans', label: 'Loans' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'reports', label: 'Reports' },
  { value: 'system', label: 'System' },
  { value: 'auth', label: 'Authentication' },
  { value: 'budget', label: 'Budget' },
  { value: 'expenses', label: 'Expenses' }
];

const categoryOptions = [
  { value: 'general', label: 'General' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'members', label: 'Members' },
  { value: 'loans', label: 'Loans' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'reports', label: 'Reports' },
  { value: 'administration', label: 'Administration' },
  { value: 'system', label: 'System' },
  { value: 'tools', label: 'Tools' },
  { value: 'search', label: 'Search' },
  { value: 'operations', label: 'Operations' },
  { value: 'emergency', label: 'Emergency' }
];

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'loan_officer', label: 'Loan Officer' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'it', label: 'IT' },
  { value: 'clerk', label: 'Clerk' },
  { value: 'loan_board', label: 'Loan Board' },
];

export function CreateShortcutDialog({ isOpen, onClose, onSuccess }: CreateShortcutDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateShortcutData>({
    code: '',
    name: '',
    description: '',
    module: 'global',
    actionType: 'navigation',
    actionData: {},
    requiredRoles: [],
    category: 'general',
    icon: ''
  });

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [actionDataJson, setActionDataJson] = useState('{}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Parse action data JSON
      let parsedActionData = {};
      try {
        parsedActionData = JSON.parse(actionDataJson);
      } catch (error) {
        toast.error('Invalid JSON in action data');
        return;
      }

      const shortcutData: CreateShortcutData = {
        ...formData,
        actionData: parsedActionData,
        requiredRoles: selectedRoles
      };

      await shortcutService.createShortcut(shortcutData);
      toast.success('Shortcut created successfully');
      onSuccess();
      handleClose();
      
    } catch (error: any) {
      console.error('Error creating shortcut:', error);
      toast.error(error.response?.data?.message || 'Failed to create shortcut');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      module: 'global',
      actionType: 'navigation',
      actionData: {},
      requiredRoles: [],
      category: 'general',
      icon: ''
    });
    setSelectedRoles([]);
    setActionDataJson('{}');
    onClose();
  };

  const addRole = (role: string) => {
    if (!selectedRoles.includes(role)) {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const removeRole = (role: string) => {
    setSelectedRoles(selectedRoles.filter(r => r !== role));
  };

  const getActionDataTemplate = (actionType: string) => {
    switch (actionType) {
      case 'navigation':
        return JSON.stringify({ target: '/dashboard/example' }, null, 2);
      case 'modal':
        return JSON.stringify({ component: 'ExampleDialog', props: {} }, null, 2);
      case 'api_call':
        return JSON.stringify({ 
          endpoint: '/api/example', 
          method: 'POST', 
          confirm: true,
          message: 'Are you sure?'
        }, null, 2);
      case 'form':
        return JSON.stringify({ 
          formId: 'example-form', 
          prefill: {} 
        }, null, 2);
      default:
        return '{}';
    }
  };

  const handleActionTypeChange = (actionType: string) => {
    setFormData({ ...formData, actionType: actionType as any });
    setActionDataJson(getActionDataTemplate(actionType));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Create New Shortcut
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="action">Action Config</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Shortcut Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., 101, 205"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">Numeric code users will type to execute</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., New Member Registration"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this shortcut does"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Select value={formData.module} onValueChange={(value) => setFormData({ ...formData, module: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {moduleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon Name</Label>
                  <Input
                    id="icon"
                    placeholder="e.g., user-plus, settings"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Lucide icon name</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="action" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Action Type *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {actionTypeOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <Card 
                          key={option.value}
                          className={`cursor-pointer transition-all ${
                            formData.actionType === option.value 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => handleActionTypeChange(option.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-gray-500">{option.description}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionData">Action Configuration *</Label>
                  <Textarea
                    id="actionData"
                    placeholder="JSON configuration for the action"
                    value={actionDataJson}
                    onChange={(e) => setActionDataJson(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    JSON object containing action-specific configuration
                  </p>
                </div>

                {/* Action type specific help */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Configuration Examples</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div><strong>Navigation:</strong> <code>{`{"target": "/dashboard/members"}`}</code></div>
                    <div><strong>Modal:</strong> <code>{`{"component": "CreateMemberDialog", "props": {}}`}</code></div>
                    <div><strong>API Call:</strong> <code>{`{"endpoint": "/api/backup", "method": "POST", "confirm": true}`}</code></div>
                    <div><strong>Form:</strong> <code>{`{"formId": "loan-application", "prefill": {"amount": 100000}}`}</code></div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Required Roles</Label>
                  <p className="text-sm text-gray-500">
                    Select which roles can access this shortcut. Leave empty for all users.
                  </p>
                  
                  <div className="space-y-3">
                    <Select onValueChange={addRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add role requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions
                          .filter(role => !selectedRoles.includes(role.value))
                          .map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    {selectedRoles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedRoles.map(role => (
                          <Badge key={role} variant="secondary" className="gap-1">
                            {roleOptions.find(r => r.value === role)?.label || role}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeRole(role)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Shortcut'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
