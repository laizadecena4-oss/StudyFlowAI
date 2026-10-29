(() => {
  const form = document.querySelector("#login-form");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const passwordToggle = document.querySelector(".password-toggle");
  const formMessage = document.querySelector("#form-message");

  if (!form || !email || !password || !passwordToggle || !formMessage) {
    throw new Error("Login page is missing required form elements.");
  }

  const setFieldError = (field, message) => {
    const error = document.querySelector(`#${field.id}-error`);
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
  };

  const clearFieldErrors = () => {
    setFieldError(email, "");
    setFieldError(password, "");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFieldErrors();
    formMessage.textContent = "";
    formMessage.classList.remove("visible");

    let firstInvalidField = null;
    const emailValue = email.value.trim();

    if (!emailValue || !email.validity.valid) {
      setFieldError(email, "Enter a valid email address.");
      firstInvalidField = email;
    }

    if (password.value.length < 8) {
      setFieldError(password, "Password must be at least 8 characters.");
      firstInvalidField ||= password;
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    formMessage.textContent =
      "Login is not connected yet. Connect an authentication backend to sign in securely.";
    formMessage.classList.add("visible");
  });

  email.addEventListener("input", () => setFieldError(email, ""));
  password.addEventListener("input", () => setFieldError(password, ""));

  passwordToggle.addEventListener("click", () => {
    const shouldShow = password.type === "password";
    password.type = shouldShow ? "text" : "password";
    passwordToggle.textContent = shouldShow ? "Hide" : "Show";
    passwordToggle.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    passwordToggle.setAttribute("aria-pressed", String(shouldShow));
  });

  document.querySelectorAll("[data-not-ready]").forEach((button) => {
    button.addEventListener("click", () => {
      formMessage.textContent = `${button.dataset.notReady} is not available yet.`;
      formMessage.classList.add("visible");
    });
  });
})();