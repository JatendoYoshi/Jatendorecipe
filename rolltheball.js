// ==== Roll the Ball Scoreboard (complete) ====
// Works with the HTML + CSS above. Uses localStorage for persistence.
// Includes all functions: confirmRound, refundItem, redeemItem, addToken, redeemAsScore, updateTeamName, resetGame

// Items and prices extracted from the original document
const itemsData = [
  { name: "Large Coin", buy: 5, rent: 0, refund: 0, maxPlays: 25 },
  { name: "Metal Ball", buy: 10, rent: 5, refund: 0, maxPlays: 10 },
  { name: "Metal Stick", buy: 15, rent: 10, refund: 5, maxPlays: 8 },
  { name: "Arrow", buy: 20, rent: 10, refund: 10, maxPlays: 7 },
  { name: "Wooden Block", buy: 40, rent: 20, refund: 10, maxPlays: 6 },
];

// Default structure for teams
let teams = {
  A: { name: "Team A", score: 100, items: {}, gold: 0, silver: 0 },
  B: { name: "Team B", score: 100, items: {}, gold: 0, silver: 0 }
};

// ---------- Local storage helpers ----------

function saveData() {
  localStorage.setItem("rollTheBallData", JSON.stringify(teams));
}

function loadData() {
  const raw = localStorage.getItem("rollTheBallData");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    ["A", "B"].forEach(k => {
      if (!parsed[k]) return;

      teams[k].name = parsed[k].name ?? teams[k].name;
      teams[k].score = Number(parsed[k].score) || 0;
      teams[k].gold = Number(parsed[k].gold) || 0;
      teams[k].silver = Number(parsed[k].silver) || 0;
      teams[k].items = parsed[k].items ?? {};

      // ensure each item exists and numeric
      itemsData.forEach(it => {
        if (!teams[k].items[it.name]) teams[k].items[it.name] = { owned: 0, plays: 0 };
        teams[k].items[it.name].owned = Number(teams[k].items[it.name].owned) || 0;
        teams[k].items[it.name].plays = Number(teams[k].items[it.name].plays) || 0;
      });
    });
  } catch (e) {
    console.warn("Failed to load saved data:", e);
  }
}

// ---------- UI rendering helpers ----------

function renderScore(team) {
  const el = document.getElementById("score" + team);
  if (!el) return;
  el.textContent = String(Math.max(0, Math.round(Number(teams[team].score) || 0)));
}

function renderTokens(team) {
  const g = document.getElementById("gold" + team);
  const s = document.getElementById("silver" + team);
  if (g) g.textContent = String(Number(teams[team].gold) || 0);
  if (s) s.textContent = String(Number(teams[team].silver) || 0);
}

// ---------- Build item tables and wire UI ----------

function setupTables() {
  loadData();

  ["A", "B"].forEach(team => {
    const tbody = document.getElementById("items" + team);
    if (!tbody) return;
    tbody.innerHTML = "";

    // sync team name text/inputs
    const displayName = document.getElementById(`team${team}Name`);
    const inputName = document.getElementById(`team${team}NameInput`);
    if (displayName) displayName.textContent = teams[team].name;
    if (inputName) inputName.value = teams[team].name;

    // ensure item states exist
    itemsData.forEach(item => {
      if (!teams[team].items[item.name]) teams[team].items[item.name] = { owned: 0, plays: 0 };
      const state = teams[team].items[item.name];

      // create row
      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.textContent = item.name;

      const tdOwned = document.createElement("td");
      const ownedInput = document.createElement("input");
      ownedInput.type = "number";
      ownedInput.min = "0";
      ownedInput.value = String(Number(state.owned) || 0);
      ownedInput.id = `${team}_${item.name}_owned`;
      ownedInput.style.width = "60px";
      ownedInput.addEventListener("input", (e) => {
        state.owned = Number(e.target.value) || 0;
        saveData();
      });
      tdOwned.appendChild(ownedInput);

      const tdPlays = document.createElement("td");
      tdPlays.id = `${team}_${item.name}_plays`;
      tdPlays.textContent = String(Number(state.plays) || 0);

      const tdMax = document.createElement("td");
      tdMax.textContent = String(item.maxPlays);

      const tdRefund = document.createElement("td");
      const refundBtn = document.createElement("button");
      refundBtn.type = "button";
      refundBtn.textContent = "Refund";
      if (!item.refund || Number(item.refund) === 0) refundBtn.disabled = true;
      refundBtn.addEventListener("click", () => refundItem(team, item.name));
      tdRefund.appendChild(refundBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdOwned);
      tr.appendChild(tdPlays);
      tr.appendChild(tdMax);
      tr.appendChild(tdRefund);

      tbody.appendChild(tr);
    });

    // render score & tokens for this team
    renderScore(team);
    renderTokens(team);
  });
}

// ---------- Game logic ----------

function confirmRound(team) {
  const t = teams[team];
  let totalRent = 0;
  let repurchaseCost = 0;
  const roundScore = Number(document.getElementById(`addScore${team}`)?.value) || 0;

  itemsData.forEach(item => {
    const state = t.items[item.name];

    totalRent += Number(item.rent) * (state.owned || 0);
    state.plays = (Number(state.plays) || 0) + (state.owned || 0);

    if (state.plays >= item.maxPlays) {
      repurchaseCost += Number(item.buy);
      state.plays = 0;
    }

    const playsEl = document.getElementById(`${team}_${item.name}_plays`);
    if (playsEl) playsEl.textContent = String(state.plays);
  });

  t.score = (Number(t.score) || 0) + roundScore - (totalRent + repurchaseCost);
  if (t.score < 0) t.score = 0;

  renderScore(team);
  document.getElementById(`addScore${team}`).value = 0;
  saveData();
}

// Refund logic
function refundItem(team, itemName) {
  const item = itemsData.find(i => i.name === itemName);
  if (!item || !item.refund || Number(item.refund) === 0) return;
  teams[team].score = (Number(teams[team].score) || 0) + Number(item.refund);
  renderScore(team);
  saveData();
}

// ---------- Tokens management ----------

function addToken(team, type) {
  if (!teams[team]) return;
  if (type === "gold") teams[team].gold = Number(teams[team].gold || 0) + 1;
  else if (type === "silver") teams[team].silver = Number(teams[team].silver || 0) + 1;
  renderTokens(team);
  saveData();
}

function redeemAsScore(team, type) {
  const t = teams[team];
  if (!t) return;

  if (type === "gold") {
    if ((Number(t.gold) || 0) <= 0) {
      alert("No gold tokens available.");
      return;
    }
    t.gold -= 1;
    t.score = (Number(t.score) || 0) + 50;
  } else if (type === "silver") {
    if ((Number(t.silver) || 0) <= 0) {
      alert("No silver tokens available.");
      return;
    }
    t.silver -= 1;
    t.score = (Number(t.score) || 0) + 20;
  }

  renderScore(team);
  renderTokens(team);
  saveData();
}

// ---------- Redeem for items ----------

function redeemItem(team) {
  const t = teams[team];
  if (!t) return;

  const choice = prompt(
    "Redeem Options:\n" +
      "1) 1 Silver Token - Free purchase of Metal Ball or Large Coin\n" +
      "2) 1 Gold Token - Free purchase of Metal Stick or Arrow\n" +
      "3) 3 Gold Tokens OR 5 Silver Tokens - Free Wooden Block or Two Free Purchases\n\n" +
      "Enter 1, 2 or 3:"
  );
  if (!choice) return;
  const opt = choice.trim();

  if (opt === "1") {
    if ((Number(t.silver) || 0) < 1) { alert("Not enough silver tokens."); return; }
    const pick = prompt("Choose one to receive for free: 'Metal Ball' or 'Large Coin'").trim();
    if (!pick || !t.items[pick]) { alert("Invalid item name. Redemption cancelled."); return; }
    t.items[pick].owned += 1;
    t.silver -= 1;
    alert(`Redeemed 1 Silver token for ${pick}.`);
  } else if (opt === "2") {
    if ((Number(t.gold) || 0) < 1) { alert("Not enough gold tokens."); return; }
    const pick = prompt("Choose one to receive for free: 'Metal Stick' or 'Arrow'").trim();
    if (!pick || !t.items[pick]) { alert("Invalid item name. Redemption cancelled."); return; }
    t.items[pick].owned += 1;
    t.gold -= 1;
    alert(`Redeemed 1 Gold token for ${pick}.`);
  } else if (opt === "3") {
    const hasGold = (Number(t.gold) || 0) >= 3;
    const hasSilver = (Number(t.silver) || 0) >= 5;
    if (!hasGold && !hasSilver) { alert("Not enough tokens for option 3."); return; }

    if (hasGold) t.gold -= 3;
    else t.silver -= 5;

    const pick = prompt("Choose: 'Wooden Block' OR 'Two' (two free purchases)").trim().toLowerCase();
    if (pick === "wooden block") {
      t.items["Wooden Block"].owned += 1;
      alert("Redeemed for Wooden Block.");
    } else if (pick === "two" || pick === "two free purchases") {
      const first = prompt("First free purchase - enter item name:").trim();
      const second = prompt("Second free purchase - enter item name:").trim();
      if (t.items[first]) t.items[first].owned += 1;
      if (t.items[second]) t.items[second].owned += 1;
      alert("Redeemed two free purchases.");
    } else {
      alert("Invalid choice; tokens returned.");
      if (hasGold) t.gold += 3; else t.silver += 5;
      return;
    }
  } else {
    alert("Invalid option.");
    return;
  }

  itemsData.forEach(item => {
    const ownedEl = document.getElementById(`${team}_${item.name}_owned`);
    if (ownedEl) ownedEl.value = String(t.items[item.name].owned || 0);
    const playsEl = document.getElementById(`${team}_${item.name}_plays`);
    if (playsEl) playsEl.textContent = String(t.items[item.name].plays || 0);
  });

  renderTokens(team);
  renderScore(team);
  saveData();
}

// ---------- Team name update ----------
function updateTeamName(team) {
  const input = document.getElementById(`team${team}NameInput`);
  if (!input) return;
  const val = input.value.trim();
  if (val === "") return;
  teams[team].name = val;
  const display = document.getElementById(`team${team}Name`);
  if (display) display.textContent = val;
  saveData();
}

// ---------- Reset Game ----------
function resetGame() {
  teams = {
    A: { name: "Team A", score: 100, items: {}, gold: 0, silver: 0 },
    B: { name: "Team B", score: 100, items: {}, gold: 0, silver: 0 }
  };
  localStorage.removeItem("rollTheBallData");
  setupTables();
  alert("Game has been reset!");
}

// ---------- Expose functions globally ----------
window.addToken = addToken;
window.redeemAsScore = redeemAsScore;
window.redeemItem = redeemItem;
window.confirmRound = confirmRound;
window.updateTeamName = updateTeamName;
window.refundItem = refundItem;
window.resetGame = resetGame;

// ---------- Initialize ----------
document.addEventListener("DOMContentLoaded", setupTables);
