import loc from "./loc.json";
import { message } from "../messaging";

export function welcome(who) {
	message(`${loc.hello} ${who}`);
}
