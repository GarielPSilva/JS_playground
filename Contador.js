let counter = 0;
let lastClickTime = 0;
let warningTimer = null;
let isCounterPaused = false;

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

function stopCounter() {
    isCounterPaused = true;
    incrementBtn.disabled = true;
    decrementBtn.disabled = true;
    showSpeedWarning();

    clearTimeout(warningTimer);
    warningTimer = setTimeout(() => {
        isCounterPaused = false;
        if (incrementBtn && decrementBtn) {
            incrementBtn.disabled = false;
            decrementBtn.disabled = false;
        }
    }, 1200);
}

function handleCounterChange() {
    const now = Date.now();

    if (now - lastClickTime < 100) {
        stopCounter();
    }

    lastClickTime = now;
}

function incrementCounter() {
    if (isCounterPaused) {
        return;
    }

    counter += 1;
    handleCounterChange();
    updateCounter();
}

function decrementCounter() {
    if (isCounterPaused) {
        return;
    }

    counter -= 1;
    handleCounterChange();
    updateCounter();
}

if (incrementBtn && decrementBtn && counterValue) {
    incrementBtn.addEventListener('click', incrementCounter);
    decrementBtn.addEventListener('click', decrementCounter);
    updateCounter();
}

