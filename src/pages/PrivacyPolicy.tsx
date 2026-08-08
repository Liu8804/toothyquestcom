import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Eye, Users, Mail, Trash2, Globe, Link as LinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import Seo from "@/components/Seo";

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isSpanish ? 'Volver al Inicio' : 'Back to Home'}
          </Button>
        </Link>

        <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {isSpanish ? 'Política de Privacidad de ToothyQuest' : 'ToothyQuest Privacy Policy'}
            </h1>
          </div>

          <p className="text-muted-foreground mb-8">
            {isSpanish ? 'Fecha de Vigencia: 23 de Enero de 2026' : 'Effective Date: January 23, 2026'}
          </p>

          <p className="text-muted-foreground mb-8">
            {isSpanish 
              ? 'ToothyQuest ("nosotros" o "nuestro") se compromete a proteger la privacidad de nuestros usuarios, especialmente los niños. Esta Política de Privacidad explica qué información recopilamos, cómo la usamos y tus derechos.'
              : 'ToothyQuest ("we," "our," or "us") is committed to protecting the privacy of our users, especially children. This Privacy Policy explains what information we collect, how we use it, and your rights.'}
          </p>

          <div className="space-y-8">
            {/* Section 1: Information We Collect */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {isSpanish ? '1. Información que Recopilamos' : '1. Information We Collect'}
                </h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>{isSpanish ? 'Información Personal:' : 'Personal Information:'}</strong>{' '}
                    {isSpanish 
                      ? 'ToothyQuest no recopila información personal de los niños ni de los padres.'
                      : 'ToothyQuest does not collect personal information from children or parents.'}
                  </li>
                  <li>
                    <strong>{isSpanish ? 'Información No Personal:' : 'Non-Personal Information:'}</strong>{' '}
                    {isSpanish 
                      ? 'Podemos recopilar datos anónimos sobre el uso de la app (por ejemplo, progreso en los juegos, niveles completados o desempeño de la app) para mejorar la experiencia.'
                      : 'We may collect anonymous usage data (like game progress, levels completed, or app performance) to improve the app experience.'}
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2: How We Use Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {isSpanish ? '2. Cómo Usamos la Información' : '2. How We Use Information'}
                </h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    {isSpanish 
                      ? 'Para mejorar las funciones de la app, corregir errores y hacer la experiencia más divertida para los niños.'
                      : 'To improve app features, fix bugs, and make the app more fun for kids.'}
                  </li>
                  <li>
                    {isSpanish 
                      ? 'Los datos de uso son anónimos y nunca se asocian con la identidad de un niño.'
                      : 'Usage data is anonymous and never tied to a child\'s identity.'}
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: Sharing Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {isSpanish ? '3. Compartir Información' : '3. Sharing Information'}
                </h2>
              </div>
              <div className="text-muted-foreground">
                <p>
                  {isSpanish 
                    ? 'No compartimos datos personales ni de uso con terceros.'
                    : 'We do not share personal or usage data with any third parties.'}
                </p>
              </div>
            </section>

            {/* Section 4: Security */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {isSpanish ? '4. Seguridad' : '4. Security'}
                </h2>
              </div>
              <div className="text-muted-foreground">
                <p>
                  {isSpanish 
                    ? 'Implementamos medidas razonables para proteger los datos contra accesos no autorizados o pérdida.'
                    : 'We implement reasonable measures to protect data from unauthorized access or loss.'}
                </p>
              </div>
            </section>

            {/* Section 5: External Links */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {isSpanish ? '5. Enlaces Externos' : '5. External Links'}
                </h2>
              </div>
              <div className="text-muted-foreground">
                <p>
                  {isSpanish 
                    ? 'La app puede contener enlaces a sitios web externos; no somos responsables de las prácticas de privacidad de esos sitios.'
                    : 'Our app may contain links to external websites; we are not responsible for the privacy practices of those sites.'}
                </p>
              </div>
            </section>

            {/* Section 6: Contact Us */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {isSpanish ? '6. Contáctanos' : '6. Contact Us'}
                </h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish 
                    ? 'Si tienes alguna pregunta o inquietud sobre esta Política de Privacidad, contáctanos en:'
                    : 'If you have any questions or concerns about this Privacy Policy, please contact us at:'}
                </p>
                <p className="font-medium">
                  {isSpanish ? 'Correo electrónico:' : 'Email:'} marliudlewis@gmail.com
                </p>
              </div>
            </section>

            {/* Section 7: Privacy Policy URL */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {isSpanish ? '7. URL de la Política de Privacidad' : '7. Privacy Policy URL'}
                </h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish 
                    ? 'Esta política de privacidad está disponible en:'
                    : 'This privacy policy is available at:'}
                </p>
                <p className="font-medium text-primary">
                  https://toothyquest.com/privacy
                </p>
              </div>
            </section>

            {/* Data Retention Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {isSpanish ? 'Retención y Eliminación de Datos' : 'Data Retention & Deletion'}
                </h2>
              </div>
              <div className="text-muted-foreground space-y-3">
                <p>
                  {isSpanish ? 'Tienes control total sobre tus datos:' : 'You have full control over your data:'}
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    {isSpanish 
                      ? 'Elimina perfiles de niños desde el Panel de Padres en cualquier momento'
                      : 'Delete child profiles from the Parent Dashboard at any time'}
                  </li>
                  <li>
                    {isSpanish 
                      ? 'Solicita la eliminación completa de la cuenta contactándonos'
                      : 'Request complete account deletion by contacting us'}
                  </li>
                  <li>
                    {isSpanish 
                      ? 'Las cuentas inactivas pueden eliminarse después de 2 años de inactividad'
                      : 'Inactive accounts may be removed after 2 years of inactivity'}
                  </li>
                  <li>
                    {isSpanish 
                      ? 'Los datos eliminados se remueven permanentemente en 30 días'
                      : 'Deleted data is permanently removed within 30 days'}
                  </li>
                </ul>
              </div>
            </section>

            {/* Changes to Policy */}
            <section className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {isSpanish ? 'Cambios a Esta Política' : 'Changes to This Policy'}
              </h2>
              <p className="text-muted-foreground">
                {isSpanish 
                  ? 'Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos de cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Vigencia". El uso continuado de ToothyQuest después de los cambios constituye aceptación de la política actualizada.'
                  : 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date". Continued use of ToothyQuest after changes constitutes acceptance of the updated policy.'}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
