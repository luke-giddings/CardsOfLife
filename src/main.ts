import "./styles.css";
import { Game } from "./ui/app.ts";

const root = document.getElementById("app");
if (root) new Game(root);
