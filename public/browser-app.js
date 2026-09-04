"use strict";


let scramjetController = null;
let bareMuxConnection = null;

function getScramjet() {
	if (scramjetController) return scramjetController;
	const { ScramjetController } = $scramjetLoadController();
	scramjetController = new ScramjetController({
		files: {
			wasm: "/scram/scramjet.wasm.wasm",
			all: "/scram/scramjet.all.js",
			sync: "/scram/scramjet.sync.js",
		},
	});
	scramjetController.init();
	return scramjetController;
}

function getBareMux() {
	if (bareMuxConnection) return bareMuxConnection;
	bareMuxConnection = new BareMux.BareMuxConnection("/baremux/worker.js");
	return bareMuxConnection;
}

/**
 * Called by desktop.js once the Browser window (cloned from its <template>)
 * has been inserted into the DOM.
 */
function initBrowserApp(win) {
	const form = win.querySelector("#sj-form");
	const address = win.querySelector("#sj-address");
	const searchEngine = win.querySelector("#sj-search-engine");
	const error = win.querySelector("#sj-error");
	const errorCode = win.querySelector("#sj-error-code");
	const frameHolder = win.querySelector("#browser-frame-holder");

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		error.textContent = "";
		errorCode.textContent = "";

		try {
			await registerSW();
		} catch (err) {
			error.textContent = "Failed to register service worker.";
			errorCode.textContent = err.toString();
			return;
		}

		const url = search(address.value, searchEngine.value);
		const connection = getBareMux();

		let wispUrl =
			(location.protocol === "https:" ? "wss" : "ws") +
			"://" +
			location.host +
			"/wisp/";

		if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
			await connection.setTransport("/libcurl/index.mjs", [
				{ websocket: wispUrl },
			]);
		}

		frameHolder.innerHTML = "";
		const scramjet = getScramjet();
		const frame = scramjet.createFrame();
		frame.frame.id = "sj-frame";
		frame.frame.style.width = "100%";
		frame.frame.style.height = "100%";
		frame.frame.style.border = "none";
		frameHolder.appendChild(frame.frame);
		frame.go(url);
	});
}
