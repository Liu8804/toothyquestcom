import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useClinics, DentalClinic } from "@/hooks/useClinics";
import { useAuth } from "@/hooks/useAuth";
import { useStickerRewards } from "@/hooks/useStickerRewards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, MapPin, Phone, Globe, Clock, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import mascotWaving from "@/assets/mascot-sticker-waving-v2.png";

const ClinicCard = ({
  clinic,
  isFav,
  onToggleFav,
  onSelect,
}: {
  clinic: DentalClinic;
  isFav: boolean;
  onToggleFav: () => void;
  onSelect: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card className="bg-card cursor-pointer border-border hover:border-primary/50 transition-colors" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              🏥
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-foreground truncate">{clinic.name}</h3>
              {clinic.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {clinic.address}
                </p>
              )}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label={isFav ? "Remove clinic from favorites" : "Save clinic as favorite"}
            aria-pressed={isFav}
            onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
          >
            <Heart className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </Button>
        </div>
        {clinic.services?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {clinic.services.slice(0, 3).map(s => (
              <span key={s} className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const ClinicProfile = ({
  clinic,
  isFav,
  onToggleFav,
  onBack,
}: {
  clinic: DentalClinic;
  isFav: boolean;
  onToggleFav: () => void;
  onBack: () => void;
}) => {
  const [showKidView, setShowKidView] = useState(false);
  const { awardClinicVisitSticker, getStickerInfo } = useStickerRewards();
  const hasAwardedRef = useRef(false);

  // Award sticker + XP when kid view is opened for the first time this session
  useEffect(() => {
    if (showKidView && !hasAwardedRef.current) {
      hasAwardedRef.current = true;
      const newSticker = awardClinicVisitSticker();
      if (newSticker) {
        const info = getStickerInfo(newSticker);
        toast.success(`🎉 New sticker unlocked: ${info?.emoji} ${info?.name}!`, {
          description: "+15 Sparkle Points for visiting your clinic!",
          duration: 4000,
        });
      } else {
        toast.success("⭐ +15 Sparkle Points!", {
          description: "Thanks for visiting your clinic!",
          duration: 3000,
        });
      }
    }
  }, [showKidView, awardClinicVisitSticker, getStickerInfo]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Back to clinic list" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold text-foreground flex-1 truncate">{clinic.name}</h2>
        <Button size="icon" variant="ghost" aria-label={isFav ? "Remove clinic from favorites" : "Save clinic as favorite"} aria-pressed={isFav} onClick={onToggleFav}>
          <Heart className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
        </Button>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <Button
          variant={!showKidView ? "default" : "outline"}
          size="sm"
          onClick={() => setShowKidView(false)}
          className="rounded-full"
        >
          👨‍👩‍👧 Parent View
        </Button>
        <Button
          variant={showKidView ? "default" : "outline"}
          size="sm"
          onClick={() => setShowKidView(true)}
          className="rounded-full"
        >
          🧒 Kid View
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showKidView ? (
          /* Kid View */
          <motion.div
            key="kid"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-4"
          >
            <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <motion.img
                  src={mascotWaving}
                  alt="Toothy"
                  className="w-24 h-24 mx-auto"
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold font-display text-foreground">
                    🦷 Hey there, superstar!
                  </h3>
                  <p className="text-lg text-foreground/80 font-medium">
                    {clinic.welcome_message}
                  </p>
                </div>
                <motion.div
                  className="bg-card rounded-2xl p-4 shadow-sm"
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                >
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-star" />
                    <span className="font-bold text-foreground">Toothy's Tip!</span>
                    <Sparkles className="w-5 h-5 text-star" />
                  </div>
                  <p className="text-muted-foreground">{clinic.kid_tip}</p>
                </motion.div>
                <Button onClick={onBack} variant="hero" size="lg" className="mt-4">
                  🎮 Back to Games!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Parent View */
          <motion.div
            key="parent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-3"
          >
            <Card className="bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                    🏥
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{clinic.name}</h3>
                    {clinic.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {clinic.address}
                      </p>
                    )}
                  </div>
                </div>

                {clinic.phone && (
                  <a href={`tel:${clinic.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Phone className="w-4 h-4" /> {clinic.phone}
                  </a>
                )}

                {clinic.website && (
                  <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Globe className="w-4 h-4" /> Visit Website
                  </a>
                )}

                {clinic.services?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                      <Star className="w-4 h-4 text-star" /> Services
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {clinic.services.map(s => (
                        <span key={s} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {clinic.hours && Object.keys(clinic.hours).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Hours
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(clinic.hours).map(([day, time]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{day}</span>
                          <span className="text-foreground">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Clinics = () => {
  const navigate = useNavigate();
  const { clinics, loading, toggleFavorite, isFavorite } = useClinics();
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<DentalClinic | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" aria-label={selectedClinic ? "Back to clinic list" : "Back to home"} onClick={() => selectedClinic ? setSelectedClinic(null) : navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <h1 className="text-lg font-bold font-display text-foreground">
              {selectedClinic ? selectedClinic.name : "Find Your Clinic"}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {selectedClinic ? (
            <ClinicProfile
              key="profile"
              clinic={selectedClinic}
              isFav={isFavorite(selectedClinic.id)}
              onToggleFav={() => toggleFavorite(selectedClinic.id)}
              onBack={() => setSelectedClinic(null)}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground text-center">
                Browse dental clinics and save your favorite for a personalized experience! 🦷
              </p>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                </div>
              ) : clinics.length === 0 ? (
                <Card className="bg-card">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <span className="text-4xl block mb-3">🏥</span>
                    No clinics available yet. Check back soon!
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {clinics.map(clinic => (
                    <ClinicCard
                      key={clinic.id}
                      clinic={clinic}
                      isFav={isFavorite(clinic.id)}
                      onToggleFav={() => toggleFavorite(clinic.id)}
                      onSelect={() => setSelectedClinic(clinic)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Clinics;
