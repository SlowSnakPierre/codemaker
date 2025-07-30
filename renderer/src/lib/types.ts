import type { editor } from "monaco-editor";
import type { ElectronAPI } from "@electron/preload";

declare global {
	interface Window {
		electron: ElectronAPI;
		monaco: editor.IStandaloneCodeEditor | null;
	}
}
