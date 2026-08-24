import { Window } from 'happy-dom';
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) {
	globalThis.crypto = webcrypto as Crypto;
}

if (typeof globalThis.localStorage === 'undefined') {
	const window = new Window();
	globalThis.window = window as unknown as Window & typeof globalThis.window;
	globalThis.document = window.document;
	globalThis.localStorage = window.localStorage;
	globalThis.navigator = window.navigator;
}
