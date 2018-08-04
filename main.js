const characters = [
  {
    name: 'Ken',
    className: 'ken',
    modifiers: [
      {
        name: 'Steroids',
        modFunc: damageValue => damageValue + (damageValue / 4) ** 2
      },
      {
        name: 'Knee Arrow',
        modFunc: damageValue => damageValue / (Math.random() * 5 + 5)
      },
      {
        name: 'Flu Shot',
        modFunc: damageValue => damageValue
      }
    ],
    activeModifier: null,
    attacks: [
      {
        name: 'Punch',
        className: 'punch',
        damageValue: () => Math.random() * 10 + 5,
        projectile: false
      },
      {
        name: 'Blast',
        className: 'blast',
        damageValue: () => (Math.random() * 5 + 1) ** 2,
        projectile: true
      }
    ]
  }
];

const enemy = {
  health: stan(100)
};
enemy.health.subscribe(
  newValue =>
    (document.getElementById('enemy-health').textContent = ` ${newValue}`)
);

let activeCharacterIndex = 0;
let attacking = false;

const playerElement = document.getElementById('player');

function drawButtons() {
  document.getElementById('attack-buttons').innerHTML = characters[
    activeCharacterIndex
  ].attacks
    .map(
      (attack, index) =>
        `<button onclick='playerAttack(event, ${index})'>${
          attack.name
        }</button>`
    )
    .join('');

  document.getElementById('modifier-buttons').innerHTML = characters[
    activeCharacterIndex
  ].modifiers
    .map(
      (modifier, index) => `
        <div class='radio-button'>
            <input type='radio' id='modifier${index}' name='modifiers' onchange='playerModify(${index})' ${
        modifier === characters[activeCharacterIndex].activeModifier
          ? 'checked'
          : ''
      }
            />
            <label for='modifier${index}'>${modifier.name}</label>
          </div>
       `
    )
    .join('');
}

function draw() {
  resetPlayerAnimation();
  document.getElementById('modifier');
}

function resetPlayerAnimation() {
  playerElement.className = `
    ${characters[activeCharacterIndex].className} stand
  `;
}
function playerAttack(event, attackIndex) {
  event.target.disabled = true;

  const player = characters[activeCharacterIndex];
  const attack = player.attacks[attackIndex];
  playerElement.className = `
    ${player.className} ${attack.className}
  `;

  playerElement.addEventListener('animationend', () => {
    resetPlayerAnimation();
    event.target.disabled = false;
  });

  let playerDamage = attack.damageValue();
  if (player.activeModifier !== null) {
    playerDamage = player.modifiers[player.activeModifier].modFunc(
      playerDamage
    );
  }
  playerDamage = Math.floor(playerDamage);

  if (enemy.health.value - playerDamage <= 0) {
    enemy.health.value = 0;
    setTimeout(
      () => showModal('ko', 2500).then(() => (enemy.health.value = 100)),
      500
    );
  } else {
    enemy.health.value -= playerDamage;
  }
}
function playerModify(modifyIndex) {
  characters[activeCharacterIndex].activeModifier = modifyIndex;
}

function showModal(id, duration) {
  return new Promise((resolve, reject) => {
    const modal = document.getElementById(id);
    if (modal.open) {
      resolve({ error: 'Modal already open' });
    }
    modal.showModal();
    setTimeout(() => {
      modal.close();
      resolve({ error: null });
    }, duration);
  });
}

drawButtons();
draw();
