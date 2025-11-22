#!/bin/bash
# Design Token Migration Script
# Cycles 81-90: Update all pages to use 6-token design system

cd /home/user/one.ie/web/src/pages || exit 1

echo "🎨 Starting design token migration..."
echo "📊 Excluding /design.astro (canonical reference)"

# Count files before migration
total_files=$(find . -name "*.astro" -type f ! -name "design.astro" | wc -l)
echo "📄 Processing $total_files pages..."

# Update bg-card patterns
echo "🔄 Updating card backgrounds..."
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-card\/50/bg-background\/50/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-card\/60/bg-background\/60/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-card\/70/bg-background\/70/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-card\/80/bg-background\/80/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-card\/90/bg-background\/90/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/"bg-card"/"bg-background"/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/ bg-card / bg-background /g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/ bg-card>/ bg-background>/g' {} \;

# Update className patterns (React components in Astro)
echo "🔄 Updating React className patterns..."
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/className="bg-card /className="bg-background /g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/className="bg-card"/className="bg-background"/g' {} \;

# Update text colors
echo "🔄 Updating text colors..."
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/text-gray-900 dark:text-white/text-font/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/text-gray-800 dark:text-gray-100/text-font/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/text-gray-700 dark:text-gray-200/text-font/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/text-gray-600 dark:text-gray-300/text-font\/80/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/text-gray-500 dark:text-gray-400/text-font\/60/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/text-gray-400 dark:text-gray-500/text-font\/40/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/text-card-foreground/text-font/g' {} \;

# Update background colors
echo "🔄 Updating background colors..."
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-white dark:bg-gray-800/bg-foreground/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-white dark:bg-gray-900/bg-foreground/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-gray-50 dark:bg-gray-900/bg-background/g' {} \;
find . -name "*.astro" -type f ! -name "design.astro" -exec sed -i 's/bg-gray-100 dark:bg-gray-800/bg-background/g' {} \;

# Count remaining issues
remaining_bg_card=$(grep -r "bg-card" --include="*.astro" --exclude="design.astro" . 2>/dev/null | wc -l)
remaining_gray_text=$(grep -r "text-gray-900 dark:text-white" --include="*.astro" --exclude="design.astro" . 2>/dev/null | wc -l)

echo ""
echo "✅ Migration complete!"
echo "📊 Results:"
echo "   - Total pages processed: $total_files"
echo "   - Remaining bg-card instances: $remaining_bg_card"
echo "   - Remaining gray text instances: $remaining_gray_text"
echo ""
echo "🎉 Design token migration finished!"
