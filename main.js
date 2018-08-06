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
        iconSrc: 'assets/fist.png',
        className: 'punch',
        damageValue: () => Math.random() * 10 + 5,
        projectile: false
      },
      {
        name: 'Blast',
        iconSrc: 'assets/hadouken.png',
        className: 'blast',
        damageValue: () => (Math.random() * 5 + 1) ** 2,
        projectile: true
      }
    ],
    x: 0
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

function reset() {
  characters.splice(0);
  characters.push({
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
        iconSrc: 'assets/fist.png',
        className: 'punch',
        damageValue: () => Math.random() * 10 + 5,
        projectile: false
      },
      {
        name: 'Blast',
        iconSrc: 'assets/hadouken.png',
        className: 'blast',
        damageValue: () => (Math.random() * 5 + 1) ** 2,
        projectile: true
      }
    ],
    x: 0
  });
  playerElement.style.left = '0px';
  activeCharacterIndex = 0;
  enemy.health.value = 100;
  drawButtons();
  document.getElementById('modifier').textContent = 'None';

  animateLogo();
}

function drawButtons() {
  document.getElementById('attack-buttons').innerHTML = characters[
    activeCharacterIndex
  ].attacks
    .map(
      (attack, index) => `
        <button class='attack-button' onclick='playerAttack(event, ${index})'>
          ${attack.name}
          <img class='attack-icon' src='${
            attack.iconSrc
          }' alt='icon for button' />
        </button>
      `
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

  const animationEnd = () => {
    resetPlayerAnimation();
    event.target.disabled = false;
    playerElement.removeEventListener('animationend', animationEnd);

    const enemyHealthElement = document.getElementById('enemy-health');
    enemyHealthElement.setAttribute('data-damage', playerDamage);
    const newone = enemyHealthElement.cloneNode(true);
    enemyHealthElement.parentNode.replaceChild(newone, enemyHealthElement);

    if (enemy.health.value - playerDamage <= 0) {
      anime({
        targets: enemy.health,
        value: 0,
        easing: 'linear',
        round: 1,
        duration: enemy.health.value * 25
      });
      setTimeout(
        () => showModal('ko', 2500).then(() => (enemy.health.value = 100)),
        500
      );
    } else {
      anime({
        targets: enemy.health,
        value: enemy.health.value - playerDamage,
        easing: 'linear',
        round: 1,
        duration: playerDamage * 25
      });
      // enemy.health.value -= playerDamage;
    }
  };
  playerElement.addEventListener('animationend', animationEnd);

  let playerDamage = attack.damageValue();
  if (player.activeModifier !== null) {
    playerDamage = player.modifiers[player.activeModifier].modFunc(
      playerDamage
    );
  }
  playerDamage = Math.floor(playerDamage);
}
function playerModify(modifyIndex) {
  const player = characters[activeCharacterIndex];
  player.activeModifier = modifyIndex;
  document.getElementById('modifier').textContent =
    player.modifiers[modifyIndex].name;
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

const arrowKeys = {
  left: false,
  right: false
};
window.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    arrowKeys.left = true;
  } else if (event.key === 'ArrowRight') {
    arrowKeys.right = true;
  }
  if (arrowKeys.left || arrowKeys.right) {
    playerElement.className = `
      ${characters[activeCharacterIndex].className}
      ${arrowKeys.left ? 'reverse-animation' : ''}
      walk
    `;
  }
});
window.addEventListener('keyup', event => {
  if (event.key === 'ArrowLeft') {
    arrowKeys.left = false;
  } else if (event.key === 'ArrowRight') {
    arrowKeys.right = false;
  }
  if (!arrowKeys.left && !arrowKeys.right) {
    resetPlayerAnimation();
  }
});
const fightBox = document.querySelector('.fight-box');
setInterval(() => {
  const player = characters[activeCharacterIndex];
  let x = player.x;
  if (arrowKeys.left) {
    x = x < 5 ? 0 : x - 5;
    playerElement.style.left = `${x}px`;
  } else if (arrowKeys.right) {
    const fightBoxWidth = fightBox.getBoundingClientRect().width;
    x = x > fightBoxWidth - 75 ? fightBoxWidth - 70 : x + 5;
  }

  if (player.x !== x) {
    player.x = x;
    playerElement.style.left = `${x}px`;
  }
}, 1000 / 30);

const soundTrack = document.getElementById('sound-track');
soundTrack.loop = true;
soundTrack.volume = 0.5;

soundTrack.play().catch(() => {
  const firstSoundPlay = () =>
    soundTrack.play() && document.removeEventListener('click', firstSoundPlay);
  document.addEventListener('click', firstSoundPlay);
});

const animateLogo = () =>
  anime({
    targets: logo,
    opacity: 1,
    easing: 'easeOutQuart'
  }).finished.then(() =>
    anime({
      targets: logo,
      opacity: 0,
      duration: 5000
    })
  );
