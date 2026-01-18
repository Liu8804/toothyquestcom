import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, AlertTriangle, Scale, UserCheck, Ban, RefreshCw } from "lucide-react";

const TermsOfService = () => {
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
            <FileText className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Terms of Service</h1>
          </div>

          <p className="text-muted-foreground mb-8">
            Last updated: January 18, 2026
          </p>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Agreement to Terms</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  By accessing or using ToothyQuest, you agree to be bound by these Terms of Service. 
                  If you disagree with any part of these terms, you may not access the service.
                </p>
                <p>
                  ToothyQuest is designed as an educational tool to help children develop healthy 
                  dental hygiene habits. It is not a substitute for professional dental care or advice.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">User Accounts</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>When you create an account with us, you must:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                  <li>Provide accurate, complete, and current information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
                <p>
                  Parent accounts are responsible for managing child profiles and supervising 
                  children's use of the application.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Acceptable Use</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>You agree to use ToothyQuest only for lawful purposes. You must not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the service in any way that violates applicable laws or regulations</li>
                  <li>Attempt to gain unauthorized access to any part of the service</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Transmit any malicious code or harmful content</li>
                  <li>Impersonate another person or entity</li>
                  <li>Use the service for any commercial purposes without authorization</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Ban className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  ToothyQuest and its original content, features, and functionality are owned by 
                  ToothyQuest and are protected by international copyright, trademark, and other 
                  intellectual property laws.
                </p>
                <p>
                  You may not copy, modify, distribute, sell, or lease any part of our service 
                  or included software, nor may you reverse engineer or attempt to extract the 
                  source code of that software.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Service Modifications</h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>We reserve the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Modify or discontinue the service at any time without notice</li>
                  <li>Change features, functionality, or content of the service</li>
                  <li>Impose limits on certain features or restrict access</li>
                  <li>Terminate accounts that violate these terms</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Disclaimer of Warranties</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  ToothyQuest is provided "as is" and "as available" without warranties of any kind, 
                  either express or implied. We do not warrant that the service will be uninterrupted, 
                  secure, or error-free.
                </p>
                <p>
                  <strong>Medical Disclaimer:</strong> ToothyQuest is an educational tool and does 
                  not provide medical or dental advice. Always consult with a qualified dental 
                  professional for your child's dental health needs.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no event shall ToothyQuest, its directors, employees, partners, agents, suppliers, 
                or affiliates be liable for any indirect, incidental, special, consequential, or 
                punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the 
                United States, without regard to its conflict of law provisions. Any disputes 
                arising from these terms will be resolved in the courts of the United States.
              </p>
            </section>

            <section className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at:{" "}
                <span className="font-medium">legal@toothyquest.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
