import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  rating?: number;
}

interface SocialProofProps {
  title?: string;
  testimonials?: Testimonial[];
  stats?: { label: string; value: string }[];
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
  stats = []
}: SocialProofProps) {
  return (
    <div className="my-12 space-y-8">
      {title && (
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <Badge variant="outline">Social Proof</Badge>
        </div>
      )}

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                    {testimonial.company && ` at ${testimonial.company}`}
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
