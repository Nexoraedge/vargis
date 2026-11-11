# Vergis — Premium Personal Transformation Dashboard

> **Build yourself. One day at a time.**

Vergis is an editorial, mobile-first personal transformation web application and command center. Built with a warm-light aesthetic inspired by premium wellness brands, it provides an all-in-one hub to track physique, body weight, vegetarian nutrition, calisthenics & backpack resistance workouts, barrier-repair skincare, daily discipline habits, and long-term analytics.

---

## 🌿 Design System & Aesthetic

Vergis deliberately rejects generic blue-purple SaaS gradients in favor of an **editorial, tactile, warm-light identity**:

- **Main Background**: `#F7F5EF` (Warm Ivory)
- **Card Background**: `#FFFFFF`
- **Primary Accent**: `#244B3C` (Forest Green)
- **Secondary Accent**: `#A6B49A` (Muted Sage)
- **Light Sage Tint**: `#E8EBDD`
- **Champagne Accent**: `#C7A878`
- **Primary Text**: `#202820`
- **Secondary Text**: `#777F75`
- **Borders**: `#E8E7DF`

---

## 📱 Mobile-First Native Experience

Designed specifically for primary usage on mobile devices (iPhone Safari & Android Chrome):
- **Responsive Layouts**: Tested across 320px, 375px, 390px, 430px, and desktop screens.
- **Fixed Bottom Navigation**: Native app feel with quick touch access to Home, Workouts, Nutrition, Progress, and More.
- **Desktop Sidebar**: Automatically unfolds into a two-column desktop command center on screens 1024px and wider.
- **Touch-Friendly Targets**: All buttons, cards, and checkboxes adhere to 44px+ touch standards.
- **PWA Ready**: Includes `manifest.json`, high-resolution vector icon assets, and an offline-capable Service Worker (`sw.js`).
- **Safe Area Inset Aware**: Fully respects iOS home indicator and notch bars (`viewport-fit=cover`).

---

## ⚙️ Technology Stack

- **HTML5 & CSS3**: Native semantic HTML, custom properties, flexbox, CSS grid, micro-animations.
- **Vanilla JavaScript (ES6+)**: Zero framework overhead, ultra-fast load times, pure modular structure.
- **LocalStorage**: Versioned, schema-controlled client-side persistence for daily logs, workouts, meals, and settings.
- **IndexedDB (`idb.js`)**: Isolated local media store for private progress photos without hitting 5MB LocalStorage quota boundaries.
- **Chart.js**: Weight progression trajectory, protein compliance, push-up gains, and habit consistency charts.
- **Lucide Icons**: Crisp vector iconography.
- **Google Fonts**: *Manrope* (Headings & Metrics) and *Inter* (Body typography).

---

## 📋 Preloaded Baseline Profile & Targets

- **Height**: 5'11" (180 cm)
- **Starting Weight**: 59.0 kg
- **Primary Target**: 62.0 – 65.0 kg
- **Long-Term Target**: 72.0 kg
- **Push-up PR**: 48 reps
- **Environment**: Home calisthenics & weighted backpack workouts
- **Diet**: 100% Vegetarian with Indian staples
- **Monthly Budget**: ₹1,000 – ₹2,000
- **Daily Protein Target**: 75–90 g (editable in Settings)
- **Daily Hydration**: 2.5 Litres
- **Sleep Target**: 7–9 Hours

---

## 🏋️ Workouts & Training System

Vergis enforces a 4-day weekly strength split + Sunday sports:

- **Monday — Workout A (Chest, Legs, Core)**:
  - Standard Push-ups: 3 sets × 12–15 reps
  - Backpack Squats: 3 × 15
  - Backpack Bent-over Rows: 3 × 12
  - Glute Bridges: 3 × 15
  - Plank Hold: 3 × 30–45s
- **Tuesday — Workout B (Shoulders, Back, Calves)**:
  - Pike Push-ups: 2 × 6–10
  - Backpack Bent-over Rows: 3 × 12
  - Reverse Lunges: 3 × 10 each leg
  - Backpack Overhead Shoulder Press: 2 × 10
  - Standing Calf Raises: 3 × 20
  - Side Plank: 2 × 30s each side
- **Wednesday**: Active Recovery / 30–45m Walking & Hip Mobility
- **Thursday — Workout A (Chest, Legs, Core)**:
  - Progressive overload on push-ups, squats, rows, and core stability
- **Friday — Workout B (Shoulders, Back, Calves)**:
  - Strict overhead press, rows, lunges, calf raises, side plank
- **Saturday**: Rest & Deep Mobility
- **Sunday**: Sunday Sports / Recreational Volleyball & Agility

> **Recovery Law**: Avoid testing maximum push-ups daily. Muscle growth requires 48 hours of muscular recovery and adequate sleep to synthesize new tissue.

---

## 🍲 Vegetarian Nutrition & Desk Snacks

Designed for lean-bulking on an affordable ₹1,000–₹2,000 monthly budget:
1. **Breakfast (7:00–8:00 AM)**: 500 ml milk, 2 bananas, 45g oats, 25g peanuts (~31g protein, ~680 kcal)
2. **Lunch (2:00–3:00 PM)**: 3 rotis, dal, seasonal sabzi, curd (~21g protein, ~560 kcal)
3. **Evening Snack (5:00 PM)**: 50g roasted chana, banana, peanuts (~15g protein, ~380 kcal)
4. **Dinner (8:00 PM)**: Soya chunks or paneer, roti/rice, sabzi, curd (~30g protein, ~610 kcal)
5. **Late Snack (10:00 PM)**: 250 ml warm milk (~8g protein, ~150 kcal)

### 💻 Dedicated "Desk Snacks"
Non-greasy, high-protein finger foods designed for eating while coding or studying:
- **Roasted Chana**: 50g handful (+9.5g protein)
- **Roasted Peanuts**: 30g (+7.8g protein)
- **Sattu Namkeen Water**: 300 ml (+6.5g protein)
- **Raw Almonds & Walnuts**: 20g (+4.2g protein)
- **Banana + Peanut Butter**: (+5.3g protein)

---

## 🧴 Skincare Routine (Dry Skin & Barrier Repair)

A minimalist routine focused on skin health, UV protection, and barrier hydration (zero bleaching or harsh agents):
- **Morning (7:00 AM)**:
  1. Rinse face with lukewarm/cool water (no morning soap).
  2. Pond's Super Light Gel Moisturizer on damp skin.
  3. Broad-Spectrum SPF 50 PA++++ Sunscreen (face, neck, ears, exposed arms).
- **Evening (9:30 PM)**:
  1. Simple Kind to Skin Refreshing Facial Wash (100% soap-free).
  2. Pond's Super Light Gel Moisturizer.
- **Forever Aloe Scrub**: Paused for Weeks 1–4 to allow skin barrier repair. Optional 1x/week gentle reminder after Week 4.

---

## 📦 Data Safety & JSON Vault

- All data resides **100% on your device**.
- Under **Settings → Data Backup & Restore**, you can click **Download Backup JSON** anytime to export an offline `.json` snapshot of your entire journey.
- Restore onto any device or browser with the **Restore from JSON** button.

---

## 🚀 Local Setup & Testing

To run the application locally on macOS:

```bash
# Navigate to the project directory
cd "/Volumes/Dell 256/vergis"

# Start a local static HTTP server (Python 3)
python3 -m http.server 8080
```

Open your browser at `http://localhost:8080`.

---

## ☁️ Deployment to Vercel

Vergis is a zero-dependency static web application, perfectly optimized for instantaneous Vercel deployment:

### Method 1: Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy directly from repository root
vercel
```

### Method 2: GitHub + Vercel Dashboard
1. Repository:
   ```bash
   git push origin main
   ```
2. Log into [vercel.com](https://vercel.com).
3. Vercel automatically deploys every commit to `main` with edge CDN caching and automatic HTTPS.
