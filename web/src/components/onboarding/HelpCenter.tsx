/**
 * Help Center Component
 *
 * In-app help documentation with search, categories, and popular articles.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Video, MessageCircle, ExternalLink, ChevronRight } from "lucide-react";

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: "getting-started" | "builder" | "integrations" | "analytics" | "troubleshooting";
  type: "article" | "video" | "tutorial";
  url: string;
  popular: boolean;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "create-first-funnel",
    title: "Creating Your First Funnel",
    description: "Step-by-step guide to building your first sales funnel",
    category: "getting-started",
    type: "article",
    url: "/help/articles/create-first-funnel",
    popular: true,
  },
  {
    id: "builder-basics",
    title: "Funnel Builder Basics",
    description: "Learn how to use the drag-and-drop builder",
    category: "builder",
    type: "video",
    url: "/help/videos/builder-basics",
    popular: true,
  },
  {
    id: "stripe-setup",
    title: "Setting Up Stripe Payments",
    description: "Configure Stripe to accept payments in your funnels",
    category: "integrations",
    type: "tutorial",
    url: "/help/tutorials/stripe-setup",
    popular: true,
  },
  {
    id: "custom-domain",
    title: "Adding a Custom Domain",
    description: "Connect your own domain to your funnels",
    category: "getting-started",
    type: "article",
    url: "/help/articles/custom-domain",
    popular: false,
  },
  {
    id: "email-integration",
    title: "Email Service Integration",
    description: "Connect Mailchimp, ConvertKit, or other email providers",
    category: "integrations",
    type: "article",
    url: "/help/articles/email-integration",
    popular: true,
  },
  {
    id: "analytics-guide",
    title: "Understanding Analytics",
    description: "Track and optimize your funnel performance",
    category: "analytics",
    type: "video",
    url: "/help/videos/analytics-guide",
    popular: true,
  },
  {
    id: "page-not-loading",
    title: "Page Not Loading?",
    description: "Common issues and solutions for page loading problems",
    category: "troubleshooting",
    type: "article",
    url: "/help/articles/page-not-loading",
    popular: false,
  },
  {
    id: "templates-guide",
    title: "Using Funnel Templates",
    description: "Start faster with pre-built funnel templates",
    category: "getting-started",
    type: "tutorial",
    url: "/help/tutorials/templates-guide",
    popular: true,
  },
];

const CATEGORY_LABELS = {
  "getting-started": "Getting Started",
  "builder": "Funnel Builder",
  "integrations": "Integrations",
  "analytics": "Analytics",
  "troubleshooting": "Troubleshooting",
};

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = HELP_ARTICLES.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === null || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const popularArticles = HELP_ARTICLES.filter((article) => article.popular);

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "tutorial":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">How can we help?</h1>
        <p className="mt-2 text-muted-foreground">
          Search our knowledge base or browse by category
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for help articles, videos, or tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Popular Articles */}
      {searchQuery === "" && selectedCategory === null && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Popular Articles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {popularArticles.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => window.location.href = article.url}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getIcon(article.type)}
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Browse by Category */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">
          {searchQuery ? "Search Results" : "Browse by Category"}
        </h2>

        <Tabs defaultValue="all" onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => window.location.href = article.url}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        {getIcon(article.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {article.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {CATEGORY_LABELS[article.category]}
                      </Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredArticles.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No articles found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TabsContent key={key} value={key} className="mt-6">
              <div className="space-y-3">
                {filteredArticles
                  .filter((article) => article.category === key)
                  .map((article) => (
                    <Card
                      key={article.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => window.location.href = article.url}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-primary/10 p-2">
                            {getIcon(article.type)}
                          </div>
                          <div>
                            <h3 className="font-medium">{article.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {article.description}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Contact Support */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Still need help?
          </CardTitle>
          <CardDescription>
            Our support team is here to assist you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="default">
              Contact Support
            </Button>
            <Button variant="outline">
              Join Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
