import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes! ToothyQuest is a one-time purchase, so there's no subscription to cancel. Once you purchase, you have lifetime access to all the content included in your plan. If you ever need a refund, contact us within 14 days of purchase.",
  },
  {
    question: "What is included in Premium?",
    answer: "Premium includes full access to all 50+ quests, mini-games, the complete rewards system with points, badges, streaks, and Tooth Pets, daily challenges, parent progress dashboard, and all future content updates. It's everything your child needs to learn healthy dental habits through fun!",
  },
  {
    question: "Can I switch from monthly to annual?",
    answer: "Since ToothyQuest uses one-time purchases rather than recurring subscriptions, you can purchase the annual plan anytime for the best value. If you've already purchased monthly, contact us and we'll help you upgrade with a prorated credit.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Every user gets 5 FREE quests to try before purchasing. This lets your child experience the fun and educational content before you decide to unlock the full adventure.",
  },
  {
    question: "What ages is ToothyQuest designed for?",
    answer: "ToothyQuest is designed for children ages 4-10. The content is educational, age-appropriate, and parent-approved. Younger children may need some help from parents, while older kids can enjoy it independently.",
  },
  {
    question: "How do I manage my purchase or get a receipt?",
    answer: "After making a purchase, you can access the Subscription Management portal from your profile. There you can view payment history, download receipts, and update your payment information if needed.",
  },
  {
    question: "Why did the price change to $4.99?",
    answer: "We've added over 50+ quests, new mini-games, a complete rewards system with Tooth Pets, and much more content! The new price reflects all this additional value. Existing subscribers who purchased at $3.99 keep their original price forever as a thank you for being early supporters.",
  },
  {
    question: "Is my payment secure?",
    answer: "Absolutely! All payments are processed through Stripe, a leading payment processor trusted by millions of businesses worldwide. We never store your credit card information. Your payment is protected by bank-level encryption.",
  },
];

const PricingFAQ = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <span className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
          ❓ FAQ
        </span>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Frequently Asked Questions
        </h3>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about ToothyQuest Premium
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqItems.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border rounded-xl px-4 bg-card/50 hover:bg-card transition-colors"
          >
            <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className="text-muted-foreground">
          Still have questions?{" "}
          <a
            href="mailto:support@toothyquest.com"
            className="text-primary hover:underline font-medium"
          >
            Contact us
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PricingFAQ;
