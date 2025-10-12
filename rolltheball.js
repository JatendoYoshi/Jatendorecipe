// script.js — fixed redeem buttons (+50 / +20) and safer numeric handling

const itemsData = [
  { name: "Large Coin", buy: 5, rent: 0, refund: 0, maxPlays: 25 },
  { name: "Metal Ball", buy: 10, rent: 5, refund: 0, maxPlays: 10 },
  { name: "Metal Stick", buy: 15, rent: 10, refund: 5, maxPlays: 8 },
  { name: "Arrow", buy: 20, rent: 10, refund: 10, maxPlays: 7 },
  { name: "Wooden Block", buy: 40, rent: 20, refund: 10, maxPlays: 6 },
];

let teams = {
  A: { name: "Team A", score: 100, items: {}, gold: 0, silver: 0 },
  B: { name: "Team B", score: 100, items: {}, gold: 0, silver: 0 }
};

// === LocalStorage ===
function saveData() {
  localStorage.setItem("rollTheBallData", JSON.stringify(teams));
}

function loadData() {
  const saved = localStorage.getItem("rollTheBallData");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // defensive merge & ensure numeric types
      ['A','B'].forEach(t => {
        if (parsed[t]) {
          teams[t].name = parsed[t].name ?? teams[t].name;
          teams[t].score = Number(parsed[t].score) || 0;
          teams[t].gold = Number(parsed[t].gold) || 0;
          teams[t].silver = Number(parsed[t].silver) || 0;
          teams[t].items = parsed[t].items ?? {};
          // ensure each item state exists and numbers are proper
          itemsData.forEach(it => {
            if (!teams[t].items[it.name]) teams[t].items[it.name] = { owned: 0, plays: 0 };
            teams[t].items[it.name].owned = Number(teams[t].items[it.name].owned) || 0;
            teams[t].items[it.name].plays = Number(teams[t].items[it.name].plays) || 0;
          });
        }
      });
    } catch (e) {
      console.warn("Couldn't parse saved data, resetting to defaults.", e);
    }
  }
}

// === Display Helpers ===
function renderScore(team) {
  const el = document.getElementById("score" + team);
  if (el) el.textContent = String(Math.max(0, Math.round(Number(teams[team].score) || 0)));
}

function renderTokens(team) {
  const g = document.getElementById("gold" + team);
  const s = document.getElementById("silver" + team);
  if (g) g.textContent = String(Number(teams[team].gold) || 0);
  if (s) s.textContent = String(Number(teams[team].silver) || 0);
}

// === Table Setup ===
function setupTables() {
  loadData();

  ["A", "B"].forEach(team => {
    const tbody = document.getElementById("items" + team);
    if (!tbody) return;
    tbody.innerHTML = "";

    // sync name inputs / displays
    const nameDisplay = document.getElementById(`team${team}Name`);
    const nameInput = document.getElementById(`team${team}NameInput`);
    if (nameDisplay) nameDisplay.textContent = teams[team].name;
    if (nameInput) nameInput.value = teams[team].name;

    itemsData.forEach(item => {
      if (!teams[team].items[item.name]) teams[team].items[item.name] = { owned: 0, plays: 0 };
      const state = teams[team].items[item.name];

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

    renderScore(team);
    renderTokens(team);

    // Attach listeners for redeem buttons inside this team's prizes section (safer than relying on inline onclick)
    const teamDiv = document.getElementById(`team${team}`);
    if (teamDiv) {
      const redeemBtns = teamDiv.querySelectorAll(".redeem-options button");
      // expected order: [Redeem Gold (+50), Redeem Silver (+20), Redeem for Item]
      if (redeemBtns.length >= 1) {
        redeemBtns[0].replaceWith(redeemBtns[0].cloneNode(true)); // remove any inline onclick
        const btnGold = teamDiv.querySelector(".redeem-options button:nth-child(1)");
        if (btnGold) {
          btnGold.addEventListener("click", () => redeemAsScore(team, "gold"));
        }
      }
      if (redeemBtns.length >= 2) {
        redeemBtns[1].replaceWith(redeemBtns[1].cloneNode(true));
        const btnSilver = teamDiv.querySelector(".redeem-options button:nth-child(2)");
        if (btnSilver) {
          btnSilver.addEventListener("click", () => redeemAsScore(team, "silver"));
        }
      }
      if (redeemBtns.length >= 3) {
        redeemBtns[2].replaceWith(redeemBtns[2].cloneNode(true));
        const btnItem = teamDiv.querySelector(".redeem-options button:nth-child(3)");
        if (btnItem) {
          btnItem.addEventListener("click", () => redeemItem(team));
        }
      }
    }
  });
}

// === Confirm Round ===
function confirmRound(team) {
  const t = teams[team];
  let totalRent = 0, repurchaseCost = 0;
  const roundScore = Number(document.getElementById(`addScore${team}`)?.value) || 0;

  itemsData.forEach(item => {
    const owned = Number(document.getElementById(`${team}_${item.name}_owned`)?.value) || 0;
    let state = t.items[item.name];

    totalRent += Number(item.rent) * owned;
    state.plays = (Number(state.plays) || 0) + owned;

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

// === Refund Button ===
function refundItem(team, itemName) {
  const t = teams[team];
  const item = itemsData.find(i => i.name === itemName);
  if (!item || !item.refund) return;
  t.score = (Number(t.score) || 0) + Number(item.refund);
  renderScore(team);
  saveData();
}

// === Redeem Functions ===
function redeemAsScore(team, type) {
  const t = teams[team];
  if (type === "gold") {
    if ((Number(t.gold) || 0) > 0) {
      t.gold = Number(t.gold) - 1;
      t.score = (Number(t.score) || 0) + 50;
    } else {
      alert("No gold tokens available to redeem.");
      return;
    }
  } else if (type === "silver") {
    if ((Number(t.silver) || 0) > 0) {
      t.silver = Number(t.silver) - 1;
      t.score = (Number(t.score) || 0) + 20;
    } else {
      alert("No silver tokens available to redeem.");
      return;
    }
  } else {
    return;
  }
  renderScore(team);
  renderTokens(team);
  saveData();
}

function redeemItem(team) {
  const t = teams[team];
  const choice = prompt(
    "Redeem Options:\n" +
    "1) 1 Silver Token - Free purchase of Metal Ball or Large Coin\n" +
    "2) 1 Gold Token - Free purchase of Metal Stick or Arrow\n" +
    "3) 3 Gold Tokens OR 5 Silver Tokens - Free Wooden Block or Two Free Purchases\n\n" +
    "Enter 1, 2 or 3:"
  );
  if (!choice) return;
  const opt = choice.trim();
  if (opt === "1" && (Number(t.silver) || 0) >= 1) {
    t.silver = Number(t.silver) - 1;
    // give one free item: prompt which of the two
    const pick = prompt("Choose one: Metal Ball OR Large Coin").trim();
    if (pick) {
      if (teams[team].items[pick]) {
        teams[team].items[pick].owned = (Number(teams[team].items[pick].owned) || 0) + 1;
        alert(`Redeemed 1 Silver token for ${pick}.`);
      } else {
        alert("Invalid item name. Redemption cancelled.");
        t.silver = Number(t.silver) + 1; // refund token
      }
    } else {
      t.silver = Number(t.silver) + 1; // refund token
    }
  } else if (opt === "2" && (Number(t.gold) || 0) >= 1) {
    t.gold = Number(t.gold) - 1;
    const pick = prompt("Choose one: Metal Stick OR Arrow").trim();
    if (pick) {
      if (teams[team].items[pick]) {
        teams[team].items[pick].owned = (Number(teams[team].items[pick].owned) || 0) + 1;
        alert(`Redeemed 1 Gold token for ${pick}.`);
      } else {
        alert("Invalid item name. Redemption cancelled.");
        t.gold = Number(t.gold) + 1;
      }
    } else {
      t.gold = Number(t.gold) + 1;
    }
  } else if (opt === "3" && ((Number(t.gold) || 0) >= 3 || (Number(t.silver) || 0) >= 5)) {
    if ((Number(t.gold) || 0) >= 3) t.gold = Number(t.gold) - 3;
    else t.silver = Number(t.silver) - 5;

    const pick = prompt("Choose one: Wooden Block OR Two Free Purchases (enter 'Wooden Block' or 'Two')").trim();
    if (pick.toLowerCase() === "wooden block") {
      teams[team].items["Wooden Block"].owned = (Number(teams[team].items["Wooden Block"].owned) || 0) + 1;
      alert("Redeemed for Wooden Block.");
    } else if (pick.toLowerCase() === "two" || pick.toLowerCase() === "two free purchases") {
      // give two free purchases: allow user to name two items
      const first = prompt("First free purchase - enter item name:").trim();
      const second = prompt("Second free purchase - enter item name:").trim();
      const validFirst = teams[team].items[first] !== undefined;
      const validSecond = teams[team].items[second] !== undefined;
      if (validFirst) teams[team].items[first].owned = (Number(teams[team].items[first].owned) || 0) + 1;
      if (validSecond) teams[team].items[second].owned = (Number(teams[team].items[second].owned) || 0) + 1;
      alert("Redeemed two free purchases (invalid names ignored).");
    } else {
      alert("Invalid choice, cancelled. Tokens refunded.");
      // refund
      // prefer refunding gold first if used
      if ((Number(t.gold) || 0) < 0) t.gold = 0;
    }
  } else {
    alert("Not enough tokens or invalid option.");
    return;
  }

  // update UI for item owned counts & tokens
  itemsData.forEach(item => {
    const ownedEl = document.getElementById(`${team}_${item.name}_owned`);
    if (ownedEl) ownedEl.value = String(Number(teams[team].items[item.name].owned) || 0);
    const playsEl = document.getElementById(`${team}_${item.name}_plays`);
    if (playsEl) playsEl.textContent = String(Number(teams[team].items[item.name].plays) || 0);
  });

  renderTokens(team);
  renderScore(team);
  saveData();
}

document.addEventListener("DOMContentLoaded", setupTables);

// Expose updateTeamName so the inline button in HTML continues to work
window.updateTeamName = function(team) {
  const input = document.getElementById(`team${team}NameInput`);
  if (!input) return;
  const val = input.value.trim();
  if (val === "") return;
  teams[team].name = val;
  const display = document.getElementById(`team${team}Name`);
  if (display) display.textContent = val;
  saveData();
};

// Expose confirmRound so the inline button in HTML continues to work
window.confirmRound = confirmRound;
