// === Roll the Ball Scoreboard with Tokens + Local Sync ===

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
  if (saved) teams = JSON.parse(saved);
}

// === Display Helpers ===
function renderScore(team) {
  document.getElementById("score" + team).textContent = Math.max(0, Math.round(teams[team].score));
}

function renderTokens(team) {
  document.getElementById("gold" + team).textContent = teams[team].gold;
  document.getElementById("silver" + team).textContent = teams[team].silver;
}

// === Table Setup ===
function setupTables() {
  loadData();

  ["A", "B"].forEach(team => {
    const tbody = document.getElementById("items" + team);
    tbody.innerHTML = "";

    document.getElementById(`team${team}Name`).textContent = teams[team].name;
    document.getElementById(`team${team}NameInput`).value = teams[team].name;

    itemsData.forEach(item => {
      if (!teams[team].items[item.name]) teams[team].items[item.name] = { owned: 0, plays: 0 };
      const state = teams[team].items[item.name];

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td><input type="number" id="${team}_${item.name}_owned" value="${state.owned}" min="0"></td>
        <td id="${team}_${item.name}_plays">${state.plays}</td>
        <td>${item.maxPlays}</td>
        <td><button ${item.refund ? "" : "disabled"} onclick="refundItem('${team}','${item.name}')">Refund</button></td>
      `;
      tbody.appendChild(tr);

      document.getElementById(`${team}_${item.name}_owned`).addEventListener("input", e => {
        state.owned = parseInt(e.target.value) || 0;
        saveData();
      });
    });

    renderScore(team);
    renderTokens(team);
  });
}

// === Confirm Round ===
function confirmRound(team) {
  const t = teams[team];
  let totalRent = 0, repurchaseCost = 0;
  const roundScore = parseInt(document.getElementById(`addScore${team}`).value) || 0;

  itemsData.forEach(item => {
    const owned = parseInt(document.getElementById(`${team}_${item.name}_owned`).value) || 0;
    let state = t.items[item.name];

    totalRent += item.rent * owned;
    state.plays += owned;

    if (state.plays >= item.maxPlays) {
      repurchaseCost += item.buy;
      state.plays = 0;
    }
    document.getElementById(`${team}_${item.name}_plays`).textContent = state.plays;
  });

  t.score += roundScore - (totalRent + repurchaseCost);
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
  t.score += item.refund;
  renderScore(team);
  saveData();
}

// === Redeem Functions ===
function redeemAsScore(team, type) {
  const t = teams[team];
  if (type === "gold" && t.gold > 0) {
    t.score += 50;
    t.gold -= 1;
  } else if (type === "silver" && t.silver > 0) {
    t.score += 20;
    t.silver -= 1;
  }
  renderScore(team);
  renderTokens(team);
  saveData();
}

function redeemItem(team) {
  const t = teams[team];
  const choice = prompt(
    "Redeem Options:\n" +
    "1️⃣ 1 Silver Token - Free purchase of Metal Ball or Large Coin\n" +
    "2️⃣ 1 Gold Token - Free purchase of Metal Stick or Arrow\n" +
    "3️⃣ 3 Gold Tokens OR 5 Silver Tokens - Free Wooden Block or Two Free Purchases"
  );

  if (!choice) return;
  const opt = choice.trim();

  if (opt === "1" && t.silver >= 1) {
    t.silver -= 1;
    alert("Redeemed 1 Silver Token for a new item!");
  } else if (opt === "2" && t.gold >= 1) {
    t.gold -= 1;
    alert("Redeemed 1 Gold Token for a new item!");
  } else if (opt === "3" && (t.gold >= 3 || t.silver >= 5)) {
    if (t.gold >= 3) t.gold -= 3;
    else t.silver -= 5;
    alert("Redeemed for Wooden Block or two free purchases!");
  } else {
    alert("Not enough tokens!");
  }

  renderTokens(team);
  saveData();
}

document.addEventListener("DOMContentLoaded", setupTables);
