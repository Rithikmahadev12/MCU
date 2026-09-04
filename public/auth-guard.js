"use strict";

/**
 * Runs synchronously (no `defer`) and as early as possible in <head> so an
 * unauthenticated visitor is bounced to the login screen before the desktop
 * markup ever paints. This is a convenience gate for a personal project, not
 * a real access-control layer (see login.js for the same caveat).
 */
(function guard() {
	if (sessionStorage.getItem("starkOsAuthenticated") !== "true") {
		location.replace("login.html");
	}
})();
