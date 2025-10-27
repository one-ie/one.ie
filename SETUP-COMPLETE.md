# ✅ Two-Site Architecture Setup Complete!

**Date:** 2025-01-27
**Status:** READY TO USE

---

## 🎉 What Was Accomplished

### 1. Repositories Created
- ✅ **oneie/** - Production site (source of truth)
- ✅ **web/** - Starter template (auto-generated)

### 2. Transform Script Created
- ✅ `/oneie/scripts/generate-starter.sh` (executable)
- ✅ Added to `package.json` as `build:starter`
- ✅ Tested successfully

### 3. Starter Template Generated
- ✅ Simple homepage with 3 template options
- ✅ Simplified sidebar (2 items: Stream, License)
- ✅ Reduced content (1 blog, 3 products)
- ✅ Updated package.json (name: oneie-starter)
- ✅ AUTO-GENERATED warning in README

---

## 📂 Current Structure

```
/Users/toc/Server/ONE/
├── oneie/                    # Production site (WORK HERE)
│   ├── src/
│   │   ├── pages/
│   │   │   └── index.astro   # Complex homepage (from apps/one)
│   │   └── components/
│   │       └── Sidebar.tsx   # Full navigation (9 items)
│   ├── scripts/
│   │   └── generate-starter.sh  # Transform script
│   └── package.json          # Has build:starter script
│
└── web/                      # Starter template (AUTO-GENERATED)
    ├── src/
    │   ├── pages/
    │   │   └── index.astro   # Simple 3-option chooser
    │   ├── components/
    │   │   └── Sidebar.tsx   # Simple navigation (2 items)
    │   └── content/
    │       ├── blog/         # 1 example post
    │       └── products/     # 3 example products
    └── README.md             # ⚠️  AUTO-GENERATED warning
```

---

## 🚀 How to Use

### Daily Development (99% of time)

```bash
cd oneie

# Make changes
vim src/pages/index.astro
vim src/components/Sidebar.tsx

# Test locally
bun run dev

# Commit
git add .
git commit -m "Add feature"
git push
```

### When Ready to Release

```bash
cd oneie

# 1. Generate starter template
bun run build:starter

# 2. Commit oneie
git add .
git commit -m "Release v1.2.3"
git push

# 3. Commit web
cd ../web
git add .
git commit -m "Generated from oneie v1.2.3"
git push
```

**Time:** 30 seconds
**Errors:** Zero

---

## ⚠️ Critical Rules

### ✅ DO
- Work in `oneie/`
- Run `bun run build:starter` before releasing
- Commit both repos after generating

### ❌ DON'T
- **NEVER edit web/ directly** - It will be overwritten
- Don't manually sync files
- Don't maintain two versions

---

## 📊 What Gets Transformed

| File | oneie/ | web/ | Change |
|------|--------|------|--------|
| index.astro | Complex | Simple chooser | REPLACED |
| Sidebar.tsx | 9 nav items | 2 items | REPLACED |
| blog/ | All posts | 1 example | REDUCED |
| products/ | All products | 3 examples | REDUCED |
| package.json | "one" | "oneie-starter" | MODIFIED |
| README.md | Production | Starter | REPLACED |

---

## 🎯 Next Steps

1. **Set up oneie GitHub repo:**
   ```bash
   cd oneie
   git remote remove origin
   git remote add origin https://github.com/one-ie/oneie.git
   git push -u origin main
   ```

2. **Set up web GitHub repo:**
   ```bash
   cd ../web
   git init
   git remote add origin https://github.com/one-ie/web.git
   git add .
   git commit -m "Initial commit: Generated from oneie"
   git push -u origin main
   ```

3. **Deploy both sites:**
   - oneie → https://one.ie (Wrangler project: oneie)
   - web → https://web.one.ie (Wrangler project: web)

---

## 📖 Documentation

Full plan: `/one/things/plans/2-sites.md`

---

## ✅ Verification Checklist

- [x] oneie/ directory exists
- [x] web/ directory exists
- [x] Transform script created
- [x] Script is executable
- [x] package.json updated
- [x] Script runs successfully
- [x] web/ contains generated files
- [x] package.json name changed to "oneie-starter"
- [x] README has AUTO-GENERATED warning
- [x] Blog reduced to 1 post
- [x] Products reduced to 3 items

---

**🎊 Setup Complete! You're ready to develop with a single source of truth and automated generation.**

Read `/one/things/plans/2-sites.md` for complete workflow and troubleshooting guide.
