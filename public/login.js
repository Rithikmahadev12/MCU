"use strict";

/**
 * NOTE: This is a client-side-only gate meant for a personal/home test
 * project. It is NOT real security — anyone who views the page source can
 * read the credentials below. Do not rely on this to protect anything
 * sensitive or to gate access on a network you don't control.
 */
const STARK_OS_CREDENTIALS = {
	username: "MCU",
	password: "Spidey_stark4k",
};

const SESSION_KEY = "starkOsAuthenticated";

const form = document.getElementById("login-form");
const usernameInput = document.getElementById("login-username");
const passwordInput = document.getElementById("login-password");
const errorEl = document.getElementById("login-error");
const terminal = document.querySelector(".terminal");

// If already logged in this session, skip straight to the desktop.
if (sessionStorage.getItem(SESSION_KEY) === "true") {
	location.replace("index.html");
}

form.addEventListener("submit", (event) => {
	event.preventDefault();

	const username = usernameInput.value.trim();
	const password = passwordInput.value;

	if (
		username === STARK_OS_CREDENTIALS.username &&
		password === STARK_OS_CREDENTIALS.password
	) {
		sessionStorage.setItem(SESSION_KEY, "true");
		location.href = "index.html";
		return;
	}

	errorEl.textContent = "Access denied.";
	terminal.classList.remove("shake");
	void terminal.offsetWidth; // restart the shake animation
	terminal.classList.add("shake");
	passwordInput.value = "";
});
