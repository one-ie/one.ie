import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Book,
  Code,
  FileText,
  Search,
  Download,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface FunctionDoc {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
    default?: string;
  }[];
  returns: {
    type: string;
    description: string;
  };
  example: string;
}

interface PluginDocumentationProps {
  pluginId: string;
  pluginName: string;
  overview: string;
  installation: string;
  configuration: {
    name: string;
    type: string;
    description: string;
    required: boolean;
    default?: string;
  }[];
  actions: FunctionDoc[];
  providers: FunctionDoc[];
  examples: {
    title: string;
    description: string;
    code: string;
  }[];
  troubleshooting: {
    question: string;
    answer: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
}

export function PluginDocumentationGenerator({
  pluginId,
  pluginName,
  overview,
  installation,
  configuration,
  actions,
  providers,
  examples,
  troubleshooting,
  faq,
}: PluginDocumentationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exportDocs = () => {
    // Generate markdown documentation
    const markdown = `# ${pluginName} Documentation\n\n${overview}\n\n## Installation\n\n${installation}\n\n...`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pluginId}-docs.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highlightCode = (code: string) => {
    // Simple syntax highlighting (in production, use a library like Prism.js)
    return code;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pluginName}</h1>
          <p className="text-muted-foreground mt-1">
            Auto-generated documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportDocs}>
            <Download className="w-4 h-4 mr-2" />
            Export Markdown
          </Button>
        </div>
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="#overview">Overview</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#installation">Installation</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#configuration">Configuration</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#actions">Actions</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#providers">Providers</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#examples">Examples</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#troubleshooting">Troubleshooting</a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#faq">FAQ</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <section id="overview">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {overview}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Installation */}
      <section id="installation">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Installation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">{installation}</p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{`npm install ${pluginId}`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    copyCode(`npm install ${pluginId}`, "install")
                  }
                >
                  {copiedCode === "install" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Configuration */}
      <section id="configuration">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Option</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configuration.map((config) => (
                  <TableRow key={config.name}>
                    <TableCell className="font-mono">{config.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{config.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {config.required ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {config.default || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {config.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Actions & Providers */}
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actions">
            Actions ({actions.length})
          </TabsTrigger>
          <TabsTrigger value="providers">
            Providers ({providers.length})
          </TabsTrigger>
        </TabsList>

        {/* Actions */}
        <TabsContent value="actions" id="actions">
          <div className="space-y-4">
            {actions.map((action, index) => (
              <Card key={action.name}>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">
                    {action.name}()
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Parameters */}
                  <div>
                    <h4 className="font-semibold mb-2">Parameters</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {action.parameters.map((param) => (
                          <TableRow key={param.name}>
                            <TableCell className="font-mono">
                              {param.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{param.type}</Badge>
                            </TableCell>
                            <TableCell>
                              {param.required ? (
                                <Badge variant="destructive">Yes</Badge>
                              ) : (
                                <Badge variant="secondary">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {param.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Returns */}
                  <div>
                    <h4 className="font-semibold mb-2">Returns</h4>
                    <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <Badge variant="outline">{action.returns.type}</Badge>
                      <p className="text-sm text-muted-foreground">
                        {action.returns.description}
                      </p>
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Example</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyCode(action.example, `action-${index}`)
                        }
                      >
                        {copiedCode === `action-${index}` ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code>{action.example}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Providers */}
        <TabsContent value="providers" id="providers">
          <div className="space-y-4">
            {providers.map((provider, index) => (
              <Card key={provider.name}>
                <CardHeader>
                  <CardTitle className="font-mono text-lg">
                    {provider.name}()
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {provider.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Same structure as actions */}
                  <div>
                    <h4 className="font-semibold mb-2">Parameters</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {provider.parameters.map((param) => (
                          <TableRow key={param.name}>
                            <TableCell className="font-mono">
                              {param.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{param.type}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {param.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Example</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyCode(provider.example, `provider-${index}`)
                        }
                      >
                        {copiedCode === `provider-${index}` ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code>{provider.example}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Examples */}
      <section id="examples">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {examples.map((example, index) => (
                <div key={index} className="space-y-2">
                  <div>
                    <h3 className="font-semibold">{example.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {example.description}
                    </p>
                  </div>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code>{example.code}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyCode(example.code, `example-${index}`)
                      }
                    >
                      {copiedCode === `example-${index}` ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {index < examples.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Troubleshooting & FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Troubleshooting */}
        <section id="troubleshooting">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {troubleshooting.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <p className="font-medium">{item.question}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                    {index < troubleshooting.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section id="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faq.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <p className="font-medium">{item.question}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                    {index < faq.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
