let counter = 0;
let lastClickTime = 0;
let warningTimer = null;

const counterValue = document.getElementById('counterValue');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const speedWarning = document.getElementById('speedWarning');

function updateCounter() {
    counterValue.textContent = counter;
}

function showSpeedWarning() {
    if (speedWarning) {
        speedWarning.textContent = 'Woow, not so fast buddy';
        speedWarning.classList.add('visible');

        clearTimeout(warningTimer);
        warningTimer = setTimeout(() => {
            speedWarning.classList.remove('visible');
            speedWarning.textContent = '';
        }, 1200);
    }
}

function handleCounterChange() {
    const now = Date.now();

    if (now - lastClickTime < 100) {
        showSpeedWarning();
    }
    if (showSpeedWarning()) {
        stopCounter();
    }
    lastClickTime = now;
}

function incrementCounter() {
    counter += 1;
    handleCounterChange();
    updateCounter();
}

function decrementCounter() {
    counter -= 1;
    handleCounterChange();
    updateCounter();
}
function stopCounter() {
    counter = 0;
    updateCounter();
    handleCounterChange();
}

if (incrementBtn && decrementBtn && counterValue) {
    incrementBtn.addEventListener('click', incrementCounter);
    decrementBtn.addEventListener('click', decrementCounter);
    updateCounter();
}

