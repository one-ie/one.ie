import { Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  quote: string;
  author:
    | string
    | {
        name: string;
        role: string;
        company?: string;
        avatarUrl?: string;
      };
  role?: string;
  company?: string;
  rating?: number;
}

interface SocialProofProps {
  title?: string;
  testimonials?: Testimonial[];
  stats?: { label: string; value: string }[] | Record<string, string | number>;
  companyLogos?: { name: string; logoUrl: string }[];
}

/**
 * Social Proof Component
 *
 * Customer testimonials, ratings, and usage statistics.
 * Builds trust and credibility.
 *
 * Usage in MDX:
 * <SocialProof
 *   title="Trusted by Thousands"
 *   testimonials={[
 *     {
 *       quote: "Best auth system we've used",
 *       author: "Sarah Chen",
 *       role: "CTO",
 *       company: "TechCorp",
 *       rating: 5
 *     }
 *   ]}
 *   stats={[
 *     { label: "Active Users", value: "50,000+" },
 *     { label: "Uptime", value: "99.99%" }
 *   ]}
 * />
 */
export function SocialProof({
  title = "What Our Users Say",
  testimonials = [],
  stats,
  companyLogos = [],
}: SocialProofProps) {
  // Convert stats object to array if needed
  const statsArray = Array.isArray(stats)
    ? stats
    : stats
      ? Object.entries(stats).map(([label, value]) => ({
          label: label
            .replace(/([A-Z])/g, " $1")
            .trim()
            .replace(/^./, (str) => str.toUpperCase()),
          value: String(value),
        }))
      : [];

  return (
    <div className="my-12 space-y-8">
      {title && (
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <Badge variant="outline">Social Proof</Badge>
        </div>
      )}

      {/* Stats Grid */}
      {statsArray.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsArray.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Company Logos */}
      {companyLogos.length > 0 && (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {companyLogos.map((company, index) => (
              <div
                key={index}
                className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
              >
                <img src={company.logoUrl} alt={company.name} className="h-8 object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/20 mb-4" />

                {testimonial.rating && (
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}

                <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>

                <div>
                  <div className="font-semibold">
                    {typeof testimonial.author === "string"
                      ? testimonial.author
                      : testimonial.author.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {typeof testimonial.author === "string" ? (
                      <>
                        {testimonial.role}
                        {testimonial.company && ` at ${testimonial.company}`}
                      </>
                    ) : (
                      <>
                        {testimonial.author.role}
                        {testimonial.author.company && ` at ${testimonial.author.company}`}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
