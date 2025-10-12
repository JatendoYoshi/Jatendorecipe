const itemsData = [
  { name: "Large Coin", buy: 5, rent: 0, refund: 0, maxPlays: 25 },
  { name: "Metal Ball", buy: 10, rent: 5, refund: 0, maxPlays: 10 },
  { name: "Metal Stick", buy: 15, rent: 10, refund: 5, maxPlays: 8 },
  { name: "Arrow", buy: 20, rent: 10, refund: 10, maxPlays: 7 },
  { name: "Wooden Block", buy: 40, rent: 20, refund: 10, maxPlays: 6 },
];

let teams = {
  A: { score: 100, items: {} },
  B: { score: 100, items: {} }
};

function setupTables() {
  ['A', 'B'].forEach(team => {
    const tbody = document.getElementById('items' + team);
    itemsData.forEach(item => {
      teams[team].items[item.name] = { owned: 0, plays: 0 };
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td><input type="number" id="${team}_${item.name}_owned" value="0" min="0"></td>
        <td id="${team}_${item.name}_plays">0</td>
        <td>${item.maxPlays}</td>
        <td><button onclick="refundItem('${team}', '${item.name}')">Refund</button></td>
      `;
      tbody.appendChild(row);
    });
  });
}

function confirmRound(team) {
  const t = teams[team];
  let totalRent = 0;
  let repurchaseCost = 0;

  // Get round score input
  const roundScore = parseInt(document.getElementById(`addScore${team}`).value) || 0;

  itemsData.forEach(item => {
    const ownedInput = document.getElementById(`${team}_${item.name}_owned`);
    const owned = parseInt(ownedInput.value) || 0;
    let itemState = t.items[item.name];

    // Deduct rent for each owned item
    totalRent += item.rent * owned;

    // Add plays
    itemState.plays += owned;

    // If max plays reached -> repurchase item
    if (itemState.plays >= item.maxPlays) {
      repurchaseCost += item.buy;
      itemState.plays = 0; // reset plays
    }

    document.getElementById(`${team}_${item.name}_plays`).textContent = itemState.plays;
  });

  // Update total score: add round score then subtract rent and repurchases
  t.score += roundScore;
  t.score -= (totalRent + repurchaseCost);

  if (t.score < 0) t.score = 0;
  document.getElementById('score' + team).textContent = t.score;
  document.getElementById(`addScore${team}`).value = 0;
}

function refundItem(team, itemName) {
  const t = teams[team];
  const item = itemsData.find(i => i.name === itemName);
  if (!item || item.refund === 0) return;
  t.score += item.refund;
  document.getElementById('score' + team).textContent = t.score;
}

setupTables();
