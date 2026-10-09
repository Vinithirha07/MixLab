/* MoodBrew — frontend demo. All data is simulated and saved in localStorage.
   Nutrition values below are SAMPLE per-serving estimates (see INGREDIENTS).
   Totals = per-serving value x quantity. */
"use strict";

/* ---------- Helpers ---------- */
const CURRENCY = "$", BASE_PRICE = 2.5, SERVICE_RATE = 0.05, MAX_QTY = 5;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem("mb_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("mb_" + k, JSON.stringify(v)); } catch (e) {} }
};
const money = n => CURRENCY + n.toFixed(2);
const r1 = n => Math.round(n * 10) / 10;
const uid = () => Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 90 + 10);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stars = a => { const n = Math.round(a); return "★".repeat(n) + "☆".repeat(5 - n); };
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2400); }
function fieldErr(id, msg) { const el = $("#" + id + "Err"); if (el) el.textContent = msg || ""; return !msg; }
function todayISO() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

/* ---------- Data ---------- */
// flavor = [sweetness, creaminess, fruitiness, coffee, refreshment] points per unit
const ing = (id, name, cat, unit, ml, kcal, fat, sugar, protein, price, color, flavor) =>
  ({ id, name, cat, unit, ml, kcal, fat, sugar, protein, price, color, flavor });
const INGREDIENTS = [
  ing("water", "Water", "base", "200 ml", 200, 0, 0, 0, 0, 0, "#bfe3f5", [0, 0, 0, 0, 1]),
  ing("milk", "Milk (whole)", "base", "150 ml", 150, 96, 5, 7, 5, .4, "#f5ecd9", [1, 3, 0, 0, 0]),
  ing("oat", "Oat milk", "base", "150 ml", 150, 90, 3, 7, 2, .6, "#e8d9b5", [1, 2, 0, 0, 0]),
  ing("almond", "Almond milk", "base", "150 ml", 150, 40, 3, 1, 1, .6, "#efe3cc", [0, 1.5, 0, 0, 0]),
  ing("coffee", "Coffee / espresso", "base", "120 ml", 120, 5, 0, 0, .3, .8, "#3b2314", [0, 0, 0, 3, 0]),
  ing("green", "Green tea", "base", "150 ml", 150, 2, 0, 0, 0, .4, "#b7c97a", [0, 0, 0, 0, 1]),
  ing("black", "Black tea", "base", "150 ml", 150, 2, 0, 0, 0, .4, "#8a4b25", [0, 0, 0, .5, .5]),
  ing("sparkling", "Sparkling water", "base", "150 ml", 150, 0, 0, 0, 0, .5, "#d6f1ff", [0, 0, 0, 0, 2]),
  ing("vanilla", "Vanilla syrup", "flavor", "15 ml", 15, 50, 0, 12, 0, .3, "#f3d9a0", [2, 0, 0, 0, 0]),
  ing("caramel", "Caramel syrup", "flavor", "15 ml", 15, 60, .5, 13, 0, .4, "#c8802a", [2.5, .5, 0, 0, 0]),
  ing("chocolate", "Chocolate", "flavor", "15 ml", 15, 55, 2, 9, 1, .4, "#4a2a1a", [1.5, 1, 0, .5, 0]),
  ing("strawberry", "Strawberry syrup", "flavor", "15 ml", 15, 45, 0, 11, 0, .4, "#e8386b", [2, 0, 2, 0, 0]),
  ing("mango", "Mango puree", "flavor", "30 ml", 30, 40, 0, 9, .4, .6, "#ffb02e", [1.5, 0, 3, 0, .5]),
  ing("blueberry", "Blueberry syrup", "flavor", "15 ml", 15, 45, 0, 11, 0, .4, "#4b4fc9", [2, 0, 2, 0, 0]),
  ing("dragon", "Dragon fruit puree", "flavor", "30 ml", 30, 30, 0, 6, .5, .7, "#d8277f", [1, 0, 3, 0, 1]),
  ing("lime", "Lime", "flavor", "10 ml", 10, 3, 0, .5, 0, .2, "#9be15d", [0, 0, .5, 0, 2]),
  ing("mint", "Mint", "flavor", "1 sprig", 0, 2, 0, 0, 0, .2, "#3fbf7f", [0, 0, 0, 0, 2]),
  ing("ice", "Ice cubes", "topping", "handful", 30, 0, 0, 0, 0, 0, "#e6f6ff", [0, 0, 0, 0, 1.5]),
  ing("boba", "Boba pearls", "topping", "40 g", 20, 100, 0, 16, .5, .6, "#2b1a14", [1, 0, 0, 0, 0]),
  ing("whip", "Whipped cream", "topping", "20 g", 0, 52, 5, 2, .4, .5, "#fffaf0", [.5, 2, 0, 0, 0]),
  ing("cinnamon", "Cinnamon", "topping", "1 g", 0, 2, 0, 0, 0, .1, "#a0522d", [.3, 0, 0, 0, 0]),
  ing("fruit", "Fruit pieces", "topping", "30 g", 10, 15, 0, 3, .2, .5, "#ff7a45", [.5, 0, 1.5, 0, .5]),
  ing("chips", "Chocolate chips", "topping", "10 g", 0, 50, 3, 5, .6, .4, "#3a2118", [1, .5, 0, .3, 0])
];
const BY_ID = Object.fromEntries(INGREDIENTS.map(i => [i.id, i]));
const FLAVOR_NAMES = ["Sweetness", "Creaminess", "Fruitiness", "Coffee intensity", "Refreshment"];

const PRESETS = [
  { id: "caramel-latte", name: "Iced Caramel Latte", desc: "Espresso, milk and caramel over ice.", cat: "Coffee", moods: ["energetic", "focused"], flavors: ["sweet", "creamy", "bitter"], temp: "iced", bases: ["coffee", "milk"], pop: 95, recipe: { coffee: 1, milk: 1, caramel: 1, ice: 2 } },
  { id: "strawberry-milk", name: "Strawberry Milk", desc: "Creamy milk with strawberry syrup.", cat: "Milk Drinks", moods: ["happy", "relaxed"], flavors: ["sweet", "fruity", "creamy"], temp: "iced", bases: ["milk", "fruit"], pop: 88, recipe: { milk: 2, strawberry: 2, ice: 1 } },
  { id: "mango-mint", name: "Mango Mint Cooler", desc: "Mango puree, mint and lime.", cat: "Coolers", moods: ["refresh", "happy"], flavors: ["fruity", "refreshing", "sweet"], temp: "iced", bases: ["fruit"], pop: 90, recipe: { water: 1, mango: 2, mint: 2, lime: 1, ice: 2 } },
  { id: "mocha", name: "Chocolate Mocha", desc: "Warm coffee, chocolate and whipped cream.", cat: "Coffee", moods: ["cozy", "energetic"], flavors: ["sweet", "bitter", "creamy"], temp: "hot", bases: ["coffee", "milk"], pop: 85, recipe: { coffee: 1, milk: 1, chocolate: 2, whip: 1 } },
  { id: "dragon-sparkler", name: "Dragon Fruit Sparkler", desc: "Dragon fruit, lime, mint and sparkling water.", cat: "Coolers", moods: ["adventurous", "refresh"], flavors: ["fruity", "refreshing"], temp: "iced", bases: ["sparkling", "fruit"], pop: 86, recipe: { sparkling: 2, dragon: 2, lime: 1, mint: 2, ice: 2 } },
  { id: "bubble-tea", name: "Classic Bubble Tea", desc: "Black tea, milk, caramel and boba.", cat: "Tea", moods: ["happy", "adventurous"], flavors: ["sweet", "creamy"], temp: "iced", bases: ["tea", "milk"], pop: 92, recipe: { black: 1, milk: 1, caramel: 1, boba: 2, ice: 1 } },
  { id: "matcha-oat", name: "Green Tea Oat Latte", desc: "Green tea with oat milk and vanilla.", cat: "Tea", moods: ["focused", "relaxed"], flavors: ["creamy", "bitter"], temp: "iced", bases: ["tea", "milk"], pop: 78, recipe: { green: 1, oat: 1, vanilla: 1, ice: 1 } },
  { id: "herbal-calm", name: "Calm Mint Iced Tea", desc: "Green tea with mint and a squeeze of lime.", cat: "Tea", moods: ["relaxed"], flavors: ["refreshing"], temp: "iced", bases: ["tea"], pop: 70, recipe: { green: 2, mint: 1, lime: 1, ice: 2 } },
  { id: "cinnamon-milk", name: "Cinnamon Cozy Milk", desc: "Warm milk with vanilla and cinnamon.", cat: "Milk Drinks", moods: ["cozy", "relaxed"], flavors: ["sweet", "creamy"], temp: "hot", bases: ["milk"], pop: 80, recipe: { milk: 2, vanilla: 1, cinnamon: 2 } },
  { id: "berry-mint", name: "Berry Mint Refresher", desc: "Strawberry, lime and mint with sparkling water.", cat: "Coolers", moods: ["refresh", "happy"], flavors: ["fruity", "refreshing"], temp: "iced", bases: ["sparkling", "fruit"], pop: 75, recipe: { water: 1, sparkling: 1, strawberry: 1, lime: 1, mint: 2, ice: 2 } }
];
const PRESET_BY_ID = Object.fromEntries(PRESETS.map(p => [p.id, p]));

const MOODS = [
  { id: "energetic", icon: "⚡", label: "Energetic", why: "Coffee-forward drinks are a popular pick when you want a lift." },
  { id: "relaxed", icon: "🌿", label: "Relaxed", why: "Gentle tea and milk-based drinks suit a slower pace." },
  { id: "happy", icon: "☀️", label: "Happy", why: "Bright fruity flavors match a sunny mood." },
  { id: "adventurous", icon: "🪐", label: "Adventurous", why: "Bold, unusual fruit and sparkling combinations are fun to try." },
  { id: "refresh", icon: "❄️", label: "Need Refreshment", why: "Mint, lime and cold fruit are crisp and cooling." },
  { id: "focused", icon: "📚", label: "Focused", why: "Coffee or tea-based drinks are common study companions." },
  { id: "cozy", icon: "☕", label: "Feeling Cozy", why: "Warm, creamy drinks feel comforting." },
  { id: "unsure", icon: "🤔", label: "Not Sure", why: "No mood chosen, so we lean on popularity and your answers." }
];

/* ---------- Calculations ---------- */
function calcNutrition(recipe) {
  const t = { kcal: 0, fat: 0, sugar: 0, protein: 0, ml: 0, price: 0, rows: [] };
  for (const [id, q] of Object.entries(recipe)) {
    const i = BY_ID[id]; if (!i || !q) continue;
    t.rows.push({ ing: i, qty: q, kcal: i.kcal * q, ml: i.ml * q, price: i.price * q });
    t.kcal += i.kcal * q; t.fat += i.fat * q; t.sugar += i.sugar * q;
    t.protein += i.protein * q; t.ml += i.ml * q; t.price += i.price * q;
  }
  if (t.rows.length) t.price += BASE_PRICE;
  return t;
}
function flavorProfile(recipe) {
  const s = [0, 0, 0, 0, 0];
  for (const [id, q] of Object.entries(recipe)) { const i = BY_ID[id]; if (i && q) i.flavor.forEach((v, k) => s[k] += v * q); }
  return s.map(v => Math.min(100, Math.round(v * 14)));
}
const hasDairy = r => !!(r.milk || r.whip);
const recipeText = r => Object.entries(r).filter(e => e[1] > 0).map(([id, q]) => BY_ID[id].name + " ×" + q).join(", ") || "No ingredients";

/* ---------- Drink visual (layered SVG) ---------- */
let cupCount = 0;
function hex2rgb(h) { return [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)); }
function blendColors(parts) {
  let w = 0, r = 0, g = 0, b = 0;
  parts.forEach(p => { const c = hex2rgb(p.color); r += c[0] * p.w; g += c[1] * p.w; b += c[2] * p.w; w += p.w; });
  return w ? `rgb(${Math.round(r / w)},${Math.round(g / w)},${Math.round(b / w)})` : "#ccc";
}
function cupSVG(recipe) {
  const id = "cup" + (cupCount++), q = k => recipe[k] || 0;
  const liquids = Object.entries(recipe).filter(([k, n]) => n > 0 && BY_ID[k] && BY_ID[k].ml > 0 && BY_ID[k].cat !== "topping").map(([k, n]) => ({ i: BY_ID[k], n }));
  const liqMl = liquids.reduce((a, x) => a + x.i.ml * x.n, 0);
  const total = Math.min(liqMl / 400, 1) * 185;
  const flavors = liquids.filter(x => x.i.cat === "flavor"), bases = liquids.filter(x => x.i.cat === "base");
  let y = 270, layers = "", streaks = "";
  flavors.forEach(x => { // syrups sink to the bottom
    const h = x.i.ml * x.n / liqMl * total; y -= h;
    layers += `<rect class="layer" x="30" y="${y.toFixed(1)}" width="140" height="${h.toFixed(1)}" fill="${x.i.color}" opacity=".92"/>`;
  });
  if (bases.length) { // bases blend into one colour (milk lightens coffee, etc.)
    const baseMl = bases.reduce((a, x) => a + x.i.ml * x.n, 0), h = baseMl / liqMl * total; y -= h;
    layers += `<rect class="layer" x="30" y="${y.toFixed(1)}" width="140" height="${h.toFixed(1)}" fill="${blendColors(bases.map(x => ({ color: x.i.color, w: x.i.ml * x.n })))}" opacity=".93"/>`;
  }
  const top = y;
  if (total > 0) flavors.slice(0, 3).forEach((x, k) => { // syrup streaks down the inner walls
    const left = k % 2 === 0, wall = yy => left ? 40 + (yy - 70) * .09 + 3 + k : 160 - (yy - 70) * .09 - 3 - k;
    streaks += `<path class="flow" d="M${wall(72)} 72 L${wall(top)} ${top}" stroke="${x.i.color}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9"/>`;
  });
  let boba = "", ice = "", extra = "";
  const bobaN = Math.min(q("boba") * 8, 30);
  for (let i = 0; i < bobaN; i++) boba += `<circle class="boba" cx="${68 + (i % 6) * 13 + (Math.floor(i / 6) % 2) * 6}" cy="${262 - Math.floor(i / 6) * 12}" r="6" fill="#2b1a14" stroke="#6b4a3a" style="animation-delay:${i * .04}s"/>`;
  const iceN = Math.min(q("ice") * 2, 10), iceBase = Math.min(Math.max(top - 10, 78), 245);
  for (let i = 0; i < iceN; i++) {
    const x = 58 + (i % 4) * 22 + (Math.floor(i / 4) % 2) * 9, yy = Math.max(76, iceBase - Math.floor(i / 4) * 16);
    ice += `<rect class="ice" x="${x}" y="${yy}" width="20" height="20" rx="4" fill="rgba(220,245,255,.4)" stroke="rgba(255,255,255,.75)" transform="rotate(${(i * 37) % 40 - 20} ${x + 10} ${yy + 10})" style="animation-delay:${i * .05}s"/>`;
  }
  for (let i = 0; i < q("cinnamon") * 6; i++) extra += `<circle cx="${62 + (i * 37) % 76}" cy="${top + 3 + (i * 7) % 5}" r="1.7" fill="#a0522d"/>`;
  for (let i = 0; i < q("chips") * 4; i++) extra += `<rect x="${58 + (i * 23) % 82}" y="${top + 6 + (i * 11) % 12}" width="5" height="4" rx="1" fill="#3a2118"/>`;
  let over = "";
  if (q("whip")) {
    const h = 14 + q("whip") * 9;
    over += `<g class="whip"><path d="M42 72 C50 ${72 - h} 80 ${72 - h - 14} 100 ${72 - h - 10} C120 ${72 - h - 14} 150 ${72 - h} 158 72 Z" fill="#fffaf0"/><path d="M60 ${70 - h / 2} Q100 ${64 - h / 2} 140 ${70 - h / 2}" stroke="#eadfc8" stroke-width="3" fill="none"/></g>`;
  }
  for (let i = 0; i < Math.min(q("mint") * 2, 6); i++) over += `<ellipse cx="${112 + i * 7}" cy="${58 - (i % 2) * 8}" rx="14" ry="6" fill="#3fbf7f" stroke="#1f7a4d" transform="rotate(${-60 + i * 25} ${112 + i * 7} ${58 - (i % 2) * 8})"/>`;
  if (q("fruit")) over += `<g><circle cx="52" cy="68" r="15" fill="#ff7a45" stroke="#ffd2a8" stroke-width="3"/><path d="M52 53v30M37 68h30M42 58l20 20M62 58L42 78" stroke="#ffd2a8" stroke-width="1.2"/></g>`;
  return `<svg viewBox="0 0 200 300" role="img" aria-label="Live drink preview">
<defs><clipPath id="${id}"><path d="M42 70 L158 70 L141 268 Q100 278 59 268 Z"/></clipPath>
<linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".3" stop-color="#fff" stop-opacity=".02"/><stop offset=".8" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient></defs>
<ellipse cx="100" cy="285" rx="62" ry="7" fill="rgba(139,92,246,.35)"/>
<line x1="118" y1="268" x2="150" y2="22" stroke="#a78bfa" stroke-width="7" stroke-linecap="round"/>
<g clip-path="url(#${id})">${layers}${boba}${ice}${extra}${streaks}</g>
<path d="M40 70 L160 70 L142 270 Q100 281 58 270 Z" fill="url(#${id}g)" stroke="rgba(255,255,255,.55)" stroke-width="2"/>${over}</svg>`;
}

/* ---------- Reviews ---------- */
function seedReviews() {
  if (store.get("reviews", null) !== null) return;
  const list = [];
  PRESETS.forEach((p, i) => [5, 4, i % 2 ? 5 : 4].forEach((s, k) => list.push({ drink: p.id, name: "Demo sample " + (k + 1), stars: s, text: "Sample demo review (not a real customer).", demo: true, date: "Demo" })));
  store.set("reviews", list);
}
function ratingOf(drinkId) {
  const list = store.get("reviews", []).filter(r => !drinkId || r.drink === drinkId);
  return { avg: list.length ? list.reduce((a, r) => a + r.stars, 0) / list.length : 0, count: list.length };
}

/* ---------- Cards (menu + home) ---------- */
function drinkCard(p) {
  const n = calcNutrition(p.recipe), rt = ratingOf(p.id);
  return `<article class="card"><div class="cup-box">${cupSVG(p.recipe)}</div><h3>${p.name}</h3><p>${p.desc}</p>
  <div class="meta"><b>${money(n.price)}</b><span class="stars" title="Demo ratings">${stars(rt.avg)} <small>${rt.avg.toFixed(1)} (${rt.count})</small></span></div>
  <p>~${Math.round(n.kcal)} kcal · ${p.temp === "hot" ? "Hot" : "Iced"}</p>
  <div class="btn-row"><button class="btn small" data-act="details" data-id="${p.id}">View Details</button><button class="btn small" data-act="customize" data-id="${p.id}">Customize</button><button class="btn small primary" data-act="addPreset" data-id="${p.id}">Add to Cart</button></div></article>`;
}
function renderMenu() {
  const q = $("#fSearch").value.trim().toLowerCase(), cat = $("#fCat").value, mood = $("#fMood").value, temp = $("#fTemp").value, diet = $("#fDiet").value, sort = $("#fSort").value;
  let list = PRESETS.filter(p => {
    const n = calcNutrition(p.recipe);
    return (!q || p.name.toLowerCase().includes(q)) && (cat === "all" || p.cat === cat) && (mood === "all" || p.moods.includes(mood)) &&
      (temp === "all" || p.temp === temp) &&
      (diet === "all" || (diet === "dairyfree" && !hasDairy(p.recipe)) || (diet === "lowsugar" && n.sugar <= 15) || (diet === "lowcal" && n.kcal <= 120));
  });
  list.sort((a, b) => sort === "price" ? calcNutrition(a.recipe).price - calcNutrition(b.recipe).price : sort === "rating" ? ratingOf(b.id).avg - ratingOf(a.id).avg : b.pop - a.pop);
  $("#menuGrid").innerHTML = list.length ? list.map(drinkCard).join("") : `<div class="glass">No drinks match your filters. Try clearing a filter.</div>`;
}

/* ---------- Mood engine (transparent rules) ---------- */
const mood = { id: null };
function renderMoodGrid() {
  $("#moodGrid").innerHTML = MOODS.map(m => `<button class="mood ${mood.id === m.id ? "on" : ""}" role="radio" aria-checked="${mood.id === m.id}" data-act="mood" data-id="${m.id}"><span>${m.icon}</span>${m.label}</button>`).join("");
}
function recommend() {
  const a = { flavor: $("#qFlavor").value, temp: $("#qTemp").value, base: $("#qBase").value, sweet: $("#qSweet").value, diet: $("#qDiet").value };
  let best = null, bestScore = -99, bestWhy = [];
  PRESETS.forEach(p => {
    const n = calcNutrition(p.recipe); let s = p.pop / 100; const why = [];
    if (mood.id !== "unsure") { const idx = p.moods.indexOf(mood.id); if (idx >= 0) { s += idx === 0 ? 4 : 3; why.push("your mood"); } }
    if (a.flavor !== "any" && p.flavors.includes(a.flavor)) { s += 2; why.push(a.flavor + " flavor"); }
    if (a.temp !== "any" && p.temp === a.temp) { s += 2; why.push(a.temp); } else if (a.temp !== "any") s -= 2;
    if (a.base !== "any" && p.bases.includes(a.base)) { s += 2; why.push(a.base + " base"); }
    const level = n.sugar <= 10 ? "low" : n.sugar <= 25 ? "medium" : "high";
    if (a.sweet !== "any" && a.sweet === level) { s += 1; why.push(level + " sweetness"); }
    if (a.diet === "dairyfree") { if (hasDairy(p.recipe)) s -= 10; else { s += 2; why.push("dairy-free"); } }
    if (a.diet === "lowsugar") { if (n.sugar <= 15) { s += 2; why.push("lower sugar"); } else s -= 3; }
    if (s > bestScore) { best = p; bestScore = s; bestWhy = why; }
  });
  return { p: best, why: bestWhy };
}
function renderMoodResult() {
  if (!mood.id) return;
  const { p, why } = recommend(), m = MOODS.find(x => x.id === mood.id), n = calcNutrition(p.recipe), fp = flavorProfile(p.recipe);
  const top = fp.map((v, i) => [v, FLAVOR_NAMES[i]]).sort((x, y) => y[0] - x[0]).filter(x => x[0] > 0).slice(0, 3).map(x => x[1]).join(", ");
  $("#moodResult").innerHTML = `<div class="cup-box">${cupSVG(p.recipe)}</div><div><span class="badge">Your match</span><h3>${p.name}</h3>
  <p>${m.why} ${why.length ? "Matched on: " + why.join(", ") + "." : ""}</p>
  <p class="muted">~${Math.round(n.kcal)} kcal · ${r1(n.fat)} g fat · Flavor: ${top} · ${money(n.price)}</p>
  <div class="btn-row"><button class="btn ghost" data-act="customize" data-id="${p.id}">Customize This Drink</button><button class="btn primary" data-act="addPreset" data-id="${p.id}">Add to Cart</button></div>
  <p class="note">Rule-based suggestion, not a real AI model. It makes no claim about changing your emotions.</p></div>`;
}

/* ---------- Builder ---------- */
const builder = { name: "My Custom Drink", recipe: {}, history: [] };
function pushHistory() { builder.history.push(JSON.stringify(builder.recipe)); if (builder.history.length > 30) builder.history.shift(); }
function changeQty(id, d) {
  const cur = builder.recipe[id] || 0, next = Math.max(0, Math.min(MAX_QTY, cur + d));
  if (next === cur) return;
  pushHistory(); if (next) builder.recipe[id] = next; else delete builder.recipe[id];
  updateBuilder();
}
function loadRecipe(recipe, name) { pushHistory(); builder.recipe = { ...recipe }; builder.name = name; $("#recipeName").value = name; updateBuilder(); }
function renderControls() {
  ["base", "flavor", "topping"].forEach(cat => {
    $("#ing" + cat[0].toUpperCase() + cat.slice(1)).innerHTML = INGREDIENTS.filter(i => i.cat === cat).map(i =>
      `<div class="ing"><span class="swatch" style="background:${i.color}"></span><div class="ing-info"><b>${i.name}</b><small>${i.unit} · ${i.kcal} kcal · ${i.fat} g fat · +${money(i.price)}</small></div>
      <div class="stepper"><button data-act="qty" data-id="${i.id}" data-d="-1" aria-label="Remove ${i.name}">−</button><output data-qty="${i.id}" aria-live="polite">0</output><button data-act="qty" data-id="${i.id}" data-d="1" aria-label="Add ${i.name}">+</button></div></div>`).join("");
  });
  $("#presetChips").innerHTML = PRESETS.map(p => `<button class="chip" data-act="loadPreset" data-id="${p.id}">${p.name}</button>`).join("");
}
function renderNutrition(recipe) {
  const n = calcNutrition(recipe), colors = ["#8b5cf6", "#38bdf8", "#f472b6", "#fbbf24", "#34d399", "#fb7185", "#a3e635", "#f97316"];
  const meter = (l, v, max, u) => `<div class="meter"><div class="meter-top"><span>${l}</span><b>${r1(v)} ${u}</b></div><div class="track"><i style="width:${Math.min(100, v / max * 100)}%"></i></div></div>`;
  const kRows = n.rows.filter(r => r.kcal > 0); let acc = 0, segs = [];
  kRows.forEach((r, k) => { const s = acc, e = acc + r.kcal / n.kcal * 100; segs.push(`${colors[k % 8]} ${s}% ${e}%`); acc = e; });
  const donut = n.kcal > 0 ? `conic-gradient(${segs.join(",")})` : "#2a2a3a";
  $("#nutri").innerHTML = `<div class="nutri-top"><div class="donut" style="background:${donut}"><div><span><b>${Math.round(n.kcal)}</b>kcal</span></div></div>
  <div style="flex:1">${meter("Fat", n.fat, 20, "g")}${meter("Sugar", n.sugar, 50, "g")}${meter("Protein", n.protein, 15, "g")}${meter("Volume", n.ml, 500, "ml")}</div></div>
  <h4>Calorie breakdown</h4>${n.rows.length ? n.rows.map(r => { const k = kRows.indexOf(r); return `<div class="legend-row"><span><i class="dot" style="background:${k >= 0 ? colors[k % 8] : "#555"}"></i>${r.ing.name} ×${r.qty}</span><span>${r1(r.kcal)} kcal</span></div>`; }).join("") : `<p class="muted">Add ingredients to see the breakdown.</p>`}
  <p class="note">Bars scale to a sample reference (500 kcal, 20 g fat, 50 g sugar, 15 g protein, 500 ml). Lower is not automatically "healthier".</p>`;
}
function renderFlavor(recipe) {
  const fp = flavorProfile(recipe), cols = ["#f472b6", "#fbbf24", "#fb7185", "#a16207", "#38bdf8"];
  $("#flavorBars").innerHTML = fp.map((v, i) => `<div class="meter"><div class="meter-top"><span>${FLAVOR_NAMES[i]}</span><b>${v}</b></div><div class="track"><i style="width:${v}%;background:${cols[i]}"></i></div></div>`).join("");
}
/* Smart suggestions: simple, visible rules. Each fn changes the recipe object it is given (builder.recipe). */
let currentTips = [];
function buildTips(r) {
  const fp = flavorProfile(r), tips = [], n = calcNutrition(r), has = id => (r[id] || 0) > 0;
  const syrups = ["vanilla", "caramel", "chocolate", "strawberry", "blueberry"];
  if (!n.rows.length) return [{ text: "Start by adding a drink base such as coffee, tea or milk.", label: "Add coffee", fn: () => { r.coffee = 1; } }];
  if (fp[0] > 70 && syrups.some(has)) tips.push({ text: "Your recipe is very sweet. Try reducing the syrup.", label: "Reduce syrup", fn: () => syrups.forEach(s => { if (r[s] > 1) r[s]--; else if (r[s] === 1 && fp[0] > 85) delete r[s]; }) });
  if (fp[4] < 20 && !has("lime")) tips.push({ text: "Add lime for a brighter, tangier flavor.", label: "Add lime", fn: () => { r.lime = 1; } });
  if (fp[1] < 35 && !has("oat") && (has("coffee") || has("green") || has("black"))) tips.push({ text: "Want a creamier texture? Try oat milk.", label: "Add oat milk", fn: () => { r.oat = 1; } });
  if (fp[3] >= 60 && !has("milk") && !has("oat") && !has("almond")) tips.push({ text: "Your coffee flavor is strong. Add milk to soften it.", label: "Add milk", fn: () => { r.milk = 1; } });
  if (fp[3] > 0 && fp[2] > 40) tips.push({ text: "This combination might taste unusual. Try a smaller quantity first.", label: "Halve fruit", fn: () => ["mango", "strawberry", "blueberry", "dragon"].forEach(f => { if (r[f] > 1) r[f] = Math.ceil(r[f] / 2); }) });
  if (n.ml > 450) tips.push({ text: "This is a large drink. Fewer ice cubes keeps it within a regular cup.", label: "Remove ice", fn: () => { delete r.ice; } });
  return tips.slice(0, 4);
}
function renderTips() {
  currentTips = buildTips(builder.recipe);
  $("#suggestions").innerHTML = currentTips.length ? currentTips.map((t, i) => `<div class="tip"><span>💡 ${t.text}</span><button class="btn small" data-act="applyTip" data-id="${i}">${t.label}</button></div>`).join("") : `<p class="muted">Looking balanced. No suggestions right now.</p>`;
}
/* Goals */
let goalPlanCache = null;
function planGoal(goal, recipe) {
  const r = { ...recipe }, changes = [], syrups = ["vanilla", "caramel", "chocolate", "strawberry", "blueberry"];
  const swap = (from, to, label) => { if (r[from]) { r[to] = Math.min(MAX_QTY, (r[to] || 0) + r[from]); delete r[from]; changes.push(label); } };
  if (goal === "lowcal") {
    swap("milk", "almond", "Whole milk → almond milk");
    syrups.forEach(s => { if (r[s] > 1) { r[s] = 1; changes.push(BY_ID[s].name + " reduced"); } });
    if (r.whip) { delete r.whip; changes.push("Removed whipped cream"); }
  } else if (goal === "lowsugar") {
    syrups.forEach(s => { if (r[s]) { r[s] = Math.ceil(r[s] / 2); changes.push(BY_ID[s].name + " reduced"); } });
    if (r.boba) { r.boba = Math.ceil(r.boba / 2); changes.push("Fewer boba pearls"); }
  } else if (goal === "dairyfree") {
    swap("milk", "oat", "Milk → oat milk");
    if (r.whip) { delete r.whip; changes.push("Removed whipped cream"); }
  } else if (goal === "fruity") { r.mango = Math.min(MAX_QTY, (r.mango || 0) + 1); changes.push("Added mango puree"); }
  else if (goal === "creamy") { r.oat = Math.min(MAX_QTY, (r.oat || 0) + 1); changes.push("Added oat milk"); }
  return { recipe: r, changes };
}
function renderGoal() {
  const goal = $("#goalSelect").value, box = $("#goalResult"); goalPlanCache = null;
  if (goal === "none" || !Object.keys(builder.recipe).length) { box.innerHTML = ""; return; }
  const plan = planGoal(goal, builder.recipe);
  if (!plan.changes.length) { box.innerHTML = `<p class="muted">Your recipe already fits this preference.</p>`; return; }
  const a = calcNutrition(builder.recipe), b = calcNutrition(plan.recipe); goalPlanCache = plan;
  box.innerHTML = `<p class="muted">${plan.changes.join(" · ")}</p><div class="compare">
  <div>Calories<br><b>${Math.round(a.kcal)} → ${Math.round(b.kcal)}</b></div><div>Fat<br><b>${r1(a.fat)} → ${r1(b.fat)} g</b></div><div>Sugar<br><b>${r1(a.sugar)} → ${r1(b.sugar)} g</b></div></div>
  <button class="btn small primary" data-act="applyGoal">Apply substitutions</button>`;
}
function updateBuilder() {
  const r = builder.recipe, n = calcNutrition(r);
  $("#builderCup").innerHTML = cupSVG(r);
  $$("[data-qty]").forEach(o => o.textContent = r[o.dataset.qty] || 0);
  $("#volText").textContent = Math.round(n.ml) + " ml";
  $("#builderPrice").textContent = money(n.price);
  $("#undoBtn").disabled = !builder.history.length;
  renderNutrition(r); renderFlavor(r); renderTips(); renderGoal();
}

/* ---------- Cart ---------- */
const getCart = () => store.get("cart", []);
function saveCart(c) { store.set("cart", c); $("#cartCount").textContent = c.reduce((a, i) => a + i.qty, 0); }
function addToCart(name, recipe) {
  if (!Object.keys(recipe).length || calcNutrition(recipe).ml <= 0) { toast("Add a drink base or flavor first."); return; }
  const cart = getCart(), key = JSON.stringify(recipe), found = cart.find(i => i.name === name && JSON.stringify(i.recipe) === key);
  if (found) found.qty++; else cart.push({ uid: uid(), name, recipe: { ...recipe }, qty: 1 });
  saveCart(cart); addRecent(name, recipe); toast(name + " added to cart");
}
function addRecent(name, recipe) {
  const rec = store.get("recent", []).filter(x => !(x.name === name && JSON.stringify(x.recipe) === JSON.stringify(recipe)));
  rec.unshift({ name, recipe: { ...recipe }, date: new Date().toLocaleString() }); store.set("recent", rec.slice(0, 6));
}
function cartTotals() {
  const items = getCart(), sub = items.reduce((a, i) => a + calcNutrition(i.recipe).price * i.qty, 0);
  const mode = $("#cMode") ? $("#cMode").value : "pickup", service = mode === "dine-in" ? sub * SERVICE_RATE : 0;
  return { sub, service, total: sub + service, mode };
}
function renderCart() {
  const items = getCart(); $("#successView").hidden = true; $("#cartView").hidden = false;
  $("#cartItems").innerHTML = items.length ? items.map(i => { const n = calcNutrition(i.recipe); return `<div class="glass item"><div class="cup-box">${cupSVG(i.recipe)}</div>
  <div class="item-info"><b>${esc(i.name)}</b><br><small>${recipeText(i.recipe)}</small><br><small>~${Math.round(n.kcal)} kcal · ${r1(n.fat)} g fat each · ${money(n.price)} each</small></div>
  <div class="stepper"><button data-act="cartQty" data-id="${i.uid}" data-d="-1" aria-label="Decrease quantity">−</button><output>${i.qty}</output><button data-act="cartQty" data-id="${i.uid}" data-d="1" aria-label="Increase quantity">+</button></div>
  <button class="btn small" data-act="cartRemove" data-id="${i.uid}" aria-label="Remove ${esc(i.name)}">Remove</button></div>`; }).join("")
    : `<div class="glass"><p>Your cart is empty.</p><div class="btn-row"><a class="btn primary" href="#menu">Browse the menu</a><a class="btn ghost" href="#create">Create a drink</a></div></div>`;
  const t = cartTotals();
  $("#cartTotals").innerHTML = `<div class="tot"><span>Subtotal</span><span>${money(t.sub)}</span></div><div class="tot"><span>Service charge</span><span>${money(t.service)}</span></div><div class="tot big"><span>Total</span><span>${money(t.total)}</span></div>`;
}
function orderSummaryHTML(items, t) {
  return items.map(i => { const n = calcNutrition(i.recipe); return `<div class="rowitem"><b>${esc(i.name)} ×${i.qty}</b> — ${money(n.price * i.qty)}<br><small class="muted">${recipeText(i.recipe)}<br>~${Math.round(n.kcal * i.qty)} kcal · ${r1(n.fat * i.qty)} g fat · ${r1(n.sugar * i.qty)} g sugar (estimates)</small></div>`; }).join("") +
    `<div class="tot"><span>Subtotal</span><span>${money(t.sub)}</span></div><div class="tot"><span>Service</span><span>${money(t.service)}</span></div><div class="tot big"><span>Total</span><span>${money(t.total)}</span></div>`;
}
function statusOf(o) { const m = (Date.now() - o.created) / 60000; return m < .5 ? "Order received" : m < 2 ? "Preparing" : "Ready (demo)"; }

/* ---------- Seats ---------- */
const TABLES = [{ id: "T1", seats: 2 }, { id: "T2", seats: 2 }, { id: "T3", seats: 4 }, { id: "T4", seats: 4 }, { id: "T5", seats: 4 }, { id: "T6", seats: 6 }, { id: "T7", seats: 2 }, { id: "T8", seats: 4 }];
const SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
const seatState = { time: "", selected: new Set() };
const allSeats = () => TABLES.flatMap(t => Array.from({ length: t.seats }, (_, k) => t.id + "-S" + (k + 1)));
function hashStr(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
function reservedSeats(date, time) { const s = new Set(); store.get("res", []).forEach(r => { if (r.date === date && r.time === time) r.seats.forEach(x => s.add(x)); }); return s; }
const isOccupied = (date, time, seat) => reservedSeats(date, time).has(seat) || hashStr(date + time + seat) % 100 < 28; // simulated
function renderBooking() {
  const date = $("#bDate").value;
  $("#slotList").innerHTML = SLOTS.map(t => { const free = allSeats().filter(s => !isOccupied(date, t, s)).length; return `<button class="chip ${seatState.time === t ? "on" : ""}" data-act="slot" data-id="${t}" ${free ? "" : "disabled"}>${t} · ${free} free</button>`; }).join("");
  renderFloor();
}
function renderFloor() {
  const date = $("#bDate").value, time = seatState.time;
  $("#floor").innerHTML = TABLES.map(t => `<div class="table"><button class="table-top" data-act="tableSelect" data-id="${t.id}" ${time ? "" : "disabled"}>${t.id} · ${t.seats} seats</button><div class="seats">` +
    Array.from({ length: t.seats }, (_, k) => {
      const s = t.id + "-S" + (k + 1), occ = time && isOccupied(date, time, s), sel = seatState.selected.has(s), cls = !time ? "idle" : occ ? "occupied" : sel ? "selected" : "available";
      return `<button class="seat ${cls}" data-act="seat" data-id="${s}" ${!time || occ ? "disabled" : ""} aria-pressed="${sel}" aria-label="Seat ${s}, ${time ? cls : "choose a time first"}">${k + 1}</button>`;
    }).join("") + `</div></div>`).join("");
  const guests = +$("#bGuests").value;
  $("#selSummary").textContent = seatState.selected.size ? `Seats: ${[...seatState.selected].join(", ")} · ${date} ${time} · ${guests} guest(s)` : "No seats selected. Choose a time slot, then pick seats.";
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const orders = store.get("orders", []), res = store.get("res", []), favs = store.get("favs", []), rec = store.get("recent", []), revs = store.get("reviews", []).filter(r => !r.demo);
  $("#ordersList").innerHTML = orders.length ? orders.map(o => `<div class="rowitem"><b>${o.id}</b> <span class="badge">${statusOf(o)}</span><br>${o.items.map(i => esc(i.name) + " ×" + i.qty).join(", ")}<br><small class="muted">${o.mode} · ${money(o.total)} · ${new Date(o.created).toLocaleString()} (simulated status)</small></div>`).join("") : `<p class="muted">No demo orders yet. <a href="#menu"><u>Order a drink</u></a>.</p>`;
  $("#resList").innerHTML = res.length ? res.map(r => `<div class="rowitem"><b>${r.id}</b> <span class="badge">${r.status}</span><br>${r.date} at ${r.time} · ${r.guests} guest(s)<br><small class="muted">Seats: ${r.seats.join(", ")}</small><br><button class="btn small" data-act="cancelRes" data-id="${r.id}">Cancel</button></div>`).join("") : `<p class="muted">No reservations yet. <a href="#book"><u>Book a seat</u></a>.</p>`;
  $("#favList").innerHTML = favs.length ? favs.map((f, i) => `<div class="rowitem"><b>${esc(f.name)}</b><br><small class="muted">${recipeText(f.recipe)}</small><div class="btn-row"><button class="btn small" data-act="loadFav" data-id="${i}">Load</button><button class="btn small" data-act="addFav" data-id="${i}">Add to cart</button><button class="btn small" data-act="delFav" data-id="${i}">Delete</button></div></div>`).join("") : `<p class="muted">No saved recipes. Use "Save Recipe" in the builder.</p>`;
  $("#recentList").innerHTML = rec.length ? rec.map((f, i) => `<div class="rowitem"><b>${esc(f.name)}</b><br><small class="muted">${recipeText(f.recipe)}</small><div class="btn-row"><button class="btn small" data-act="loadRecent" data-id="${i}">Load</button></div></div>`).join("") : `<p class="muted">Recipes you add to the cart appear here.</p>`;
  $("#reviewHistory").innerHTML = revs.length ? revs.map(r => `<div class="rev"><span class="stars">${stars(r.stars)}</span> <b>${esc(PRESET_BY_ID[r.drink]?.name || "Drink")}</b><br>${esc(r.text)}<br><small class="muted">${esc(r.name)} · ${r.date}</small></div>`).join("") : `<p class="muted">You haven't submitted any reviews yet.</p>`;
}
function renderReviews() {
  const list = store.get("reviews", []).slice().reverse().slice(0, 8);
  $("#reviewList").innerHTML = list.map(r => `<div class="rev"><span class="stars">${stars(r.stars)}</span> <b>${esc(PRESET_BY_ID[r.drink]?.name || "")}</b> ${r.demo ? '<span class="badge">demo</span>' : ""}<br>${esc(r.text)}<br><small class="muted">${esc(r.name)}</small></div>`).join("");
}
function renderRatingSummary() {
  const list = store.get("reviews", []), o = ratingOf();
  $("#ratingSummary").innerHTML = `<p><span class="stars">${stars(o.avg)}</span> <b>${o.avg.toFixed(1)}</b> from ${o.count} ratings <span class="badge">includes demo data</span></p>` +
    [5, 4, 3, 2, 1].map(s => { const c = list.filter(r => r.stars === s).length; return `<div class="meter"><div class="meter-top"><span>${s} ★</span><span>${c}</span></div><div class="track"><i style="width:${o.count ? c / o.count * 100 : 0}%"></i></div></div>`; }).join("");
}
function renderHome() {
  $("#heroCup").innerHTML = cupSVG(PRESET_BY_ID["dragon-sparkler"].recipe);
  $("#popularGrid").innerHTML = [...PRESETS].sort((a, b) => b.pop - a.pop).slice(0, 4).map(drinkCard).join("");
  renderFeatured(); renderRatingSummary();
}
const featured = { ...PRESET_BY_ID["mango-mint"].recipe };
function renderFeatured() {
  $("#featCup").innerHTML = cupSVG(featured); const n = calcNutrition(featured);
  $("#featInfo").textContent = `~${Math.round(n.kcal)} kcal · ${r1(n.fat)} g fat · ${r1(n.sugar)} g sugar · ${Math.round(n.ml)} ml`;
  $$("[data-act=featToggle]").forEach(b => b.classList.toggle("on", !!featured[b.dataset.id]));
}

/* ---------- Dialogs ---------- */
function showDetails(id) {
  const p = PRESET_BY_ID[id], n = calcNutrition(p.recipe), rt = ratingOf(id), revs = store.get("reviews", []).filter(r => r.drink === id).slice(-3);
  $("#detailDialog").innerHTML = `<h2>${p.name}</h2><div class="cup-box" style="max-width:150px">${cupSVG(p.recipe)}</div><p>${p.desc}</p>
  <p class="stars">${stars(rt.avg)} <small>${rt.avg.toFixed(1)} (${rt.count}, demo ratings)</small></p>
  <p><b>Ingredients:</b> ${recipeText(p.recipe)}</p>
  <p>~${Math.round(n.kcal)} kcal · ${r1(n.fat)} g fat · ${r1(n.sugar)} g sugar · ${r1(n.protein)} g protein · ${Math.round(n.ml)} ml · ${money(n.price)}</p>
  <p class="note">Estimated nutrition values. Actual values vary by ingredient brand, serving size, and preparation.</p>
  ${revs.map(r => `<div class="rev">${stars(r.stars)} ${esc(r.text)}</div>`).join("")}
  <div class="btn-row"><button class="btn primary" data-act="addPreset" data-id="${id}">Add to Cart</button><button class="btn ghost" data-act="customize" data-id="${id}">Customize</button><button class="btn ghost" data-act="closeDialog">Close</button></div>`;
  $("#detailDialog").showModal();
}

/* ---------- Click actions (event delegation) ---------- */
const actions = {
  mood(id) { mood.id = id; renderMoodGrid(); renderMoodResult(); },
  details: showDetails,
  customize(id) { $$("dialog[open]").forEach(d => d.close()); loadRecipe(PRESET_BY_ID[id].recipe, PRESET_BY_ID[id].name); location.hash = "#create"; },
  addPreset(id) { addToCart(PRESET_BY_ID[id].name, PRESET_BY_ID[id].recipe); },
  loadPreset(id) { loadRecipe(PRESET_BY_ID[id].recipe, PRESET_BY_ID[id].name); },
  qty(id, b) { changeQty(id, +b.dataset.d); },
  applyTip(i) {
    const tip = currentTips[+i]; if (!tip) return;
    pushHistory(); tip.fn();
    Object.keys(builder.recipe).forEach(k => { if (!(builder.recipe[k] > 0)) delete builder.recipe[k]; });
    updateBuilder();
  },
  applyGoal() { if (!goalPlanCache) return; pushHistory(); builder.recipe = { ...goalPlanCache.recipe }; updateBuilder(); toast("Substitutions applied"); },
  featToggle(id) { featured[id] = featured[id] ? 0 : (id === "ice" ? 2 : 1); renderFeatured(); },
  featCustomize() { const r = {}; Object.keys(featured).forEach(k => { if (featured[k] > 0) r[k] = featured[k]; }); loadRecipe(r, "Mango Mint Cooler"); location.hash = "#create"; },
  cartQty(id, b) { const c = getCart(), it = c.find(i => i.uid === id); if (!it) return; it.qty = Math.max(1, Math.min(20, it.qty + +b.dataset.d)); saveCart(c); renderCart(); },
  cartRemove(id) { saveCart(getCart().filter(i => i.uid !== id)); renderCart(); },
  star(n) { reviewStars = +n; renderStars(); },
  slot(t) { seatState.time = t; seatState.selected.clear(); renderBooking(); },
  seat(s) {
    const guests = +$("#bGuests").value;
    if (seatState.selected.has(s)) seatState.selected.delete(s);
    else if (seatState.selected.size >= guests) { toast("You've already picked " + guests + " seat(s) for " + guests + " guest(s)."); return; }
    else seatState.selected.add(s);
    renderFloor();
  },
  tableSelect(id) {
    const date = $("#bDate").value, guests = +$("#bGuests").value, t = TABLES.find(x => x.id === id);
    Array.from({ length: t.seats }, (_, k) => id + "-S" + (k + 1)).forEach(s => { if (!isOccupied(date, seatState.time, s) && seatState.selected.size < guests) seatState.selected.add(s); });
    renderFloor();
  },
  cancelRes(id) { store.set("res", store.get("res", []).filter(r => r.id !== id)); renderDashboard(); toast("Reservation cancelled"); },
  loadFav(i) { const f = store.get("favs", [])[+i]; loadRecipe(f.recipe, f.name); location.hash = "#create"; },
  addFav(i) { const f = store.get("favs", [])[+i]; addToCart(f.name, f.recipe); },
  delFav(i) { const f = store.get("favs", []); f.splice(+i, 1); store.set("favs", f); renderDashboard(); },
  loadRecent(i) { const f = store.get("recent", [])[+i]; loadRecipe(f.recipe, f.name); location.hash = "#create"; },
  closeDialog(id, b) { b.closest("dialog").close(); },
  confirmOrder() { placeOrder(); },
};
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
  const fn = actions[b.dataset.act]; if (fn) fn(b.dataset.id, b);
});

/* ---------- Order flow ---------- */
let pendingOrder = null;
function placeOrder() {
  const o = pendingOrder; if (!o) return;
  const orders = store.get("orders", []); orders.unshift(o); store.set("orders", orders);
  saveCart([]); $("#confirmDialog").close(); $("#checkoutForm").reset();
  $("#cartView").hidden = true; $("#successView").hidden = false;
  $("#successView").innerHTML = `<h2>✔ Demo order placed!</h2><p>Your demo order ID</p><p class="oid">${o.id}</p>
  <p class="muted">${o.mode} for ${esc(o.name)} · ${esc(o.phone)}${o.notes ? " · Note: " + esc(o.notes) : ""}</p><div style="text-align:left;max-width:520px;margin:16px auto">${orderSummaryHTML(o.items, o)}</div>
  <p class="note">This is a simulated order. No payment was taken and no real café received it.</p>
  <div class="btn-row" style="justify-content:center"><a class="btn primary" href="#orders">View My Orders</a><a class="btn ghost" href="#book">Book a Seat</a></div>`;
  pendingOrder = null; toast("Order " + o.id + " placed (demo)");
}

/* ---------- Forms ---------- */
const phoneOK = v => /^[0-9+\-\s]{7,15}$/.test(v);
let reviewStars = 0;
function renderStars() { $("#starInput").innerHTML = [1, 2, 3, 4, 5].map(n => `<button type="button" class="${n <= reviewStars ? "on" : ""}" data-act="star" data-id="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join(""); }

function initForms() {
  $("#checkoutForm").addEventListener("submit", e => {
    e.preventDefault(); const items = getCart();
    if (!items.length) { toast("Your cart is empty."); return; }
    const name = $("#cName").value.trim(), phone = $("#cPhone").value.trim();
    const ok1 = fieldErr("cName", name.length < 2 ? "Please enter your name." : ""), ok2 = fieldErr("cPhone", phoneOK(phone) ? "" : "Enter a valid contact number (7–15 digits).");
    if (!ok1 || !ok2) return;
    const t = cartTotals();
    pendingOrder = { id: "MB-" + uid(), items: JSON.parse(JSON.stringify(items)), sub: t.sub, service: t.service, total: t.total, mode: t.mode, name, phone, notes: $("#cNotes").value.trim(), created: Date.now() };
    $("#confirmDialog").innerHTML = `<h2>Confirm your demo order</h2>${orderSummaryHTML(pendingOrder.items, t)}<p class="note">Demo only — no payment, no real café.</p>
    <div class="btn-row"><button class="btn primary" data-act="confirmOrder">Confirm Demo Order</button><button class="btn ghost" data-act="closeDialog">Back</button></div>`;
    $("#confirmDialog").showModal();
  });
  $("#cMode").addEventListener("change", renderCart);

  $("#bookForm").addEventListener("submit", e => {
    e.preventDefault();
    const date = $("#bDate").value, time = seatState.time, guests = +$("#bGuests").value, name = $("#bName").value.trim(), phone = $("#bPhone").value.trim();
    let ok = true;
    if (!date || date < todayISO()) { toast("Please choose today or a future date."); ok = false; }
    if (!time) { fieldErr("bSeats", "Choose a time slot."); ok = false; }
    else ok = fieldErr("bSeats", seatState.selected.size !== guests ? `Select exactly ${guests} seat(s) (you picked ${seatState.selected.size}).` : "") && ok;
    ok = fieldErr("bName", name.length < 2 ? "Please enter your name." : "") && ok;
    ok = fieldErr("bPhone", phoneOK(phone) ? "" : "Enter a valid contact number.") && ok;
    if (!ok) return;
    const taken = reservedSeats(date, time);
    if ([...seatState.selected].some(s => taken.has(s))) { toast("One of those seats was just reserved. Please re-pick."); seatState.selected.clear(); renderBooking(); return; }
    const res = { id: "RS-" + uid(), date, time, guests, seats: [...seatState.selected], name, phone, status: "Confirmed (demo)", created: Date.now() };
    const all = store.get("res", []); all.unshift(res); store.set("res", all);
    seatState.selected.clear(); renderBooking(); $("#bookForm").reset();
    const box = $("#resSummary"); box.hidden = false;
    box.innerHTML = `<h3>✔ Reservation confirmed (demo)</h3><p class="oid">${res.id}</p><p>${esc(name)} · ${res.date} at ${res.time}</p><p>${res.guests} guest(s) · Seats ${res.seats.join(", ")}</p><span class="badge">${res.status}</span>
    <p class="note">Simulated booking saved in this browser only.</p><a class="btn ghost small" href="#orders">View My Reservations</a>`;
    toast("Reservation " + res.id + " confirmed (demo)");
  });

  $("#reviewForm").addEventListener("submit", e => {
    e.preventDefault();
    const drink = $("#rDrink").value, name = $("#rName").value.trim(), text = $("#rText").value.trim();
    let ok = fieldErr("rDrink", drink ? "" : "Choose a drink.");
    ok = fieldErr("rName", name.length < 2 ? "Please enter your name." : "") && ok;
    ok = fieldErr("rStars", reviewStars ? "" : "Select a star rating.") && ok;
    ok = fieldErr("rText", text.length < 5 ? "Write at least 5 characters." : "") && ok;
    if (!ok) return;
    const list = store.get("reviews", []); list.push({ drink, name, stars: reviewStars, text, demo: false, date: new Date().toLocaleDateString() }); store.set("reviews", list);
    $("#reviewForm").reset(); reviewStars = 0; renderStars(); renderReviews(); renderMenu(); renderRatingSummary(); toast("Thanks! Your review was saved (demo).");
  });
}

/* ---------- Router ---------- */
function route() {
  const h = location.hash.slice(1) || "home", el = document.getElementById(h);
  const page = el && el.classList.contains("page") ? h : "home";
  $$(".page").forEach(p => p.hidden = p.id !== page);
  $$("#navLinks a").forEach(a => a.classList.toggle("active", a.dataset.page === page));
  if (page === "orders") renderDashboard();
  if (page === "cart") renderCart();
  if (page === "menu") { renderMenu(); renderReviews(); }
  if (page === "book") renderBooking();
  if (page === "home") renderHome();
  if (el && !el.classList.contains("page")) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 40); else window.scrollTo(0, 0);
  $("#navLinks").classList.remove("open");
}

/* ---------- Init ---------- */
function init() {
  seedReviews(); saveCart(getCart());
  renderMoodGrid(); renderControls(); renderStars();
  $("#rDrink").innerHTML = `<option value="">Select a drink…</option>` + PRESETS.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  $("#bGuests").innerHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `<option value="${n}">${n}</option>`).join("");
  $("#bDate").value = todayISO(); $("#bDate").min = todayISO();
  $("#menuToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
  ["qFlavor", "qTemp", "qBase", "qSweet", "qDiet"].forEach(id => $("#" + id).addEventListener("change", renderMoodResult));
  ["fSearch", "fCat", "fMood", "fTemp", "fDiet", "fSort"].forEach(id => $("#" + id).addEventListener("input", renderMenu));
  $("#goalSelect").addEventListener("change", renderGoal);
  $("#recipeName").addEventListener("input", e => builder.name = e.target.value);
  $("#undoBtn").addEventListener("click", () => { if (!builder.history.length) return; builder.recipe = JSON.parse(builder.history.pop()); updateBuilder(); });
  $("#resetBtn").addEventListener("click", () => { if (!Object.keys(builder.recipe).length) return; pushHistory(); builder.recipe = {}; updateBuilder(); toast("Recipe reset"); });
  $("#addCustomBtn").addEventListener("click", () => addToCart(builder.name.trim() || "My Custom Drink", builder.recipe));
  $("#saveRecipeBtn").addEventListener("click", () => {
    if (!Object.keys(builder.recipe).length) { toast("Add ingredients before saving."); return; }
    const name = builder.name.trim() || "My Custom Drink", favs = store.get("favs", []);
    favs.unshift({ name, recipe: { ...builder.recipe } }); store.set("favs", favs.slice(0, 20)); addRecent(name, builder.recipe); toast("Saved to favorites");
  });
  $("#bDate").addEventListener("change", () => { seatState.time = ""; seatState.selected.clear(); renderBooking(); });
  $("#bGuests").addEventListener("change", () => { const g = +$("#bGuests").value; [...seatState.selected].slice(g).forEach(s => seatState.selected.delete(s)); renderFloor(); });
  initForms(); updateBuilder();
  window.addEventListener("hashchange", route); route();
}
document.addEventListener("DOMContentLoaded", init);

/* =====================================================================
   MOODBREW UPGRADE v2: sound, animation, tabs, colourful moods
   (keep this block at the very bottom: it wraps the functions above)
   ===================================================================== */

/* --- Sound engine (Web Audio, no external files, never autoplays) --- */
const sound = Object.assign({ on: false, vol: 0.5, ctx: null, last: 0 }, store.get("sound", {}));
function saveSound() { store.set("sound", { on: sound.on, vol: sound.vol }); }
function getCtx() {
  if (!sound.on) return null;
  try {
    if (!sound.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; sound.ctx = new AC(); }
    if (sound.ctx.state === "suspended") sound.ctx.resume();
    return sound.ctx;
  } catch (e) { return null; }
}
function tone(freq, dur, type, delay, gain, slide) {
  const c = getCtx(); if (!c) return;
  try {
    const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain(), peak = Math.max(.0001, (gain || .2) * sound.vol);
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .05);
  } catch (e) {}
}
function noise(dur, delay, gain, freq) {
  const c = getCtx(); if (!c) return;
  try {
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (delay || 0);
    src.buffer = buf; f.type = "bandpass"; f.frequency.value = freq || 1200;
    g.gain.setValueAtTime(Math.max(.0001, (gain || .15) * sound.vol), t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(c.destination); src.start(t);
  } catch (e) {}
}
const SFX = {
  click: () => tone(660, .05, "triangle", 0, .1),
  add: () => { tone(523, .09, "sine", 0, .2); tone(784, .12, "sine", .07, .18); },
  remove: () => { tone(440, .08, "sine", 0, .18); tone(294, .12, "sine", .07, .16); },
  pour: () => { noise(.45, 0, .18, 900); tone(500, .4, "sine", 0, .08, -250); },
  ice: () => { tone(2200, .05, "triangle", 0, .15); tone(1700, .06, "triangle", .09, .12); tone(2600, .04, "triangle", .17, .1); },
  boba: () => [0, .1, .18, .24].forEach((d, k) => tone(320 - k * 40, .08, "sine", d, .2, -60)),
  complete: () => [523, 659, 784, 1047].forEach((f, k) => tone(f, .18, "sine", k * .1, .2)),
  cart: () => { tone(880, .07, "square", 0, .07); tone(1320, .16, "square", .08, .07); },
  order: () => [523, 659, 784, 659, 1047].forEach((f, k) => tone(f, .2, "triangle", k * .11, .22)),
  reserve: () => { tone(784, .3, "sine", 0, .2); tone(1175, .4, "sine", .15, .16); },
  error: () => tone(200, .15, "sawtooth", 0, .08)
};
function sfx(name) { sound.last = Date.now(); try { if (sound.on && SFX[name]) SFX[name](); } catch (e) {} }

/* generic button click sound (skipped if a specific sound just played) */
document.addEventListener("click", e => {
  if (!e.target.closest("button,.btn,.chip,a.cart-btn,#navLinks a")) return;
  if (Date.now() - sound.last < 150) return;
  sfx("click");
});

/* sounds for cart / order / reservation / saves, triggered from the existing toast messages */
const _toast = toast;
toast = function (msg) {
  _toast(msg); const m = String(msg);
  if (/added to cart/.test(m)) sfx("cart");
  else if (/placed \(demo\)/.test(m)) sfx("order");
  else if (/confirmed \(demo\)/.test(m)) sfx("reserve");
  else if (/^Saved to favorites|applied|^Thanks!/.test(m)) sfx("add");
  else if (/^Add /.test(m)) sfx("error");
};

/* --- Straw gets a class so it can wiggle --- */
const _cupSVG = cupSVG;
cupSVG = function (recipe) { return _cupSVG(recipe).replace('<line x1="118"', '<line class="straw" x1="118"'); };

/* --- Pour stream + ingredient sounds --- */
function pourEffect(id) {
  const svg = $("#builderCup svg"), glass = svg && svg.querySelector('path[stroke-width="2"]');
  if (!glass) return;
  const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  [["x", 96], ["y", 0], ["width", 8], ["height", 270], ["rx", 4], ["fill", BY_ID[id].color], ["class", "pour"]].forEach(a => r.setAttribute(a[0], a[1]));
  svg.insertBefore(r, glass); setTimeout(() => r.remove(), 900);
}
const _changeQty = changeQty;
changeQty = function (id, d) {
  const before = builder.recipe[id] || 0; _changeQty(id, d);
  const after = builder.recipe[id] || 0;
  if (after === before) { sfx("error"); return; }
  if (after < before) { sfx("remove"); return; }
  if (id === "ice") sfx("ice");
  else if (id === "boba") sfx("boba");
  else if (BY_ID[id].cat === "topping") sfx("add");
  else { sfx("pour"); pourEffect(id); }
};

/* --- Straw wiggle + completion glow + "complete" sound --- */
let wasComplete = false;
const _updateBuilder = updateBuilder;
updateBuilder = function () {
  _updateBuilder();
  const box = $("#builderCup"), r = builder.recipe;
  const has = cat => Object.keys(r).some(k => r[k] > 0 && BY_ID[k] && BY_ID[k].cat === cat);
  const complete = has("base") && has("flavor") && has("topping");
  box.classList.toggle("complete", complete);
  box.classList.remove("wiggle"); void box.offsetWidth; box.classList.add("wiggle");
  if (complete && !wasComplete) setTimeout(() => sfx("complete"), 350);
  wasComplete = complete;
};

/* --- Animated calorie counter --- */
let lastKcal = 0;
const _renderNutrition = renderNutrition;
renderNutrition = function (recipe) {
  _renderNutrition(recipe);
  const el = $("#nutri .donut b"); if (!el) return;
  const to = +el.textContent || 0, from = lastKcal; lastKcal = to;
  if (from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const t0 = performance.now();
  (function step(now) { const p = Math.min(1, (now - t0) / 450); el.textContent = Math.round(from + (to - from) * p); if (p < 1) requestAnimationFrame(step); })(t0);
};

/* --- Mood cards: new labels, colours, Surprise Me, ingredients in result --- */
Object.assign(MOODS.find(m => m.id === "refresh"), { label: "Refresh Me" });
Object.assign(MOODS.find(m => m.id === "unsure"), { label: "Surprise Me", icon: "🎲", why: "A random pick from our menu. Go on, be surprised." });
const MOOD_COLORS = { energetic: "#ffd93d", relaxed: "#4ade80", happy: "#ff9f43", adventurous: "#a855f7", refresh: "#22d3ee", focused: "#38bdf8", cozy: "#fb7185", unsure: "#ff4fa3" };
const _renderMoodGrid = renderMoodGrid;
renderMoodGrid = function () { _renderMoodGrid(); $$(".mood").forEach(b => b.style.setProperty("--c", MOOD_COLORS[b.dataset.id] || "#a855f7")); };
let surprise = Math.random();
const _recommend = recommend;
recommend = function () {
  const r = _recommend();
  if (mood.id === "unsure") { r.p = PRESETS[Math.floor(surprise * PRESETS.length)]; r.why = ["a surprise pick"]; }
  return r;
};
const _moodAction = actions.mood;
actions.mood = function (id, b) { if (id === "unsure") surprise = Math.random(); _moodAction(id, b); sfx("add"); };
const _renderMoodResult = renderMoodResult;
renderMoodResult = function () {
  _renderMoodResult();
  const h = $("#moodResult h3"); if (!h) return;
  h.insertAdjacentHTML("afterend", `<p><b>Ingredients:</b> ${recipeText(recommend().p.recipe)}</p>`);
};

/* --- Hero cup with fruit, ice, boba, mint --- */
const _renderHome = renderHome;
renderHome = function () {
  _renderHome();
  $("#heroCup").innerHTML = cupSVG({ sparkling: 2, dragon: 2, lime: 1, mint: 3, ice: 3, boba: 2, fruit: 1 });
};

/* --- Particles, ingredient tabs, sound controls --- */
function makeParticles(box, n) {
  if (!box) return;
  const icons = ["✦", "•", "✧", "●"], cols = ["#ff4fa3", "#22d3ee", "#ffd93d", "#4ade80", "#a855f7", "#ff9f43"];
  box.innerHTML = Array.from({ length: n }, () => `<span style="left:${Math.random() * 100}%;font-size:${6 + Math.random() * 10}px;color:${cols[Math.floor(Math.random() * 6)]};animation-duration:${6 + Math.random() * 8}s;animation-delay:${-Math.random() * 10}s">${icons[Math.floor(Math.random() * 4)]}</span>`).join("");
}
function initTabs() {
  const panels = [["base", "Bases", "#ingBase"], ["flavor", "Flavors", "#ingFlavor"], ["topping", "Toppings", "#ingTopping"]].map(t => ({ key: t[0], label: t[1], el: $(t[2]).closest(".glass") }));
  const bar = document.createElement("div"); bar.className = "tabs"; bar.setAttribute("role", "tablist"); bar.setAttribute("aria-label", "Ingredient categories");
  panels[0].el.parentNode.insertBefore(bar, panels[0].el);
  function show(key) {
    panels.forEach(p => { p.el.hidden = p.key !== key; });
    $$("button", bar).forEach(b => { const on = b.dataset.key === key; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
  }
  panels.forEach(p => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.setAttribute("role", "tab");
    b.dataset.key = p.key; b.textContent = p.label; b.addEventListener("click", () => show(p.key)); bar.appendChild(b);
  });
  show("base");
}
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  makeParticles($("#particles"), 22);
  const cp = $(".cup-panel");
  if (cp) { const d = document.createElement("div"); d.className = "particles"; d.setAttribute("aria-hidden", "true"); cp.prepend(d); makeParticles(d, 10); }
  const tgl = $("#soundToggle"), vol = $("#volume");
  if (tgl && vol) {
    const refresh = () => { tgl.textContent = sound.on ? "🔊 Sound ON" : "🔇 Sound OFF"; tgl.setAttribute("aria-pressed", String(sound.on)); };
    vol.value = Math.round(sound.vol * 100); refresh();
    tgl.addEventListener("click", () => { sound.on = !sound.on; saveSound(); refresh(); if (sound.on) sfx("add"); });
    vol.addEventListener("input", () => { sound.vol = vol.value / 100; saveSound(); });
    vol.addEventListener("change", () => sfx("click"));
  }
});