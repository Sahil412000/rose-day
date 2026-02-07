(function () {
  const HOLD_DURATION_MS = 2600;
  const TICK_MS = 32;

  const journeyDots = document.getElementById("journeyDots");
  const steps = document.querySelectorAll(".step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const roseZone = document.getElementById("roseZone");
  const holdRing = document.getElementById("holdRing");
  const holdRingFill = document.getElementById("holdRingFill");
  const bloomRose = document.getElementById("bloomRose");
  const shareBtn = document.getElementById("shareBtn");

  let currentStep = 0;
  let holdStart = null;
  let holdTick = null;

  function setProgress(deg) {
    if (!holdRingFill) return;
    holdRingFill.style.setProperty("--progress", deg + "deg");
  }

  function updateDots() {
    if (!journeyDots) return;
    journeyDots.querySelectorAll(".dot").forEach(function (dot, i) {
      dot.classList.remove("active", "done");
      if (i < currentStep) dot.classList.add("done");
      if (i === currentStep) dot.classList.add("active");
    });
  }

  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    steps.forEach(function (el) {
      el.classList.remove("active");
    });
    currentStep = index;
    steps[index].classList.add("active");
    updateDots();

    if (index === 5 && bloomRose) {
      bloomRose.classList.add("animate");
    }
  }

  function nextStep() {
    if (currentStep < 4) {
      goToStep(currentStep + 1);
    }
  }

  function resetHold() {
    if (holdTick) {
      clearInterval(holdTick);
      holdTick = null;
    }
    holdStart = null;
    if (roseZone) roseZone.classList.remove("holding");
    if (holdRing) holdRing.classList.remove("visible");
    setProgress(0);
  }

  function completeHold() {
    if (holdTick) {
      clearInterval(holdTick);
      holdTick = null;
    }
    holdStart = null;
    if (roseZone) roseZone.classList.remove("holding");
    setProgress(360);
    if (holdRing) holdRing.classList.remove("visible");
    goToStep(5);
  }

  function startHold() {
    holdStart = Date.now();
    roseZone.classList.add("holding");
    holdRing.classList.add("visible");
    setProgress(0);
    holdTick = setInterval(function () {
      var elapsed = Date.now() - holdStart;
      var deg = Math.min(360, (elapsed / HOLD_DURATION_MS) * 360);
      setProgress(deg);
      if (elapsed >= HOLD_DURATION_MS) completeHold();
    }, TICK_MS);
  }

  function handleAdvance(e) {
    if (e.target.closest(".next-btn") || e.target.closest(".share-btn")) return;
    if (currentStep >= 4) return;
    e.preventDefault();
    nextStep();
  }

  nextBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      nextStep();
    });
  });

  steps.forEach(function (step) {
    var stepNum = parseInt(step.getAttribute("data-step"), 10);
    if (stepNum <= 3) {
      step.addEventListener("click", handleAdvance);
    }
  });

  if (roseZone) {
    roseZone.addEventListener("mousedown", function (e) {
      if (currentStep !== 4) return;
      if (!roseZone.contains(e.target)) return;
      e.preventDefault();
      startHold();
    });
    roseZone.addEventListener(
      "touchstart",
      function (e) {
        if (currentStep !== 4) return;
        if (!roseZone.contains(e.target)) return;
        e.preventDefault();
        startHold();
      },
      { passive: false },
    );
  }

  document.addEventListener("mouseup", function (e) {
    if (!holdStart) return;
    e.preventDefault();
    var elapsed = Date.now() - holdStart;
    if (elapsed >= HOLD_DURATION_MS) completeHold();
    else resetHold();
  });
  document.addEventListener("touchend", function (e) {
    if (!holdStart) return;
    e.preventDefault();
    var elapsed = Date.now() - holdStart;
    if (elapsed >= HOLD_DURATION_MS) completeHold();
    else resetHold();
  });
  document.addEventListener("touchcancel", resetHold);

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      if (navigator.share) {
        navigator
          .share({
            title: "Rose Day — A small journey",
            text: "Someone thought of you today.",
            url: window.location.href,
          })
          .catch(function () {
            window.location.reload();
          });
      } else {
        window.location.reload();
      }
    });
  }

  updateDots();
})();
