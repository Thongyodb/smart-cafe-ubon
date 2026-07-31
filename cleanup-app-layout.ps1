$projectRoot = "C:\smart-cafe-ubon"
$stylesPath = Join-Path $projectRoot "client\src\styles"

$appLayoutPath = Join-Path $stylesPath "app-layout.css"
$legacyPath = Join-Path $stylesPath "app-layout.legacy.css"
$themePath = Join-Path $stylesPath "app-theme.css"
$overridePath = Join-Path $stylesPath "app-theme-overrides.css"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $stylesPath "app-layout.backup-$timestamp.css"

Copy-Item $appLayoutPath $backupPath -Force

if (!(Test-Path $legacyPath)) {
  Copy-Item $appLayoutPath $legacyPath -Force
} else {
  Write-Host "app-layout.legacy.css already exists, keeping existing legacy file."
}

$themeCss = @'
:root {
  /* Main theme from Home */
  --home-teal: #0d7675;
  --home-teal-dark: #075a59;
  --home-teal-soft: #e6f2f2;
  --home-text: #252525;
  --home-muted: #666666;
  --home-white: #ffffff;

  /* App aliases used by old CSS */
  --app-bg: #f9f9f9;
  --app-bg-soft: #e6f2f2;
  --app-card: rgba(255, 255, 255, 0.94);
  --app-coffee: #0d7675;
  --app-coffee-dark: #075a59;
  --app-latte: #b9dddd;
  --app-chip: #e6f2f2;
  --app-text: #252525;
  --app-dark: #252525;
  --app-muted: #666666;
  --app-sage: #0d7675;
  --app-shadow: rgba(13, 118, 117, 0.12);
  --app-border: rgba(13, 118, 117, 0.12);

  --app-danger: #ef4444;
  --app-danger-dark: #dc2626;
  --app-warning: #f59e0b;

  --page-bg:
    radial-gradient(circle at top left, rgba(13, 118, 117, 0.13), transparent 34%),
    linear-gradient(135deg, #f9f9f9 0%, #e6f2f2 100%);
}

body {
  color: var(--app-text);
  background: var(--app-bg);
}
'@

$overrideCss = @'
/* =========================
   Global Theme Overrides
   ใช้สีเดียวกับหน้า Home ทั้งระบบ
========================= */

/* Main backgrounds */
.app-layout,
.admin-layout,
.admin-login-page,
.auth-page,
.profile-page {
  background: var(--page-bg) !important;
  color: var(--app-text) !important;
}

/* Main containers */
.app-content,
.admin-main,
.admin-content {
  background: transparent !important;
}

/* Topbar / Sidebar */
.app-topbar,
.desktop-nav {
  background: rgba(255, 255, 255, 0.96) !important;
  border-color: var(--app-border) !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04) !important;
}

.admin-sidebar {
  background: rgba(255, 255, 255, 0.96) !important;
  border-right: 1px solid var(--app-border) !important;
  box-shadow: 12px 0 34px rgba(13, 118, 117, 0.06) !important;
}

/* Brand */
.app-brand,
.brand-link,
.admin-brand,
.admin-back-link {
  color: var(--app-coffee) !important;
}

.app-brand-icon,
.brand-icon,
.admin-brand-icon,
.admin-login-logo {
  background: var(--app-chip) !important;
  color: var(--app-coffee) !important;
}

/* Nav active */
.app-desktop-nav a:hover,
.app-desktop-nav a.active,
.desktop-menu a.active,
.admin-menu a.active,
.admin-nav a:hover,
.admin-nav a.active,
.auth-tabs button.active,
.filter-tag-btn.active {
  color: #ffffff !important;
  background: var(--app-coffee) !important;
}

.app-login-link {
  color: #ffffff !important;
  background: var(--app-coffee) !important;
}

/* Cards */
.home-hero-left,
.home-map-feature,
.explore-panel,
.profile-hero-card,
.profile-menu-card,
.profile-stats-card,
.profile-info-card,
.profile-action-card,
.profile-empty-card,
.favorite-card,
.empty-favorite-card,
.app-cafe-card,
.cafe-filter-bar,
.admin-stat-card,
.admin-section-card,
.admin-form-card,
.admin-login-card,
.auth-card,
.review-login-card,
.my-review-card,
.review-form-card,
.review-card,
.spot-card,
.empty-photo-spots,
.admin-review-filter-card,
.admin-cafe-image-upload-box,
.admin-current-cover,
.admin-cafe-image-card {
  background: var(--app-card) !important;
  border-color: var(--app-border) !important;
  box-shadow: 0 18px 46px var(--app-shadow) !important;
}

/* Text color */
.eyebrow,
.section-heading span,
.section-description,
.admin-eyebrow,
.admin-stat-card svg,
.admin-table th,
.cafe-filter-title,
.app-search svg,
.admin-search-box svg,
.spot-meta svg,
.empty-photo-spots svg,
.admin-users-summary,
.admin-meta-summary div,
.admin-review-summary div {
  color: var(--app-coffee) !important;
}

.app-header h1,
.simple-header h1,
.explore-header h1,
.admin-page-header h1,
.auth-card h1,
.admin-login-card h1,
.profile-hero-card h1,
.profile-info-card h2,
.profile-action-card h2 {
  color: var(--app-text) !important;
}

.admin-page-header p,
.auth-card p,
.admin-login-card p,
.profile-hero-card p,
.profile-empty-card p,
.review-card p,
.review-form-card p,
.empty-favorite-card p {
  color: var(--app-muted) !important;
}

/* Buttons */
.app-search button,
.round-icon-btn,
.admin-primary-btn,
.review-submit-btn,
.home-auth-actions button,
.app-user-mini span {
  background: var(--app-coffee) !important;
  color: #ffffff !important;
}

.app-search button:hover,
.round-icon-btn:hover,
.admin-primary-btn:hover,
.review-submit-btn:hover {
  background: var(--app-coffee-dark) !important;
}

.admin-secondary-btn,
.clear-filter-btn,
.filter-chips span,
.filter-tag-btn,
.admin-icon-btn,
.back-to-site,
.stats-grid div,
.provider-pill,
.role-user,
.status-active,
.review-secondary-btn,
.home-auth-actions button:nth-child(2) {
  background: var(--app-chip) !important;
  color: var(--app-coffee) !important;
}

/* Danger */
.app-heart-btn.active,
.favorite-btn.active,
.admin-icon-btn.danger,
.review-danger-btn,
.admin-logout-btn {
  background: var(--app-danger) !important;
  color: #ffffff !important;
}

.admin-logout-btn:hover {
  background: var(--app-danger-dark) !important;
}

/* Stars */
.review-star-btn.active,
.review-stars-display .active,
.detail-rating-stars svg.active,
.admin-cafe-cover-badge svg {
  color: var(--app-warning) !important;
}

/* Inputs */
input,
textarea,
select,
.admin-search-box,
.app-search {
  border-color: var(--app-border) !important;
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--app-coffee) !important;
  box-shadow: 0 0 0 4px rgba(13, 118, 117, 0.1) !important;
}

/* Admin dashboard background cleanup */
.admin-layout {
  min-height: 100vh !important;
}

.admin-main,
.admin-content {
  min-width: 0 !important;
}

/* Profile background cleanup */
.profile-page {
  min-height: calc(100vh - 90px) !important;
}

/* Mobile nav */
.bottom-nav,
.app-bottom-nav {
  background: rgba(255, 255, 255, 0.96) !important;
  border-color: var(--app-border) !important;
}

.bottom-nav a.active,
.app-bottom-nav a.active {
  color: #ffffff !important;
  background: var(--app-coffee) !important;
}
'@

$appLayoutNew = @'
@import "./app-layout.legacy.css";
@import "./app-theme.css";
@import "./app-theme-overrides.css";
'@

Set-Content -Path $themePath -Value $themeCss -Encoding UTF8
Set-Content -Path $overridePath -Value $overrideCss -Encoding UTF8
Set-Content -Path $appLayoutPath -Value $appLayoutNew -Encoding UTF8

Write-Host ""
Write-Host "Done: app-layout.css organized successfully."
Write-Host "Created:"
Write-Host "- client/src/styles/app-layout.legacy.css"
Write-Host "- client/src/styles/app-theme.css"
Write-Host "- client/src/styles/app-theme-overrides.css"
Write-Host ""
Write-Host "Backup:"
Write-Host "- $backupPath"
Write-Host ""