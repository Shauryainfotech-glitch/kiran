import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Mail,
  Bell,
  Globe,
  Lock,
  Key,
  Server,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  AlertTriangle
} from "lucide-react";
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, getRoleDisplayName } from "@shared/rbac";

interface SystemUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
  lastLogin: string;
  permissions: string[];
}

interface SystemConfig {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  maxFileSize: number;
  sessionTimeout: number;
  enableRegistration: boolean;
  enableNotifications: boolean;
  enableAuditLog: boolean;
  maintenanceMode: boolean;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Mock data for demonstration - would come from API in production
  const systemUsers: SystemUser[] = [];

  const systemConfig: SystemConfig = {
    siteName: "AVGC TENDER",
    siteUrl: "https://avgctender.company.com",
    adminEmail: "admin@company.com",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    maxFileSize: 50,
    sessionTimeout: 60,
    enableRegistration: false,
    enableNotifications: true,
    enableAuditLog: true,
    maintenanceMode: false
  };

  const [config, setConfig] = useState<SystemConfig>(systemConfig);

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = () => {
    // Save configuration to API
    console.log('Saving configuration:', config);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'finance': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="h-8 w-8 mr-3 text-blue-600" />
            System Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure system settings, manage users, and control access permissions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleSaveConfig}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="system">
            <Server className="h-4 w-4 mr-2" />
            System Config
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Globe className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Server className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Eye className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              {systemUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Users Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by creating user accounts for your team members
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First User
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {getRoleDisplayName(user.role as any)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Role Definitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(ROLES).map(([key, role]) => (
                    <div key={role} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{getRoleDisplayName(role)}</h3>
                        <Badge className={getRoleBadgeColor(role)}>{role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {ROLE_PERMISSIONS[role]?.length || 0} permissions assigned
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ROLE_PERMISSIONS[role]?.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace(':', ': ')}
                          </Badge>
                        ))}
                        {(ROLE_PERMISSIONS[role]?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(ROLE_PERMISSIONS[role]?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Permission Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(PERMISSIONS).slice(0, 10).map(([key, permission]) => (
                    <div key={permission} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{permission.replace(':', ': ')}</span>
                      <div className="flex space-x-2">
                        {Object.values(ROLES).map((role) => (
                          <div
                            key={role}
                            className={`w-3 h-3 rounded-full ${
                              ROLE_PERMISSIONS[role]?.includes(permission)
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                            title={`${role}: ${ROLE_PERMISSIONS[role]?.includes(permission) ? 'Allowed' : 'Denied'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  General Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Application Name</Label>
                  <Input
                    id="siteName"
                    value={config.siteName}
                    onChange={(e) => handleConfigChange('siteName', e.target.value)}
                    placeholder="AVGC TENDER"
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Base URL</Label>
                  <Input
                    id="siteUrl"
                    value={config.siteUrl}
                    onChange={(e) => handleConfigChange('siteUrl', e.target.value)}
                    placeholder="https://tenderai.company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">System Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={config.adminEmail}
                    onChange={(e) => handleConfigChange('adminEmail', e.target.value)}
                    placeholder="admin@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Select value={config.timezone} onValueChange={(value) => handleConfigChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</SelectItem>
                      <SelectItem value="UTC">UTC (Universal Time)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST -05:00)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT +00:00)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST +04:00)</SelectItem>
                      <SelectItem value="Asia/Singapore">Asia/Singapore (SGT +08:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={config.dateFormat} onValueChange={(value) => handleConfigChange('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Indian)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Application Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={config.currency} onValueChange={(value) => handleConfigChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="AED">UAE Dirham (د.إ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxFileSize">Maximum File Upload Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={config.maxFileSize}
                    onChange={(e) => handleConfigChange('maxFileSize', parseInt(e.target.value))}
                    min="1"
                    max="500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 50MB for document uploads
                  </p>
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="480"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-logout inactive users after specified time
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableRegistration">Public Registration</Label>
                      <p className="text-xs text-muted-foreground">Allow new users to register</p>
                    </div>
                    <Switch
                      id="enableRegistration"
                      checked={config.enableRegistration}
                      onCheckedChange={(checked) => handleConfigChange('enableRegistration', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-xs text-muted-foreground">Disable access for maintenance</p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={config.maintenanceMode}
                      onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Tender Management Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Tender Settings</h3>
                  <div>
                    <Label>Default Tender Duration (days)</Label>
                    <Input type="number" defaultValue="30" min="1" max="365" />
                  </div>
                  <div>
                    <Label>Auto-publish Threshold (hours)</Label>
                    <Input type="number" defaultValue="24" min="1" max="168" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Approval for Publishing</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Tender Templates</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Financial Controls</h3>
                  <div>
                    <Label>Minimum EMD Percentage (%)</Label>
                    <Input type="number" defaultValue="2" min="0.5" max="10" step="0.5" />
                  </div>
                  <div>
                    <Label>Maximum EMD Amount (₹)</Label>
                    <Input type="number" defaultValue="10000000" min="1000" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-calculate EMD</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Finance Approval</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Workflow Automation</h3>
                  <div>
                    <Label>Auto-assign Tasks</Label>
                    <Select defaultValue="department">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="department">By Department</SelectItem>
                        <SelectItem value="workload">By Workload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable AI Recommendations</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-generate Reports</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Send Deadline Reminders</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Limits & Quotas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">User Limits</h3>
                  <div>
                    <Label>Maximum Users per Organization</Label>
                    <Input type="number" defaultValue="1000" min="1" />
                  </div>
                  <div>
                    <Label>Maximum Active Sessions per User</Label>
                    <Input type="number" defaultValue="3" min="1" max="10" />
                  </div>
                  <div>
                    <Label>Password Expiry (days)</Label>
                    <Input type="number" defaultValue="90" min="30" max="365" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Storage Limits</h3>
                  <div>
                    <Label>Total Storage Quota (GB)</Label>
                    <Input type="number" defaultValue="100" min="1" />
                  </div>
                  <div>
                    <Label>Documents per Tender</Label>
                    <Input type="number" defaultValue="50" min="1" max="200" />
                  </div>
                  <div>
                    <Label>Archive Old Data After (months)</Label>
                    <Input type="number" defaultValue="24" min="6" max="120" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Two-Factor Authentication</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Strong Passwords</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Login Monitoring</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto-lock Inactive Sessions</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>API Rate Limiting</Label>
                  <Select defaultValue="1000">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 requests/hour</SelectItem>
                      <SelectItem value="1000">1000 requests/hour</SelectItem>
                      <SelectItem value="10000">10000 requests/hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable API Key Authentication</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Log API Requests</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Tender Submissions</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Task Assignments</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Finance Alerts</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>System Updates</Label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">SMTP Configuration</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>SMTP Server</Label>
                      <Input placeholder="smtp.example.com" />
                    </div>
                    <div>
                      <Label>Port</Label>
                      <Input placeholder="587" />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input placeholder="noreply@company.com" />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  External Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Payment Gateways</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium">RZ</span>
                        </div>
                        <div>
                          <p className="font-medium">Razorpay</p>
                          <p className="text-xs text-muted-foreground">EMD & Fee Payments</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium">PP</span>
                        </div>
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-xs text-muted-foreground">International Payments</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Banking Integration</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Bank API Provider</Label>
                      <Select defaultValue="disabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="sbi">State Bank of India</SelectItem>
                          <SelectItem value="icici">ICICI Bank</SelectItem>
                          <SelectItem value="hdfc">HDFC Bank</SelectItem>
                          <SelectItem value="axis">Axis Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bank API Key</Label>
                      <Input type="password" placeholder="Enter API key" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-verify Bank Guarantees</Label>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Communication Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">SMS Gateway</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>SMS Provider</Label>
                      <Select defaultValue="disabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="textlocal">TextLocal</SelectItem>
                          <SelectItem value="msg91">MSG91</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>API Key</Label>
                      <Input type="password" placeholder="Enter SMS API key" />
                    </div>
                    <div>
                      <Label>Sender ID</Label>
                      <Input placeholder="TENDER" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Cloud Storage</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Storage Provider</Label>
                      <Select defaultValue="local">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local Storage</SelectItem>
                          <SelectItem value="aws">Amazon S3</SelectItem>
                          <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                          <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bucket/Container Name</Label>
                      <Input placeholder="tender-documents" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Enable CDN</Label>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Government Portals</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>GeM Portal Integration</Label>
                      <Input type="password" placeholder="GeM API Token" />
                    </div>
                    <div>
                      <Label>eProcurement Portal</Label>
                      <Input type="password" placeholder="eProcurement API Key" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-sync Tenders</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Real-time Status Updates</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Third-party Services</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Document Verification API</Label>
                      <Input type="password" placeholder="Verification API Key" />
                    </div>
                    <div>
                      <Label>Credit Rating API</Label>
                      <Input type="password" placeholder="Credit API Token" />
                    </div>
                    <div>
                      <Label>KYC Verification</Label>
                      <Select defaultValue="disabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="aadhaar">Aadhaar Verification</SelectItem>
                          <SelectItem value="pan">PAN Verification</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">99.8%</div>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2.3s</div>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Cache Settings</h3>
                  <div className="flex items-center justify-between">
                    <Label>Enable Redis Cache</Label>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <Label>Cache TTL (seconds)</Label>
                    <Input type="number" defaultValue="3600" min="60" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable CDN</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Database Optimization</h3>
                  <div className="flex items-center justify-between">
                    <Label>Auto-vacuum</Label>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <Label>Connection Pool Size</Label>
                    <Input type="number" defaultValue="20" min="5" max="100" />
                  </div>
                  <div>
                    <Label>Query Timeout (seconds)</Label>
                    <Input type="number" defaultValue="30" min="5" max="300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Resource Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Usage</span>
                    <span className="text-sm font-medium">34%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Alerts & Thresholds</h3>
                  <div>
                    <Label>CPU Alert Threshold (%)</Label>
                    <Input type="number" defaultValue="80" min="50" max="95" />
                  </div>
                  <div>
                    <Label>Memory Alert Threshold (%)</Label>
                    <Input type="number" defaultValue="85" min="50" max="95" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Performance Alerts</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Load Balancing</h3>
                  <div>
                    <Label>Load Balancer</Label>
                    <Select defaultValue="round-robin">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="least-connections">Least Connections</SelectItem>
                        <SelectItem value="ip-hash">IP Hash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Health Check Interval (seconds)</Label>
                    <Input type="number" defaultValue="30" min="10" max="300" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Auto-scaling</Label>
                    <Switch />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Logging & Monitoring</h3>
                  <div>
                    <Label>Log Level</Label>
                    <Select defaultValue="info">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Log Retention (days)</Label>
                    <Input type="number" defaultValue="30" min="7" max="365" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Metrics Collection</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Backup & Recovery</h3>
                  <div>
                    <Label>Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Backup Retention (days)</Label>
                    <Input type="number" defaultValue="90" min="7" max="365" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-backup Enabled</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Audit Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Audit Logging</Label>
                    <p className="text-xs text-muted-foreground">Track all system activities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label>Log Retention Period (days)</Label>
                  <Input type="number" defaultValue="365" min="30" max="2555" />
                </div>
                <div>
                  <Label>Log Level</Label>
                  <Select defaultValue="detailed">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (Login/Logout only)</SelectItem>
                      <SelectItem value="standard">Standard (CRUD operations)</SelectItem>
                      <SelectItem value="detailed">Detailed (All activities)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Track Events</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">User Authentication</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Data Modifications</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">System Configuration</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">File Operations</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Recent Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Audit Logs Available</h3>
                  <p className="text-muted-foreground mb-4">
                    System activity logs will appear here once users start interacting with the platform
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Log Categories</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• User authentication events</li>
                        <li>• Tender creation and modifications</li>
                        <li>• Financial transaction logs</li>
                        <li>• System configuration changes</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Compliance Features</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Immutable log entries</li>
                        <li>• Digital signatures</li>
                        <li>• Export capabilities</li>
                        <li>• Real-time monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Compliance & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Compliance Standards</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>ISO 27001 Compliance</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>GDPR Compliance</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>SOX Compliance</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Government Standards</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Automated Reports</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Report Frequency</Label>
                      <Select defaultValue="monthly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Email Reports</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Dashboard Alerts</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Data Retention</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Archive After (months)</Label>
                      <Input type="number" defaultValue="24" min="6" max="120" />
                    </div>
                    <div>
                      <Label>Delete After (years)</Label>
                      <Input type="number" defaultValue="7" min="3" max="50" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-archive</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Secure Deletion</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}