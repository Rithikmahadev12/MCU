"use strict";

/**
 * Minimal window manager for MCU OS.
 * Handles opening/closing/focusing/dragging simple app windows that are
 * cloned from <template> tags in index.html.
 */

const desktop = document.getElementById("desktop");
const windowsLayer = document.getElementById("windows-layer");
const taskbarRunning = document.getElementById("taskbar-running");
const clockEl = document.getElementById("taskbar-clock");
const logoutBtn = document.getElementById("logout-btn");
const startBtn = document.getElementById("start-btn");

let zCounter = 10;
const openWindows = new Map(); // appId -> window element

const APP_CONFIG = {
	browser: { title: "Browser", template: "browser-app-template", width: 820, height: 560 },
	notes: { title: "F.R.I.D.A.Y. Notes", template: "notes-app-template", width: 420, height: 380 },
	about: { title: "About MCU OS", template: "about-app-template", width: 420, height: 320 },
};

function updateClock() {
	const now = new Date();
	clockEl.textContent = now.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}
updateClock();
setInterval(updateClock, 1000 * 15);

function focusWindow(win) {
	zCounter += 1;
	win.style.zIndex = zCounter;
	document
		.querySelectorAll(".os-window")
		.forEach((w) => w.classList.remove("focused"));
	win.classList.add("focused");
}

function openApp(appId) {
	if (openWindows.has(appId)) {
		const existing = openWindows.get(appId);
		existing.classList.remove("minimized");
		focusWindow(existing);
		return existing;
	}

	const config = APP_CONFIG[appId];
	if (!config) return null;

	const template = document.getElementById(config.template);
	const win = document.createElement("div");
	win.className = "os-window";
	win.style.width = config.width + "px";
	win.style.height = config.height + "px";
	win.style.left = 60 + openWindows.size * 28 + "px";
	win.style.top = 60 + openWindows.size * 28 + "px";

	win.innerHTML = `
		<div class="os-window-titlebar">
			<span class="os-window-title">${config.title}</span>
			<div class="os-window-controls">
				<button class="os-window-btn os-window-minimize" title="Minimize">&minus;</button>
				<button class="os-window-btn os-window-close" title="Close">&times;</button>
			</div>
		</div>
		<div class="os-window-body"></div>
	`;

	win.querySelector(".os-window-body").appendChild(
		template.content.cloneNode(true),
	);

	windowsLayer.appendChild(win);
	openWindows.set(appId, win);
	addTaskbarEntry(appId, config.title);
	makeDraggable(win);
	focusWindow(win);

	win.querySelector(".os-window-close").addEventListener("click", () => {
		closeApp(appId);
	});
	win.querySelector(".os-window-minimize").addEventListener("click", () => {
		win.classList.toggle("minimized");
	});
	win.addEventListener("mousedown", () => focusWindow(win));

	if (appId === "browser") initBrowserApp(win);
	if (appId === "notes") initNotesApp(win);

	return win;
}

function closeApp(appId) {
	const win = openWindows.get(appId);
	if (!win) return;
	win.remove();
	openWindows.delete(appId);
	const entry = document.getElementById(`taskbar-entry-${appId}`);
	if (entry) entry.remove();
}

function addTaskbarEntry(appId, title) {
	const btn = document.createElement("button");
	btn.className = "taskbar-entry";
	btn.id = `taskbar-entry-${appId}`;
	btn.textContent = title;
	btn.addEventListener("click", () => {
		const win = openWindows.get(appId);
		if (!win) return;
		win.classList.remove("minimized");
		focusWindow(win);
	});
	taskbarRunning.appendChild(btn);
}

function makeDraggable(win) {
	const titlebar = win.querySelector(".os-window-titlebar");
	let dragging = false;
	let offsetX = 0;
	let offsetY = 0;

	titlebar.addEventListener("mousedown", (event) => {
		dragging = true;
		offsetX = event.clientX - win.offsetLeft;
		offsetY = event.clientY - win.offsetTop;
		focusWindow(win);
	});

	document.addEventListener("mousemove", (event) => {
		if (!dragging) return;
		win.style.left = Math.max(0, event.clientX - offsetX) + "px";
		win.style.top = Math.max(0, event.clientY - offsetY) + "px";
	});

	document.addEventListener("mouseup", () => {
		dragging = false;
	});
}

function initNotesApp(win) {
	const textarea = win.querySelector("#notes-textarea");
	const saved = localStorage.getItem("mcuOsNotes");
	if (saved) textarea.value = saved;
	textarea.addEventListener("input", () => {
		localStorage.setItem("mcuOsNotes", textarea.value);
	});
}

document.querySelectorAll(".desktop-icon").forEach((icon) => {
	icon.addEventListener("dblclick", () => openApp(icon.dataset.app));
	icon.addEventListener("click", () => openApp(icon.dataset.app));
});

logoutBtn.addEventListener("click", () => {
	sessionStorage.removeItem("mcuOsAuthenticated");
	location.replace("login.html");
});

startBtn.addEventListener("click", () => {
	openApp("about");
});
