"use client";
import TitleBar from "@components/electron/TitleBar";
// import { Dialog } from "@components/ui/dialog";
// import { ResizablePanelGroup } from "@components/ui/resizable";
import { useEffect, useState } from "react";

export default function Home() {
	const [isClient, setIsClient] = useState(false);

	const isElectron = typeof window !== "undefined" && window.electron;

	useEffect(() => {
		setIsClient(false);

		if (isElectron) {
			setIsClient(true);
		}
	}, [isElectron]);

	if (!isClient) {
		return null;
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<TitleBar
				isElectron={isElectron}
				onOpenFile={() => {}}
				onOpenDirectory={() => {}}
				onSaveFile={() => {}}
				onToggleSidebar={() => {}}
				onUndo={() => {}}
				onRedo={() => {}}
			/>
			{/* <ResizablePanelGroup direction="horizontal">{}</ResizablePanelGroup>
			<StatusBar />
			<Dialog></Dialog> */}
		</div>
	);
}
