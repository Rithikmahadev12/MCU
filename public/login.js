"use strict";

/**
 * NOTE: This is a client-side-only gate meant for a personal/home test
 * project. It is NOT real security — anyone who views the page source can
 * read the credentials below. Do not rely on this to protect anything
 * sensitive or to gate access on a network you don't control.
 */
const MCU_OS_CREDENTIALS = {
	username: "MCU",
	password: "Spidey_stark4k",
};

const SESSION_KEY = "mcuOsAuthenticated";

const form = document.getElementById("login-form");
const usernameInput = document.getElementById("login-username");
const passwordInput = document.getElementById("login-password");
const errorEl = document.getElementById("login-error");

// If already logged in this session, skip straight to the desktop.
if (sessionStorage.getItem(SESSION_KEY) === "true") {
	location.replace("index.html");
}

form.addEventListener("submit", (event) => {
	event.preventDefault();

	const username = usernameInput.value.trim();
	const password = passwordInput.value;

	if (
		username === MCU_OS_CREDENTIALS.username &&
		password === MCU_OS_CREDENTIALS.password
	) {
		sessionStorage.setItem(SESSION_KEY, "true");
		location.href = "index.html";
		return;
	}

	errorEl.textContent = "Access denied. Credentials not recognized.";
	document.querySelector(".login-card").classList.remove("shake");
	// restart the shake animation
	void document.querySelector(".login-card").offsetWidth;
	document.querySelector(".login-card").classList.add("shake");
	passwordInput.value = "";
});
