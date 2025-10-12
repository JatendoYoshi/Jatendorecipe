// === Roll the Ball Scoreboard with Local Sync (no 3rd party) ===

const itemsData = [
  { name: "Large Coin", buy: 5, rent: 0, refund: 0, maxPlays: 25 },
  { name: "Metal Ball", buy: 10, rent: 5, refund: 0, maxPlays: 10 },
  { name: "Metal Stick", buy: 15, rent: 10, refund: 5, maxPlays: 8 },
  { name: "Arrow", buy: 20, rent: 10, refund: 10, maxPlays: 7 },
  { name: "Wooden Block", buy: 40, rent: 20, refund: 10, maxPlays: 6 },
];

let teams = {
  A: { name: "Team A", score: 100, items: {} },
  B: { name: "Team B", score: 100, items: {} }
};

// === LocalStorage helpers ===
function saveData() {
  localStorage.setItem("rollTheBallData", JSON.stringify(teams));
}

function loadData() {
  const saved = localStorage.getItem("rollTheBallData");
  if (saved) {
    teams = JSON.parse(saved);
  }
}

// === Display helpers ===
function formatScore(n) {
  return String(Math.max(0, Math.round(n)));
}

function renderScore(team) {
  document.getElementById('score' + team).textContent = formatScore(teams[team].score);
}

function updateTeamName(team) {
  const newName = document.getElementById(`team${team}NameInput`).value.trim();
  if (newName !== "") {
    teams[team].name = newName;
    document.getElementById(`team${team}Name`).textContent = newName;
    saveData();
  }
}

// === Setup tables ===
function setupTables() {
  loadData(); // load first

  ['A', 'B'].forEach(team => {
    const tbody = document.getElementById('items' + team);
    tbody.innerHTML = '';

    document.getElementById(`team${team}Name`).textContent = teams[team].name;
    document.getElementById(`team${team}NameInput`).value = teams[team].name;

    itemsData.forEach(item => {
      if (!teams[team].items[item.name]) {
        teams[team].items[item.name] = { owned: 0, plays: 0 };
      }
      const state = teams[team].items[item.name];

      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = item.name;

      const tdOwned = document.createElement('td');
      const ownedInput = document.createElement('input');
      ownedInput.type = 'number';
      ownedInput.min = '0';
      ownedInput.value = state.owned || 0;
      ownedInput.id = `${team}_${item.name}_owned`;
      ownedInput.addEventListener('input', () => {
        state.owned = parseInt(ownedInput.value) || 0;
        saveData();
      });
      tdOwned.appendChild(ownedInput);

      const tdPlays = document.createElement('td');
      tdPlays.id = `${team}_${item.name}_plays`;
      tdPlays.textContent = state.plays || 0;

      const tdMax = document.createElement('td');
      tdMax.textContent = item.maxPlays;

      const tdRefund = document.createElement('td');
      const refundBtn = document.createElement('button');
      refundBtn.textContent = 'Refund';
      if (!item.refund || item.refund === 0) {
        refundBtn.disabled = true;
      }
      refundBtn.addEventListener('click', () => refundItem(team, item.name));
      tdRefund.appendChild(refundBtn);

      tr.append(tdName, tdOwned, tdPlays, tdMax, tdRefund);
      tbody.appendChild(tr);
    });

    renderScore(team);
  });
}

// === Game functions ===
function confirmRound(team) {
  const t = teams[team];
  let totalRent = 0;
  let repurchaseCost = 0;
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

function refundItem(team, itemName) {
  const t = teams[team];
  const item = itemsData.find(i => i.name === itemName);
  if (!item || !item.refund) return;

  t.score += item.refund;
  renderScore(team);
  saveData();
}

// === Initialize ===
document.addEventListener('DOMContentLoaded', setupTables);
