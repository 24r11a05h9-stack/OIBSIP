const USERS_KEY = "northstar_users";
const SESSION_KEY = "northstar_session";

const views = {
  login: document.querySelector("#login-view"),
  register: document.querySelector("#register-view"),
  dashboard: document.querySelector("#dashboard-view")
};
const viewKicker = document.querySelector("#view-kicker");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const loginMessage = document.querySelector("#login-message");
const registerMessage = document.querySelector("#register-message");
const dashboardGreeting = document.querySelector("#dashboard-greeting");

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  const encodedPassword = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encodedPassword);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function setMessage(element, message, type = "error") {
  element.textContent = message;
  element.classList.toggle("success", type === "success");
}

function navigate(viewName) {
  const isAuthenticated = Boolean(getSession());
  const requestedView = viewName === "dashboard" && !isAuthenticated ? "login" : viewName;

  Object.entries(views).forEach(([name, view]) => {
    view.classList.toggle("hidden", name !== requestedView);
  });

  viewKicker.textContent = {
    login: "Welcome back",
    register: "New account",
    dashboard: "Northstar / private"
  }[requestedView];

  if (requestedView === "dashboard") {
    dashboardGreeting.textContent = `You are in, ${getSession()}.`;
  }

  history.replaceState(null, "", `#${requestedView}`);
}

function validateRequired(values) {
  return Object.values(values).every((value) => value.trim());
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const username = formData.get("username").trim();
  const email = formData.get("email").trim().toLowerCase();
  const password = formData.get("password");

  setMessage(registerMessage, "");
  if (!validateRequired({ username, email, password })) {
    setMessage(registerMessage, "Please complete every field.");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setMessage(registerMessage, "Enter a valid email address.");
    return;
  }
  if (password.length < 8 || !/\d/.test(password)) {
    setMessage(registerMessage, "Password needs 8+ characters and at least 1 number.");
    return;
  }

  const users = readUsers();
  const duplicate = users.some((user) => user.username.toLowerCase() === username.toLowerCase() || user.email === email);
  if (duplicate) {
    setMessage(registerMessage, "That username or email is already registered.");
    return;
  }

  users.push({ username, email, passwordHash: await hashPassword(password) });
  saveUsers(users);
  registerForm.reset();
  setMessage(loginMessage, "Account created. You can log in now.", "success");
  navigate("login");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const identity = formData.get("identity").trim().toLowerCase();
  const password = formData.get("password");

  setMessage(loginMessage, "");
  if (!validateRequired({ identity, password })) {
    setMessage(loginMessage, "Please enter your username or email and password.");
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = readUsers().find((candidate) => (
    candidate.username.toLowerCase() === identity || candidate.email === identity
  ) && candidate.passwordHash === passwordHash);

  if (!user) {
    setMessage(loginMessage, "We couldn't sign you in with those details.");
    return;
  }

  localStorage.setItem(SESSION_KEY, user.username);
  loginForm.reset();
  navigate("dashboard");
});

document.querySelectorAll("[data-navigate]").forEach((button) => {
  button.addEventListener("click", () => {
    setMessage(loginMessage, "");
    setMessage(registerMessage, "");
    navigate(button.dataset.navigate);
  });
});

document.querySelector("#logout-button").addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  setMessage(loginMessage, "You have been logged out.", "success");
  navigate("login");
});

const initialView = window.location.hash.slice(1);
navigate(initialView === "register" ? "register" : initialView === "dashboard" ? "dashboard" : "login");
