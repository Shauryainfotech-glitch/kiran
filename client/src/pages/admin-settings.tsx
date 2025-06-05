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
    siteName: "TenderAI Pro",
    siteUrl: "https://tenderai.example.com",
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
        <TabsList className="grid w-full grid-cols-6">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={config.siteName}
                      onChange={(e) => handleConfigChange('siteName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      value={config.siteUrl}
                      onChange={(e) => handleConfigChange('siteUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={config.adminEmail}
                      onChange={(e) => handleConfigChange('adminEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={config.timezone} onValueChange={(value) => handleConfigChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={config.currency} onValueChange={(value) => handleConfigChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={config.maxFileSize}
                      onChange={(e) => handleConfigChange('maxFileSize', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={config.sessionTimeout}
                      onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableRegistration">Enable User Registration</Label>
                      <Switch
                        id="enableRegistration"
                        checked={config.enableRegistration}
                        onCheckedChange={(checked) => handleConfigChange('enableRegistration', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <Switch
                        id="maintenanceMode"
                        checked={config.maintenanceMode}
                        onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
                      />
                    </div>
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

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Eye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Audit Logs</h3>
                <p className="text-muted-foreground mb-4">
                  System activity logs will appear here once users start interacting with the platform
                </p>
                <div className="flex items-center justify-between">
                  <Label>Enable Audit Logging</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}