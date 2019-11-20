import loc from "./loc.json";

export default function startup() {
	document.getElementById("button").addEventListener("click", async () => {
		const { welcome } = await import("../module");
		welcome(loc.world);
	});
}
