const audio = document.querySelector("#waves-audio");
const toggle = document.querySelector(".audio-toggle");
const applyPanel = document.querySelector("#apply-panel");
const applyTitle = document.querySelector("#apply-title");
const applyTypeInput = document.querySelector("input[name='application_type']");
const applyForm = document.querySelector(".apply-form");
const formStatus = document.querySelector(".form-status");
const openApplyControls = document.querySelectorAll("[data-open-apply]");
const closeApplyControls = document.querySelectorAll("[data-close-apply]");
const contactLink = document.querySelector("[data-contact-link]");
const contactText = document.querySelector(".contact-text");
const contactArrow = contactLink.querySelector(".contact-arrow");
const descriptionBlock = document.querySelector(".description-block");
const descriptionSummary = descriptionBlock?.querySelector("summary");
const descriptionContent = descriptionBlock?.querySelector(".description-content");
const gridInteractiveControls = document.querySelectorAll(".links a, .audio-toggle, .apply-form button");
const canvas = document.querySelector(".cursor-grid");
const ctx = canvas?.getContext("2d");
const panelTransitionMs = 360;
const applicationEndpointUrl = "/api/apply";
let panelSwitchTimer;

const grid = {
  pointerX: window.innerWidth / 2,
  pointerY: window.innerHeight / 2,
  easedX: window.innerWidth / 2,
  easedY: window.innerHeight / 2,
  opacity: 0,
  targetOpacity: 0,
  revealScale: 1,
  targetRevealScale: 1,
  fullPage: 0,
  targetFullPage: false,
  warp: 0,
  targetWarp: 0,
  dpr: 1,
  width: window.innerWidth,
  height: window.innerHeight
};

async function toggleAudio() {
  if (!audio || !toggle) return;

  if (audio.paused) {
    try {
      await audio.play();
      toggle.classList.add("is-playing");
      toggle.setAttribute("aria-label", "Pause ocean waves");
      toggle.setAttribute("aria-pressed", "true");
    } catch {
      toggle.setAttribute("aria-label", "Audio unavailable");
    }
  } else {
    audio.pause();
    toggle.classList.remove("is-playing");
    toggle.setAttribute("aria-label", "Play ocean waves");
    toggle.setAttribute("aria-pressed", "false");
  }
}

toggle?.addEventListener("click", toggleAudio);

async function startAudioByDefault() {
  if (!audio || !toggle) return;

  try {
    await audio.play();
    toggle.classList.add("is-playing");
    toggle.setAttribute("aria-label", "Pause ocean waves");
    toggle.setAttribute("aria-pressed", "true");
  } catch {
    toggle.classList.remove("is-playing");
    toggle.setAttribute("aria-label", "Play ocean waves");
    toggle.setAttribute("aria-pressed", "false");
  }
}

startAudioByDefault();

function toggleDescriptionBlock() {
  if (!descriptionBlock || !descriptionContent || !descriptionSummary) return;

  const isOpen = descriptionBlock.hasAttribute("open");

  if (isOpen) {
    descriptionContent.style.maxHeight = `${descriptionContent.scrollHeight}px`;
    requestAnimationFrame(() => {
      descriptionBlock.classList.remove("is-open");
      descriptionContent.style.maxHeight = "0px";
    });

    window.setTimeout(() => {
      descriptionBlock.removeAttribute("open");
    }, 320);
    return;
  }

  descriptionBlock.setAttribute("open", "");
  descriptionContent.style.maxHeight = "0px";

  requestAnimationFrame(() => {
    descriptionBlock.classList.add("is-open");
    descriptionContent.style.maxHeight = `${descriptionContent.scrollHeight}px`;
  });
}

descriptionSummary?.addEventListener("click", (event) => {
  event.preventDefault();
  toggleDescriptionBlock();
});

function disableFirstInteractionResume() {
  window.removeEventListener("pointerdown", resumeAudioOnFirstInteraction);
  window.removeEventListener("keydown", resumeAudioOnFirstInteraction);
}

async function resumeAudioOnFirstInteraction(event) {
  if (event?.target?.closest?.(".audio-toggle")) return;
  if (!audio?.paused) return;

  await startAudioByDefault();

  if (!audio.paused) {
    disableFirstInteractionResume();
  }
}

window.addEventListener("pointerdown", resumeAudioOnFirstInteraction, { passive: true });
window.addEventListener("keydown", resumeAudioOnFirstInteraction);

function setApplyPanel(open, type = "fellowship") {
  const label = type === "grant" ? "Grant" : "Fellowship";

  if (applyTitle) applyTitle.textContent = label;
  if (applyTypeInput) applyTypeInput.value = type;

  applyPanel?.classList.toggle("is-open", open);
  applyPanel?.setAttribute("aria-hidden", String(!open));
}

function closeApplyPanel() {
  window.clearTimeout(panelSwitchTimer);
  setApplyPanel(false, applyTypeInput?.value || "fellowship");
}

function switchApplyPanel(type) {
  const isOpen = applyPanel?.classList.contains("is-open");
  const currentType = applyTypeInput?.value;

  window.clearTimeout(panelSwitchTimer);

  if (!isOpen) {
    setApplyPanel(true, type);
    return;
  }

  if (currentType === type) {
    setApplyPanel(false, type);
    return;
  }

  setApplyPanel(false, currentType || "fellowship");
  panelSwitchTimer = window.setTimeout(() => {
    setApplyPanel(true, type);
  }, panelTransitionMs);
}

openApplyControls.forEach((control) => {
  control.addEventListener("click", (event) => {
    event.preventDefault();
    const type = control.dataset.applyType || "fellowship";

    switchApplyPanel(type);
  });
});

closeApplyControls.forEach((control) => {
  control.addEventListener("click", closeApplyPanel);
});

function setFormStatus(message, type = "") {
  if (!formStatus) return;

  formStatus.textContent = message;
  formStatus.classList.remove("is-error", "is-success");

  if (type) {
    formStatus.classList.add(type);
  }
}

function setInvalidReferralStatus() {
  if (!formStatus) return;

  formStatus.classList.remove("is-success");
  formStatus.classList.add("is-error");
  formStatus.innerHTML = 'Referral code is not valid. <a href="referrals.html">Learn how to get one.</a>';
}

applyForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = applyForm.querySelector("button[type='submit']");

  if (!applyForm.reportValidity()) return;
  if (!applicationEndpointUrl) {
    setFormStatus("Application endpoint is unavailable.", "is-error");
    return;
  }

  const formData = new FormData(applyForm);
  const payload = {
    source: "braveheart_application",
    application_type: formData.get("application_type") || "",
    name: formData.get("name") || "",
    email: formData.get("email") || "",
    referral_code: formData.get("referral_code") || "",
    work_description: formData.get("work_description") || "",
    links: formData.get("links") || "",
    proudest_work: formData.get("proudest_work") || ""
  };

  setFormStatus("Checking referral code...", "");
  submitButton?.setAttribute("disabled", "disabled");

  try {
    const response = await fetch(applicationEndpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      if (result.code === "INVALID_REFERRAL") {
        setInvalidReferralStatus();
        return;
      }

      throw new Error(result.message || "Submission failed.");
    }

    applyForm.reset();
    if (applyTypeInput) {
      applyTypeInput.value = result.application_type || applyTypeInput.value;
    }
    if (result.email_sent === false) {
      setFormStatus("Application received. Email is not authorized yet; use the Cal link on the referral page or contact us.", "is-success");
    } else {
      setFormStatus("Application received. Check your email for the call link.", "is-success");
    }
  } catch (error) {
    setFormStatus(error.message || "Something went wrong. Please try again.", "is-error");
  } finally {
    submitButton?.removeAttribute("disabled");
  }
});

contactLink?.addEventListener("click", (event) => {
  if (contactLink.dataset.revealed === "true") return;

  event.preventDefault();
  contactText?.classList.add("is-changing");
  contactArrow?.classList.add("is-changing");

  window.setTimeout(() => {
    if (contactText) contactText.textContent = "aryan@braveheartfellowship.org";
    if (contactArrow) contactArrow.textContent="↗";
    contactLink.dataset.revealed = "true";
    contactText?.classList.remove("is-changing");
    contactArrow?.classList.remove("is-changing");
  }, 180);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeApplyPanel();
});

window.addEventListener("pointerdown", (event) => {
  if (!applyPanel?.classList.contains("is-open")) return;
  if (applyPanel.contains(event.target) || event.target.closest("[data-open-apply]")) return;

  closeApplyPanel();
}, { passive: true });

function resizeGrid() {
  if (!canvas || !ctx) return;

  grid.dpr = Math.min(window.devicePixelRatio || 1, 2);
  grid.width = window.innerWidth;
  grid.height = window.innerHeight;
  canvas.width = Math.round(grid.width * grid.dpr);
  canvas.height = Math.round(grid.height * grid.dpr);
  canvas.style.width = `${grid.width}px`;
  canvas.style.height = `${grid.height}px`;
  ctx.setTransform(grid.dpr, 0, 0, grid.dpr, 0, 0);
}

function gravityPoint(x, y) {
  const dx = grid.easedX - x;
  const dy = grid.easedY - y;
  const distance = Math.hypot(dx, dy);
  const radius = 190;
  const pull = grid.warp * 0.34 * Math.exp(-(distance * distance) / (radius * radius));

  return {
    x: x + dx * pull,
    y: y + dy * pull
  };
}

function revealAlpha(x, y) {
  const fullPageAlpha = 0.18 * grid.fullPage;

  const distance = Math.hypot(x - grid.easedX, y - grid.easedY);
  const inner = 38 * grid.revealScale;
  const outer = 112 * grid.revealScale;

  if (grid.revealScale <= 0.01) return fullPageAlpha;

  if (distance <= inner) return Math.max(fullPageAlpha, grid.opacity);
  if (distance >= outer) return fullPageAlpha;

  const t = (distance - inner) / (outer - inner);
  return Math.max(fullPageAlpha, grid.opacity * (1 - t) * (1 - t));
}

function drawWarpedLine(points) {
  if (!ctx) return;

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const alpha = Math.min(revealAlpha(a.x, a.y), revealAlpha(b.x, b.y));

    if (alpha <= 0.01) continue;

    const warpedA = gravityPoint(a.x, a.y);
    const warpedB = gravityPoint(b.x, b.y);

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(warpedA.x, warpedA.y);
    ctx.lineTo(warpedB.x, warpedB.y);
    ctx.stroke();
  }
}

function drawGrid() {
  if (!ctx) return;

  grid.easedX += (grid.pointerX - grid.easedX) * 0.14;
  grid.easedY += (grid.pointerY - grid.easedY) * 0.14;
  grid.opacity += (grid.targetOpacity - grid.opacity) * 0.12;
  grid.revealScale += (grid.targetRevealScale - grid.revealScale) * 0.03;
  grid.fullPage += ((grid.targetFullPage ? 1 : 0) - grid.fullPage) * 0.12;
  grid.warp += (grid.targetWarp - grid.warp) * 0.3;

  ctx.clearRect(0, 0, grid.width, grid.height);
  ctx.strokeStyle = "rgba(255, 248, 235, 0.18)";
  ctx.lineWidth = 1;

  const spacing = 26;
  const step = 10;
  const shiftX = (grid.easedX / grid.width - 0.5) * 14;
  const shiftY = (grid.easedY / grid.height - 0.5) * 10;

  for (let x = -spacing + shiftX; x <= grid.width + spacing; x += spacing) {
    const points = [];
    for (let y = -spacing; y <= grid.height + spacing; y += step) {
      points.push({ x, y: y + shiftY });
    }
    drawWarpedLine(points);
  }

  for (let y = -spacing + shiftY; y <= grid.height + spacing; y += spacing) {
    const points = [];
    for (let x = -spacing; x <= grid.width + spacing; x += step) {
      points.push({ x: x + shiftX, y });
    }
    drawWarpedLine(points);
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(drawGrid);
}

function updatePointer(event) {
  grid.pointerX = event.clientX;
  grid.pointerY = event.clientY;
  grid.targetOpacity = 0.72;
}

function releaseGridWarp() {
  grid.targetWarp = 0;
}

function shrinkGridReveal() {
  grid.targetRevealScale = 0;
  grid.targetOpacity = 0;
}

function expandGridReveal() {
  grid.targetRevealScale = 1;
  grid.targetOpacity = 0.72;
}

window.addEventListener("resize", resizeGrid);
window.addEventListener("pointermove", updatePointer, { passive: true });
window.addEventListener("pointerleave", () => {
  grid.targetOpacity = 0;
  grid.targetWarp = 0;
});
window.addEventListener("pointerdown", (event) => {
  updatePointer(event);
  if (grid.targetFullPage) return;
  grid.targetWarp = 1;
}, { passive: true });
window.addEventListener("pointerup", releaseGridWarp, { passive: true });
window.addEventListener("pointercancel", releaseGridWarp, { passive: true });
window.addEventListener("blur", releaseGridWarp);

gridInteractiveControls.forEach((control) => {
  control.addEventListener("pointerenter", updatePointer, { passive: true });
  control.addEventListener("pointerenter", shrinkGridReveal);
  control.addEventListener("pointerleave", expandGridReveal);
  control.addEventListener("focus", shrinkGridReveal);
  control.addEventListener("blur", expandGridReveal);
});

applyPanel?.addEventListener("pointerenter", () => {
  grid.targetFullPage = true;
  grid.targetWarp = 0;
});

applyPanel?.addEventListener("pointerleave", () => {
  grid.targetFullPage = false;
});

resizeGrid();
drawGrid();
