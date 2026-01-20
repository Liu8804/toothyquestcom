import { useState } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Baby, 
  Trophy, 
  Sparkles, 
  Target, 
  Timer,
  Plus,
  Pencil,
  Trash2,
  Shield,
  RefreshCw,
  ClipboardList,
  Gift
} from "lucide-react";
import PromoCodesAdmin from "@/components/admin/PromoCodesAdmin";
import { badgeSchema } from "@/lib/validation";

interface BadgeFormData {
  name: string;
  description: string;
  emoji: string;
  xp_required: number;
  quest_count_required: number;
}

const AdminDashboard = () => {
  const { 
    isAdmin, 
    loading, 
    stats, 
    badges, 
    users, 
    children,
    auditLogs,
    addBadge, 
    updateBadge, 
    deleteBadge,
    refreshData 
  } = useAdmin();

  const [showBadgeForm, setShowBadgeForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<string | null>(null);
  const [badgeForm, setBadgeForm] = useState<BadgeFormData>({
    name: "",
    description: "",
    emoji: "🏆",
    xp_required: 0,
    quest_count_required: 0,
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <Shield className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  const handleBadgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    // Validate with Zod
    const result = badgeSchema.safeParse(badgeForm);
    if (!result.success) {
      setFormError(result.error.errors[0]?.message || "Validation failed");
      setIsSubmitting(false);
      return;
    }

    const validatedData = result.data as {
      name: string;
      description: string;
      emoji: string;
      xp_required: number;
      quest_count_required: number;
    };

    if (editingBadge) {
      const success = await updateBadge(editingBadge, validatedData);
      if (!success) {
        setFormError("Failed to update badge");
      }
    } else {
      const newBadge = await addBadge(validatedData);
      if (!newBadge) {
        setFormError("Failed to create badge");
      }
    }

    setIsSubmitting(false);
    setShowBadgeForm(false);
    setEditingBadge(null);
    setBadgeForm({
      name: "",
      description: "",
      emoji: "🏆",
      xp_required: 0,
      quest_count_required: 0,
    });
  };

  const handleEditBadge = (badge: typeof badges[0]) => {
    setBadgeForm({
      name: badge.name,
      description: badge.description,
      emoji: badge.emoji,
      xp_required: badge.xp_required,
      quest_count_required: badge.quest_count_required,
    });
    setEditingBadge(badge.id);
    setShowBadgeForm(true);
  };

  const handleDeleteBadge = async (id: string) => {
    if (confirm("Are you sure you want to delete this badge?")) {
      await deleteBadge(id);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Users" value={stats.total_users} icon={Users} color="bg-blue-500" />
          <StatCard title="Total Children" value={stats.total_children} icon={Baby} color="bg-green-500" />
          <StatCard title="Total Badges" value={stats.total_badges} icon={Trophy} color="bg-yellow-500" />
          <StatCard title="Total XP Earned" value={stats.total_xp_earned} icon={Sparkles} color="bg-purple-500" />
          <StatCard title="Quests Completed" value={stats.total_quests_completed} icon={Target} color="bg-pink-500" />
          <StatCard title="Brushing Sessions" value={stats.total_brushing_sessions} icon={Timer} color="bg-cyan-500" />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="promo">Promo Codes</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manage Badges</h2>
            <Button onClick={() => { setShowBadgeForm(true); setEditingBadge(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Badge
            </Button>
          </div>

          {showBadgeForm && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>{editingBadge ? "Edit Badge" : "Create New Badge"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBadgeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="badgeName">Name</Label>
                      <Input
                        id="badgeName"
                        value={badgeForm.name}
                        onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                        placeholder="Badge name"
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="badgeEmoji">Emoji</Label>
                      <Input
                        id="badgeEmoji"
                        value={badgeForm.emoji}
                        onChange={(e) => setBadgeForm({ ...badgeForm, emoji: e.target.value })}
                        placeholder="🏆"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badgeDescription">Description</Label>
                    <Input
                      id="badgeDescription"
                      value={badgeForm.description}
                      onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                      placeholder="Badge description"
                      maxLength={500}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="xpRequired">XP Required</Label>
                      <Input
                        id="xpRequired"
                        type="number"
                        value={badgeForm.xp_required}
                        onChange={(e) => setBadgeForm({ ...badgeForm, xp_required: parseInt(e.target.value) || 0 })}
                        min={0}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="questCountRequired">Quest Count Required</Label>
                      <Input
                        id="questCountRequired"
                        type="number"
                        value={badgeForm.quest_count_required}
                        onChange={(e) => setBadgeForm({ ...badgeForm, quest_count_required: parseInt(e.target.value) || 0 })}
                        min={0}
                        required
                      />
                    </div>
                  </div>

                  {formError && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
                      {formError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : editingBadge ? "Update Badge" : "Create Badge"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowBadgeForm(false); setEditingBadge(null); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{badge.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditBadge(badge)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteBadge(badge.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                    <span>XP: {badge.xp_required}</span>
                    <span>Quests: {badge.quest_count_required}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <h2 className="text-xl font-semibold">Registered Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card key={user.id} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{user.avatar_emoji || "👤"}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{user.display_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Children Tab */}
        <TabsContent value="children" className="space-y-4">
          <h2 className="text-xl font-semibold">Registered Children</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <Card key={child.id} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{child.avatar_emoji || "🦷"}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age group: {child.age_group || "unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added: {new Date(child.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promo" className="space-y-4">
          <PromoCodesAdmin />
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Admin Activity Logs</h2>
          </div>
          
          {auditLogs.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                No audit logs yet. Admin actions will be recorded here.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <Card key={log.id} className="bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            log.action === 'CREATE' ? 'bg-green-500/20 text-green-500' :
                            log.action === 'UPDATE' ? 'bg-blue-500/20 text-blue-500' :
                            log.action === 'DELETE' ? 'bg-red-500/20 text-red-500' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {log.action}
                          </span>
                          <span className="font-medium text-foreground">{log.target_table}</span>
                        </div>
                        {log.details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.details.name ? `Name: ${log.details.name}` : JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminDashboard;
