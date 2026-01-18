import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Users, Mail, Trash2 } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
          </div>

          <p className="text-muted-foreground mb-8">
            Last updated: January 18, 2026
          </p>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  ToothyQuest collects minimal information necessary to provide our dental education 
                  services for children:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Parent Account:</strong> Email address and display name for authentication</li>
                  <li><strong>Child Profiles:</strong> First name, birth year, and avatar selection</li>
                  <li><strong>Progress Data:</strong> Brushing sessions, quest completions, and earned badges</li>
                  <li><strong>Game Scores:</strong> Performance data from educational games</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">How We Protect Your Data</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>We take data security seriously, especially for children's information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All data is encrypted in transit and at rest</li>
                  <li>Row-level security ensures users only access their own data</li>
                  <li>We never share personal information with third parties</li>
                  <li>Regular security audits are performed on our systems</li>
                  <li>Admin actions are logged for accountability</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Children's Privacy (COPPA)</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  ToothyQuest is designed for use by children under parental supervision. We comply 
                  with the Children's Online Privacy Protection Act (COPPA):
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Parents must create accounts and add child profiles</li>
                  <li>Children cannot directly provide personal information</li>
                  <li>We collect only information necessary for the educational experience</li>
                  <li>Parents can view, modify, or delete their children's data at any time</li>
                  <li>We do not use children's data for advertising or marketing</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Data Retention & Deletion</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  You have full control over your data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Delete child profiles from the Parent Dashboard at any time</li>
                  <li>Request complete account deletion by contacting us</li>
                  <li>Inactive accounts may be removed after 2 years of inactivity</li>
                  <li>Deleted data is permanently removed within 30 days</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  If you have questions about this Privacy Policy or wish to exercise your data rights, 
                  please contact us:
                </p>
                <p className="font-medium">
                  Email: privacy@toothyquest.com
                </p>
              </div>
            </section>

            <section className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" 
                date. Continued use of ToothyQuest after changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
