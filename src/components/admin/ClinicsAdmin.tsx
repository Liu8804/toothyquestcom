import { useState } from "react";
import { useAdminClinics, DentalClinic } from "@/hooks/useClinics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  website: string;
  services: string;
  welcome_message: string;
  kid_tip: string;
  is_active: boolean;
}

const emptyForm: ClinicFormData = {
  name: "",
  address: "",
  phone: "",
  website: "",
  services: "",
  welcome_message: "Welcome to our clinic! Toothy says: Keep brushing those teeth! 🦷",
  kid_tip: "Brush your teeth twice a day for a super sparkly smile! ✨",
  is_active: true,
};

const ClinicsAdmin = () => {
  const { clinics, loading, addClinic, updateClinic, deleteClinic } = useAdminClinics();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClinicFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: Partial<DentalClinic> = {
      name: form.name,
      address: form.address || null,
      phone: form.phone || null,
      website: form.website || null,
      services: form.services ? form.services.split(",").map(s => s.trim()).filter(Boolean) : [],
      welcome_message: form.welcome_message,
      kid_tip: form.kid_tip,
      is_active: form.is_active,
    };

    if (editingId) {
      await updateClinic(editingId, payload);
    } else {
      await addClinic(payload);
    }

    setIsSubmitting(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (clinic: DentalClinic) => {
    setForm({
      name: clinic.name,
      address: clinic.address || "",
      phone: clinic.phone || "",
      website: clinic.website || "",
      services: clinic.services?.join(", ") || "",
      welcome_message: clinic.welcome_message,
      kid_tip: clinic.kid_tip,
      is_active: clinic.is_active,
    });
    setEditingId(clinic.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this clinic?")) {
      await deleteClinic(id);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading clinics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Dental Clinics</h2>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Clinic
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Clinic" : "Add New Clinic"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clinic Name *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={30} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} maxLength={500} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} maxLength={500} />
              </div>
              <div className="space-y-2">
                <Label>Services (comma-separated)</Label>
                <Input value={form.services} onChange={e => setForm({ ...form, services: e.target.value })} placeholder="Cleaning, Braces, Fillings" maxLength={1000} />
              </div>
              <div className="space-y-2">
                <Label>Welcome Message (shown to kids) 🦷</Label>
                <Textarea value={form.welcome_message} onChange={e => setForm({ ...form, welcome_message: e.target.value })} maxLength={500} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Kid Tip ✨</Label>
                <Textarea value={form.kid_tip} onChange={e => setForm({ ...form, kid_tip: e.target.value })} maxLength={500} rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingId ? "Update" : "Add Clinic"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {clinics.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            No clinics yet. Add your first dental clinic!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clinics.map(clinic => (
            <Card key={clinic.id} className={`bg-card ${!clinic.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏥</span>
                      <h3 className="font-semibold text-foreground truncate">{clinic.name}</h3>
                      {!clinic.is_active && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                      )}
                    </div>
                    {clinic.address && <p className="text-sm text-muted-foreground mt-1">{clinic.address}</p>}
                    {clinic.services?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {clinic.services.slice(0, 4).map(s => (
                          <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {clinic.services.length > 4 && (
                          <span className="text-xs text-muted-foreground">+{clinic.services.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(clinic)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(clinic.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClinicsAdmin;
