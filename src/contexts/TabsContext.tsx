import React, { createContext, useContext, useState } from 'react';
import { FileTab } from '@/lib/types';
import { tabService } from '@/services/tab-service';

interface TabsContextType {
  tabs: FileTab[];
  activeTab: string | null;
  openTab: (fileData: { path: string; content: string; name: string; language: string }) => void;
  closeTab: (tabId: string) => void;
  handleTabClick: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const value = {
    tabs,
    activeTab,
    openTab,
    closeTab,
    handleTabClick,
  };

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

export const useTabs = (): TabsContextType => {
  const context = useContext(TabsContext);

  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }

  return context;
};
