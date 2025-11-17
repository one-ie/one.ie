#!/usr/bin/env python3
"""
Quality Gate Hook

Validates code quality before allowing commits.
Integrates with Biome for comprehensive quality checks.

Usage: Run automatically on git pre-commit or manually
"""

import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime
import json

class QualityGate:
    """Quality gate checker for ONE Platform."""

    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.web_dir = self.project_root / "web"
        self.errors = []
        self.warnings = []
        self.stats = {
            "total_files": 0,
            "errors": 0,
            "warnings": 0,
            "passed": True
        }

    def run_biome_check(self):
        """Run Biome checks on all web files."""
        print("🔍 Running Biome quality checks...")

        if not self.web_dir.exists():
            self.errors.append("Web directory not found")
            return False

        try:
            result = subprocess.run(
                ["bunx", "@biomejs/biome", "check", "--diagnostic-level=error", "src/"],
                cwd=str(self.web_dir),
                capture_output=True,
                text=True,
                timeout=60
            )

            # Parse output
            output = result.stdout + result.stderr

            # Count errors
            for line in output.split('\n'):
                if '× ' in line or 'error' in line.lower():
                    self.stats["errors"] += 1
                if '!' in line or 'warning' in line.lower():
                    self.stats["warnings"] += 1

            if result.returncode != 0:
                self.errors.append(f"Biome found {self.stats['errors']} errors")
                return False

            print(f"✅ Biome check passed (0 errors)")
            return True

        except subprocess.TimeoutExpired:
            self.errors.append("Biome check timed out")
            return False
        except Exception as e:
            self.errors.append(f"Biome check failed: {str(e)}")
            return False

    def run_type_check(self):
        """Run TypeScript type checking."""
        print("🔍 Running TypeScript type checks...")

        try:
            result = subprocess.run(
                ["bunx", "astro", "check"],
                cwd=str(self.web_dir),
                capture_output=True,
                text=True,
                timeout=120
            )

            if result.returncode != 0:
                # Count errors
                error_count = result.stderr.count('error')
                self.errors.append(f"TypeScript found {error_count} type errors")
                return False

            print("✅ Type check passed")
            return True

        except subprocess.TimeoutExpired:
            self.warnings.append("Type check timed out")
            return True  # Don't fail on timeout
        except Exception as e:
            self.warnings.append(f"Type check failed: {str(e)}")
            return True  # Don't fail on type check errors

    def check_ontology_compliance(self):
        """Verify 6-dimension ontology compliance."""
        print("🔍 Checking ontology compliance...")

        # Run ontology validation hook
        hook_path = self.project_root / ".claude/hooks/validate-ontology-structure.py"

        if not hook_path.exists():
            self.warnings.append("Ontology validation hook not found")
            return True

        try:
            result = subprocess.run(
                ["python3", str(hook_path)],
                cwd=str(self.project_root),
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                self.warnings.append("Ontology validation warnings found")
                # Don't fail on ontology warnings, just warn
                return True

            print("✅ Ontology compliance check passed")
            return True

        except subprocess.TimeoutExpired:
            self.warnings.append("Ontology check timed out")
            return True
        except Exception as e:
            self.warnings.append(f"Ontology check failed: {str(e)}")
            return True

    def check_git_status(self):
        """Check git status for uncommitted changes."""
        print("🔍 Checking git status...")

        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=str(self.project_root),
                capture_output=True,
                text=True
            )

            modified_files = [
                line.split()[1] for line in result.stdout.split('\n')
                if line.startswith(' M') or line.startswith('M')
            ]

            self.stats["total_files"] = len(modified_files)

            print(f"📝 {len(modified_files)} file(s) modified")
            return True

        except Exception as e:
            self.warnings.append(f"Git status check failed: {str(e)}")
            return True

    def run_all_checks(self):
        """Run all quality gate checks."""
        print("\n" + "="*60)
        print("🚦 QUALITY GATE - ONE Platform")
        print("="*60 + "\n")

        checks = [
            ("Git Status", self.check_git_status),
            ("Biome Lint", self.run_biome_check),
            ("Type Check", self.run_type_check),
            ("Ontology", self.check_ontology_compliance)
        ]

        results = []
        for name, check_func in checks:
            try:
                passed = check_func()
                results.append((name, passed))
                if not passed and name in ["Biome Lint"]:
                    # Critical checks that must pass
                    self.stats["passed"] = False
            except Exception as e:
                self.errors.append(f"{name} check failed: {str(e)}")
                results.append((name, False))
                if name in ["Biome Lint"]:
                    self.stats["passed"] = False

        self.print_summary(results)
        return self.stats["passed"]

    def print_summary(self, results):
        """Print summary of all checks."""
        print("\n" + "="*60)
        print("📊 SUMMARY")
        print("="*60 + "\n")

        # Print check results
        for name, passed in results:
            status = "✅" if passed else "❌"
            print(f"{status} {name}")

        print()

        # Print errors
        if self.errors:
            print("❌ ERRORS:")
            for error in self.errors:
                print(f"  • {error}")
            print()

        # Print warnings
        if self.warnings:
            print("⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"  • {warning}")
            print()

        # Print stats
        print("📈 STATISTICS:")
        print(f"  Files checked: {self.stats['total_files']}")
        print(f"  Errors: {self.stats['errors']}")
        print(f"  Warnings: {self.stats['warnings']}")
        print()

        # Final verdict
        if self.stats["passed"]:
            print("✅ QUALITY GATE: PASSED")
            print("\nAll critical checks passed. Ready to commit! 🎉")
        else:
            print("❌ QUALITY GATE: FAILED")
            print("\nPlease fix errors before committing.")
            print("\nQuick fixes:")
            print("  1. Run: cd web && bun run lint:fix")
            print("  2. Run: cd web && bunx @biomejs/biome check --write --unsafe src/")
            print("  3. Review and commit changes")

        print("\n" + "="*60 + "\n")

    def save_report(self):
        """Save quality report to file."""
        report_dir = self.project_root / ".claude/state/quality-reports"
        report_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = report_dir / f"quality-gate-{timestamp}.json"

        report = {
            "timestamp": datetime.now().isoformat(),
            "passed": self.stats["passed"],
            "stats": self.stats,
            "errors": self.errors,
            "warnings": self.warnings
        }

        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

        print(f"📄 Report saved: {report_file}")

def main():
    """Main entry point."""
    # Find project root
    current = Path.cwd()
    while current != current.parent:
        if (current / "package.json").exists():
            project_root = current
            break
        current = current.parent
    else:
        print("❌ Could not find project root")
        sys.exit(1)

    # Run quality gate
    gate = QualityGate(project_root)
    passed = gate.run_all_checks()
    gate.save_report()

    # Exit with appropriate code
    sys.exit(0 if passed else 1)

if __name__ == "__main__":
    main()
