# Northstar Authentication Demo

A client-side authentication system built with HTML, CSS, and JavaScript.

## Run

Open `index.html` in a modern browser. No build step or server is required.

## Features

- Registration with username, email, and password validation
- Duplicate username/email detection
- SHA-256 password hashing through the Web Crypto API
- Login with generic incorrect-credential messaging
- Protected dashboard using a localStorage session
- Logout and direct-access protection

This is an educational client-side demo. A production system should authenticate on a server and use secure, HTTP-only cookies for sessions.
