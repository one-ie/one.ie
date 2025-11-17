import { CloudCog, Code, Download, GitFork, Github, Star, TerminalSquare } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Browser globals for ESLint
/* global performance, requestAnimationFrame, cancelAnimationFrame */

const GITHUB_REPO = "one-ie/one";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const DOWNLOAD_URL = `${GITHUB_URL}/archive/refs/heads/main.zip`;
const NPM_PACKAGE = "oneie";
const NPM_URL = `https://api.npmjs.org/downloads/point/last-week/${NPM_PACKAGE}`;

type CopyTarget = "git" | "npx" | null;

interface GitSectionProps {
  children?: ReactNode;
}

export function GitSection({ children }: GitSectionProps) {
  const [stats, setStats] = useState({ stars: 0, forks: 0, downloads: 0, watchers: 0 });
  const [copied, setCopied] = useState<CopyTarget>(null);
  const [displayStats, setDisplayStats] = useState({ stars: 0, downloads: 0 });
  const [imageLoaded, setImageLoaded] = useState(true);
  const animationFrame = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Defer API calls until component is visible or after initial page load
    const fetchStats = async () => {
      // Check sessionStorage for cached stats (avoid redundant API calls)
      const cached = sessionStorage.getItem("github-stats");
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          const age = Date.now() - cachedData.timestamp;
          // Use cache if less than 5 minutes old
          if (age < 5 * 60 * 1000) {
            setStats(cachedData.stats);
            setHasLoaded(true);
            return;
          }
        } catch (_e) {
          // Invalid cache, continue to fetch
        }
      }

      try {
        const [githubResponse, npmResponse] = await Promise.all([
          fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
            headers: { Accept: "application/vnd.github.v3+json" },
          }),
          fetch(NPM_URL),
        ]);

        if (!githubResponse.ok) {
          throw new Error(`GitHub API responded with status ${githubResponse.status}`);
        }

        const githubData = await githubResponse.json();
        const npmData = npmResponse.ok ? await npmResponse.json() : null;

        if (
          githubData &&
          typeof githubData.stargazers_count === "number" &&
          typeof githubData.forks_count === "number"
        ) {
          const nextStats = {
            stars: githubData.stargazers_count,
            forks: githubData.forks_count,
            watchers: githubData.subscribers_count || 0,
            downloads: npmData && typeof npmData.downloads === "number" ? npmData.downloads : 0,
          };

          setStats(nextStats);
          // Cache the result
          sessionStorage.setItem(
            "github-stats",
            JSON.stringify({
              stats: nextStats,
              timestamp: Date.now(),
            })
          );
        } else {
          console.warn("Unexpected GitHub API response format:", githubData);
          const fallbackStats = {
            stars: 0,
            forks: 0,
            watchers: 0,
            downloads: npmData && typeof npmData.downloads === "number" ? npmData.downloads : 0,
          };
          setStats(fallbackStats);
        }
      } catch (error) {
        console.error("Error fetching repository stats:", error);
        setStats({ stars: 0, forks: 0, watchers: 0, downloads: 0 });
      }
      setHasLoaded(true);
    };

    // Use IntersectionObserver to fetch stats only when component is visible
    if ("IntersectionObserver" in window && sectionRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasLoaded) {
            fetchStats();
          }
        },
        { rootMargin: "100px" } // Start loading 100px before visible
      );

      observer.observe(sectionRef.current);

      return () => {
        observer.disconnect();
      };
    } else {
      // Fallback: defer fetch slightly to prioritize initial render
      const timer = setTimeout(fetchStats, 100);
      return () => clearTimeout(timer);
    }
  }, [hasLoaded]);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const initial = { ...displayStats };
    const target = {
      stars: stats.stars || 0,
      downloads: stats.downloads || 0,
    };

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayStats({
        stars: Math.round(initial.stars + (target.stars - initial.stars) * progress),
        downloads: Math.round(
          initial.downloads + (target.downloads - initial.downloads) * progress
        ),
      });
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(step);
      }
    };

    if (target.stars !== initial.stars || target.downloads !== initial.downloads) {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
      animationFrame.current = requestAnimationFrame(step);
    }

    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [stats.stars, stats.downloads, displayStats]);

  const formattedStars =
    displayStats.stars > 0
      ? displayStats.stars.toLocaleString()
      : stats.stars > 0
        ? stats.stars.toLocaleString()
        : "—";
  const formattedDownloads =
    displayStats.downloads > 0
      ? displayStats.downloads.toLocaleString()
      : stats.downloads > 0
        ? stats.downloads.toLocaleString()
        : "—";

  const copyCommand = async (command: string, target: Exclude<CopyTarget, null>) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(target);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Unable to copy command to clipboard:", error);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 py-8"
    >
      <div className="w-full max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          {children ? <div className="max-w-6xl mx-auto">{children}</div> : null}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-yellow-300/70 bg-yellow-500/5">
            <Download className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold tracking-[0.2em] text-yellow-100 uppercase">
              Own AI Agents
            </span>
          </div>
          {imageLoaded && (
            <div className="flex justify-center">
              <img
                src="/logo.svg"
                alt="ONE Logo"
                width={400}
                height={400}
                fetchPriority="high"
                loading="eager"
                className="mx-auto w-full max-w-[400px] h-auto dark:invert-0 invert"
                onError={() => setImageLoaded(false)}
              />
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            BRING YOUR IDEAS TO LIFE
          </h1>
          <div className="space-y-4">
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Build apps, websites, and AI agents is English. Download to your computer, run in the
              cloud and deploy to the edge or your own server. ONE is open source and free forever.
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
              Download FREE · Own FOREVER
            </h2>
          </div>
        </div>

        {/* Main Download Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Download ZIP */}
          <Card className="group relative overflow-hidden border-border/50 hover:shadow-2xl transition-all duration-500">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(135deg, hsl(45 93% 47% / 0.03) 0%, transparent 100%)",
              }}
            />
            <div className="relative p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/20">
                  <Download className="w-7 h-7 text-primary transition-transform duration-500 group-hover:translate-y-0.5" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight">Download ZIP</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get the latest code as a ZIP archive. No Git required.
                </p>
              </div>
              <a href={DOWNLOAD_URL} className="block" aria-label="Download ONE as ZIP file">
                <Button
                  className="w-full group/btn relative overflow-hidden"
                  size="lg"
                  aria-label="Download ONE as ZIP file"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Download
                      className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5"
                      aria-hidden="true"
                    />
                    Download ZIP
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, hsl(45 93% 47% / 0.1), transparent)",
                    }}
                  />
                </Button>
              </a>
            </div>
          </Card>

          {/* Clone Repository */}
          <Card className="group relative overflow-hidden border-border/50 hover:shadow-2xl transition-all duration-500">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(135deg, hsl(45 93% 47% / 0.03) 0%, transparent 100%)",
              }}
            />
            <div className="relative p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/20">
                  <Code className="w-7 h-7 text-primary" />
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: "hsl(45 93% 47% / 0.15)" }}
                >
                  <Star
                    className="w-3.5 h-3.5"
                    style={{ fill: "hsl(45 93% 47%)", color: "hsl(45 93% 47%)" }}
                  />
                  <span className="font-semibold text-sm" style={{ color: "hsl(45 93% 47%)" }}>
                    {formattedStars}
                  </span>
                  <span className="text-xs text-muted-foreground">stars</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight">Clone Repository</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clone with Git for version control and updates.
                </p>
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full font-mono text-sm justify-start hover:border-primary/40 transition-all duration-300 group/btn"
                  onClick={() => copyCommand(`git clone ${GITHUB_URL}.git`, "git")}
                  aria-label="Copy git clone command"
                >
                  <Code
                    className="mr-2 h-4 w-4 shrink-0 transition-transform group-hover/btn:scale-110"
                    aria-hidden="true"
                  />
                  <span className="truncate">github.com/{GITHUB_REPO}</span>
                </Button>
                <p
                  className={`absolute -bottom-6 left-0 text-xs text-primary transition-opacity duration-200 ${
                    copied === "git" ? "opacity-100" : "opacity-0"
                  }`}
                >
                  ✓ Copied!
                </p>
              </div>
            </div>
          </Card>

          {/* Install with NPX */}
          <Card className="group relative overflow-hidden border-border/50 hover:shadow-2xl transition-all duration-500">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(135deg, hsl(45 93% 47% / 0.03) 0%, transparent 100%)",
              }}
            />
            <div className="relative p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/20">
                  <TerminalSquare className="w-7 h-7 text-primary" />
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: "hsl(45 93% 47% / 0.15)" }}
                >
                  <Download className="w-3.5 h-3.5" style={{ color: "hsl(45 93% 47%)" }} />
                  <span className="font-semibold text-sm" style={{ color: "hsl(45 93% 47%)" }}>
                    {formattedDownloads}
                  </span>
                  <span className="text-xs text-muted-foreground">/week</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight">Install with NPX</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate a fresh project instantly with one command.
                </p>
              </div>
              <div className="relative">
                <Button
                  className="w-full font-mono text-sm transition-all duration-300 group/btn shadow-lg hover:shadow-xl"
                  onClick={() => copyCommand(`npx ${NPM_PACKAGE}`, "npx")}
                  aria-label="Copy npx command to start a new project"
                  style={{
                    backgroundColor: "hsl(216 55% 25%)",
                    color: "hsl(36 8% 96%)",
                    borderColor: "hsl(216 55% 25%)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(216 55% 20%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "hsl(216 55% 25%)";
                  }}
                >
                  <TerminalSquare
                    className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110"
                    aria-hidden="true"
                  />
                  npx {NPM_PACKAGE}
                </Button>
                <p
                  className={`absolute -bottom-6 left-0 text-xs text-primary transition-opacity duration-200 ${
                    copied === "npx" ? "opacity-100" : "opacity-0"
                  }`}
                >
                  ✓ Copied!
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View ONE repository on GitHub"
          >
            <Button
              variant="outline"
              size="lg"
              className="group hover:border-primary/40 hover:bg-primary/5"
              aria-label="View ONE repository on GitHub"
            >
              <Github className="w-5 h-5 mr-2" aria-hidden="true" />
              <span>View on GitHub</span>
              <div
                className="ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: "hsl(45 93% 47% / 0.15)" }}
              >
                <Star
                  className="w-3 h-3"
                  style={{ fill: "hsl(45 93% 47%)", color: "hsl(45 93% 47%)" }}
                />
                <span className="font-semibold" style={{ color: "hsl(45 93% 47%)" }}>
                  {stats.stars > 0 ? stats.stars.toLocaleString() : "—"}
                </span>
              </div>
            </Button>
          </a>

          <a
            href={`${GITHUB_URL}/fork`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fork ONE repository on GitHub"
          >
            <Button
              variant="outline"
              size="lg"
              className="group hover:border-primary/40 hover:bg-primary/5"
              aria-label="Fork ONE repository on GitHub"
            >
              <GitFork className="w-5 h-5 mr-2" aria-hidden="true" />
              <span>Fork</span>
              <div
                className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: "hsl(45 93% 47% / 0.15)" }}
              >
                <GitFork className="w-3 h-3" style={{ color: "hsl(45 93% 47%)" }} />
                <span className="font-semibold" style={{ color: "hsl(45 93% 47%)" }}>
                  {stats.forks > 0 ? stats.forks.toLocaleString() : "—"}
                </span>
              </div>
            </Button>
          </a>

          <a
            href={`https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open ONE in GitHub Codespaces"
          >
            <Button
              variant="outline"
              size="lg"
              className="group hover:border-primary/40 hover:bg-primary/5"
              aria-label="Open ONE in GitHub Codespaces"
            >
              <CloudCog className="w-5 h-5 mr-2" aria-hidden="true" />
              <span>Open in Codespaces</span>
            </Button>
          </a>
        </div>

        {/* Download Stats */}
        <div className="text-center py-4">
          <a href="/news/over-10000-installs" className="block">
            <p className="text-2xl font-semibold text-foreground hover:opacity-80 transition-opacity">
              Over <span style={{ color: "hsl(45 93% 47%)" }}>10,000</span> Installs
            </p>
          </a>
          <a
            href="/docs/getting-started/quick-start"
            className="block text-primary hover:underline text-sm font-medium mt-2"
          >
            View Installation Instructions →
          </a>
        </div>

        {/* Quick Info Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/40">
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">License</p>
            <a href="/free-license" className="text-sm font-semibold text-primary hover:underline">
              ONE Free License
            </a>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Requirements</p>
            <p className="text-sm font-semibold">Node.js 18+</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Package Manager</p>
            <p className="text-sm font-semibold">pnpm / npm / bun</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Deploy</p>
            <p className="text-sm font-semibold">Anywhere</p>
          </div>
        </div>
      </div>
    </section>
  );
}
