import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface DentalClinic {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  hours: Record<string, string>;
  services: string[];
  welcome_message: string;
  kid_tip: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserClinicSelection {
  id: string;
  user_id: string;
  clinic_id: string;
  is_favorite: boolean;
  created_at: string;
}

export const useClinics = () => {
  const [clinics, setClinics] = useState<DentalClinic[]>([]);
  const [favorites, setFavorites] = useState<UserClinicSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dental_clinics" as any)
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      setClinics(data as unknown as DentalClinic[]);
    }
    setLoading(false);
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_clinic_selections" as any)
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      setFavorites(data as unknown as UserClinicSelection[]);
    }
  }, [user]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (clinicId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save favorites." });
      return;
    }

    const existing = favorites.find(f => f.clinic_id === clinicId);
    if (existing) {
      if (existing.is_favorite) {
        // Remove favorite
        await supabase
          .from("user_clinic_selections" as any)
          .update({ is_favorite: false } as any)
          .eq("id", existing.id);
      } else {
        await supabase
          .from("user_clinic_selections" as any)
          .update({ is_favorite: true } as any)
          .eq("id", existing.id);
      }
    } else {
      await supabase
        .from("user_clinic_selections" as any)
        .insert({ user_id: user.id, clinic_id: clinicId, is_favorite: true } as any);
    }
    await fetchFavorites();
  }, [user, favorites, fetchFavorites, toast]);

  const favoriteClinic = favorites.find(f => f.is_favorite);
  const favoriteClinicData = favoriteClinic
    ? clinics.find(c => c.id === favoriteClinic.clinic_id)
    : null;

  return {
    clinics,
    favorites,
    favoriteClinicData,
    loading,
    toggleFavorite,
    isFavorite: (clinicId: string) => favorites.some(f => f.clinic_id === clinicId && f.is_favorite),
    refetch: fetchClinics,
  };
};

// Admin hook for clinic management
export const useAdminClinics = () => {
  const [clinics, setClinics] = useState<DentalClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dental_clinics" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClinics(data as unknown as DentalClinic[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addClinic = useCallback(async (clinic: Partial<DentalClinic>) => {
    const { error } = await supabase
      .from("dental_clinics" as any)
      .insert(clinic as any);
    if (error) {
      toast({ title: "Error", description: "Failed to add clinic", variant: "destructive" });
      return false;
    }
    toast({ title: "Clinic added! 🏥" });
    await fetchAll();
    return true;
  }, [fetchAll, toast]);

  const updateClinic = useCallback(async (id: string, updates: Partial<DentalClinic>) => {
    const { error } = await supabase
      .from("dental_clinics" as any)
      .update(updates as any)
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to update clinic", variant: "destructive" });
      return false;
    }
    toast({ title: "Clinic updated! ✅" });
    await fetchAll();
    return true;
  }, [fetchAll, toast]);

  const deleteClinic = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("dental_clinics" as any)
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete clinic", variant: "destructive" });
      return false;
    }
    toast({ title: "Clinic deleted" });
    await fetchAll();
    return true;
  }, [fetchAll, toast]);

  return { clinics, loading, addClinic, updateClinic, deleteClinic, refetch: fetchAll };
};
