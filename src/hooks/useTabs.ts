import { useState } from "react";
import { FileTab } from "@/lib/types";
import { tabService } from "@/services/tab-service";

export function useTabs() {
  const [tabs, setTabs] = useState<FileTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const openTab = (fileData: { path: string; content: string; name: string; language: string }) => {
    setTabs((prevTabs) => tabService.openTab(prevTabs, fileData));
    setActiveTab(`tab-${Date.now()}`);
  };

  const closeTab = (tabId: string) => {
    setTabs((prevTabs) => tabService.closeTab(prevTabs, tabId));
    setActiveTab((prevTabs) => (prevTabs.length > 0 ? prevTabs[0].id : null));
  };

  const handleTabClick = (tabId: string) => {
    setTabs((prevTabs) => tabService.switchTab(prevTabs, tabId));
    setActiveTab(tabId);
  };

  return { tabs, activeTab, openTab, closeTab, handleTabClick };
}
