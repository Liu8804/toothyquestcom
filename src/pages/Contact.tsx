import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Send, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission (in production, this would send to an API)
    try {
      // Create mailto link with form data
      const mailtoLink = `mailto:hello@toothyquest.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
      )}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.back', 'Back to Home')}
            </Button>
          </Link>

          <div className="max-w-xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              {t('contactPage.success.title', 'Almost there — finish in your email app ✉️')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('contactPage.success.message', "We opened your email app with the message pre-filled. It hasn't been sent yet — press send there and we'll reply as soon as we can.")}
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="outline">
              {t('contactPage.form.submit', 'Write Another Message')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Back to Home')}
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              {t('contactPage.title', 'Contact Us')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('contactPage.subtitle', "We'd love to hear from you! Send us a message and we'll get back to you soon.")}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-card mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('contactPage.form.name', 'Your Name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('contactPage.form.namePlaceholder', 'Enter your name')}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('contactPage.form.email', 'Email Address')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contactPage.form.emailPlaceholder', 'your@email.com')}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">{t('contactPage.form.subject', 'Subject')}</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t('contactPage.form.subjectPlaceholder', 'What is this about?')}
                  className={errors.subject ? "border-destructive" : ""}
                />
                {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t('contactPage.form.message', 'Message')}</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('contactPage.form.messagePlaceholder', "Tell us what's on your mind...")}
                  rows={6}
                  className={errors.message ? "border-destructive" : ""}
                />
                {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                <Send className="w-4 h-4" />
                {isSubmitting 
                  ? t('contactPage.form.sending', 'Opening your email app...') 
                  : t('contactPage.form.submit', 'Compose in Email App')}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t('contactPage.form.mailtoHint', 'This opens your email app with the message pre-filled — you still need to press send there.')}
              </p>

            </form>
          </div>

          {/* Additional Contact Info */}
          <div className="bg-card rounded-2xl p-6 shadow-card text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">
              {t('contactPage.info.title', 'Other Ways to Reach Us')}
            </h2>
            <p className="text-muted-foreground">
              {t('contactPage.info.email', 'Email us directly at')}{" "}
              <a href="mailto:hello@toothyquest.com" className="text-primary hover:underline font-medium">
                hello@toothyquest.com
              </a>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('contactPage.info.response', 'We typically respond within 24-48 hours.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
