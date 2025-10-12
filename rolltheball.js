
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

function formatScore(n) {
  // ensure it's a number and displayed without weird spacing
  return String(Math.max(0, Math.round(n)));
}

function renderScore(team) {
  const el = document.getElementById('score' + team);
  el.textContent = formatScore(teams[team].score);
}

function setupTables() {
  ['A', 'B'].forEach(team => {
    const tbody = document.getElementById('items' + team);
    tbody.innerHTML = ''; // clear if re-running
    itemsData.forEach(item => {
      teams[team].items[item.name] = { owned: 0, plays: 0 };

      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = item.name;

      const tdOwned = document.createElement('td');
      const ownedInput = document.createElement('input');
      ownedInput.type = 'number';
      ownedInput.min = '0';
      ownedInput.value = '0';
      ownedInput.id = `${team}_${item.name}_owned`;
      ownedInput.style.width = '60px';
      // keep teams data in sync when user changes the owned input
      ownedInput.addEventListener('input', () => {
        const v = parseInt(ownedInput.value) || 0;
        teams[team].items[item.name].owned = v;
        // Optionally enable/disable refund button (if you want that)
        // refundBtn.disabled = (v === 0 || item.refund === 0);
      });
      tdOwned.appendChild(ownedInput);

      const tdPlays = document.createElement('td');
      tdPlays.id = `${team}_${item.name}_plays`;
      tdPlays.textContent = '0';

      const tdMax = document.createElement('td');
      tdMax.textContent = item.maxPlays;

      const tdRefund = document.createElement('td');
      const refundBtn = document.createElement('button');
      refundBtn.type = 'button';
      refundBtn.textContent = 'Refund';
      refundBtn.className = 'refund-btn';
      // If refund is zero, visually disable the button
      if (!item.refund || item.refund === 0) {
        refundBtn.disabled = true;
        refundBtn.title = 'No refund available';
      }
      // Attach listener
      refundBtn.addEventListener('click', () => refundItem(team, item.name));
      tdRefund.appendChild(refundBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdOwned);
      tr.appendChild(tdPlays);
      tr.appendChild(tdMax);
      tr.appendChild(tdRefund);

      tbody.appendChild(tr);
    });

    // Render initial score
    renderScore(team);
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

    // Add plays used
    itemState.plays += owned;

    // If max plays reached -> repurchase item
    if (itemState.plays >= item.maxPlays) {
      repurchaseCost += item.buy;
      itemState.plays = 0; // reset plays
    }

    document.getElementById(`${team}_${item.name}_plays`).textContent = itemState.plays;
  });

  // Update total score: add round score then subtract rent and repurchases
  t.score = Number(t.score) + Number(roundScore) - (Number(totalRent) + Number(repurchaseCost));
  if (t.score < 0) t.score = 0;

  renderScore(team);
  document.getElementById(`addScore${team}`).value = 0;
}

function refundItem(team, itemName) {
  const t = teams[team];
  const item = itemsData.find(i => i.name === itemName);
  if (!item) return;

  // If refund is zero, do nothing
  if (!item.refund || item.refund === 0) return;

  // Add the refund amount to the team's score
  // Parse current value defensively in case someone changed DOM directly
  const currentDisplayed = parseInt(document.getElementById('score' + team).textContent) || 0;
  const newScore = currentDisplayed + Number(item.refund);

  // Keep model and UI in sync
  t.score = newScore;
  renderScore(team);
}

setupTables();
