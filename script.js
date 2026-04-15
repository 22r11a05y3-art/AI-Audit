const revealElements = document.querySelectorAll(".reveal");
const form = document.getElementById("auditForm");
const errorText = document.getElementById("formError");
const successText = document.getElementById("formSuccess");
const submitButton = form.querySelector('button[type="submit"]');
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyhoIYoCcg2El64XuwFUdZx11FkJcGpPx9k__39_VhBuPkzBLMfNC2ZzLTDFdl0Nlai/exec";
const countdownEls = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function nextRefreshDate() {
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + 9);
  target.setHours(23, 59, 59, 999);
  return target;
}

function startCountdown() {
  const target = nextRefreshDate();

  const tick = () => {
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      Object.values(countdownEls).forEach((el) => {
        if (el) el.textContent = "00";
      });
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownEls.days.textContent = String(days).padStart(2, "0");
    countdownEls.hours.textContent = String(hours).padStart(2, "0");
    countdownEls.minutes.textContent = String(minutes).padStart(2, "0");
    countdownEls.seconds.textContent = String(seconds).padStart(2, "0");
  };

  tick();
  setInterval(tick, 1000);
}

function validateForm() {
  const fields = [...form.querySelectorAll("input, textarea")];
  let firstInvalid = null;

  fields.forEach((field) => field.classList.remove("invalid"));

  for (const field of fields) {
    const value = field.value.trim();

    if (!value) {
      field.classList.add("invalid");
      firstInvalid = firstInvalid || field;
      continue;
    }

    if (field.type === "email") {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!validEmail) {
        field.classList.add("invalid");
        firstInvalid = firstInvalid || field;
      }
    }

    if (field.id === "phone") {
      const validPhone = /^[0-9+\-\s()]{7,}$/.test(value);
      if (!validPhone) {
        field.classList.add("invalid");
        firstInvalid = firstInvalid || field;
      }
    }
  }

  return firstInvalid;
}

function setupFormValidation() {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorText.textContent = "";
    successText.textContent = "";

    const invalid = validateForm();
    if (invalid) {
      errorText.textContent = "Please complete all fields correctly before submitting.";
      invalid.focus();
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      businessType: form.businessType.value.trim(),
      challenge: form.challenge.value.trim(),
      source: "zylense-landing-page"
    };

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: new URLSearchParams(payload).toString()
      });

      successText.textContent =
        "Thanks. Your free AI audit request has been received. Our team will contact you soon.";
      form.reset();
    } catch (error) {
      errorText.textContent =
        "Submission failed. Please try again in a moment, or email zylense.ai@gmail.com.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Request My AI Audit";
    }
  });
}

function setupAnchorOffset() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerOffset = 76;
      const top =
        target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top,
        behavior: "smooth"
      });
    });
  });
}

setupRevealAnimations();
startCountdown();
setupFormValidation();
setupAnchorOffset();
