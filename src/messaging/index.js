import loc from "./loc.json";

export function message(text) {
	alert(`${loc.header}\n${text}\n${loc.footer}`);
}

export function yell(text) {
	alert(`${loc.yellHeader}\n${text.toUpperCase()}`);
}
