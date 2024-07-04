import { StoreSlice } from './store';
import { Theme } from '@type/theme';
import { ConfigInterface, TotalTokenUsed, DatasourceInterface, CitationInterface } from '@type/chat';
import { _defaultChatConfig, _defaultSystemMessage, _defaultDatasourceConfig, _defaultCitationContent } from '@constants/chat';

export interface ConfigSlice {
  openConfig: boolean;
  theme: Theme;
  autoTitle: boolean;
  hideMenuOptions: boolean;
  advancedMode: boolean;
  defaultChatConfig: ConfigInterface;
  defaultSystemMessage: string;
  hideSideMenu: boolean;
  enterToSubmit: boolean;
  inlineLatex: boolean;
  markdownMode: boolean;
  countTotalTokens: boolean;
  totalTokenUsed: TotalTokenUsed;
  faq: boolean;
  datasourceConfig: DatasourceInterface;
  isCitationMenu: boolean;
  citationContent: CitationInterface;
  web: boolean;
  setOpenConfig: (openConfig: boolean) => void;
  setTheme: (theme: Theme) => void;
  setAutoTitle: (autoTitle: boolean) => void;
  setAdvancedMode: (advancedMode: boolean) => void;
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => void;
  setDefaultSystemMessage: (defaultSystemMessage: string) => void;
  setHideMenuOptions: (hideMenuOptions: boolean) => void;
  setHideSideMenu: (hideSideMenu: boolean) => void;
  setEnterToSubmit: (enterToSubmit: boolean) => void;
  setInlineLatex: (inlineLatex: boolean) => void;
  setMarkdownMode: (markdownMode: boolean) => void;
  setCountTotalTokens: (countTotalTokens: boolean) => void;
  setTotalTokenUsed: (totalTokenUsed: TotalTokenUsed) => void;
  setFAQ: (faq: boolean) => void;
  setDatasourceConfig: (datasourceConfig: DatasourceInterface) => void
  setIsCitationMenu: (isCitationMenu: boolean) => void;
  setCitationContent: (citationContent: CitationInterface) => void;
  setWeb: (web: boolean) => void;
}

export const createConfigSlice: StoreSlice<ConfigSlice> = (set, get) => ({
  openConfig: false,
  theme: 'dark',
  hideMenuOptions: false,
  hideSideMenu: false,
  autoTitle: true,
  enterToSubmit: true,
  advancedMode: false,
  defaultChatConfig: _defaultChatConfig,
  defaultSystemMessage: _defaultSystemMessage,
  inlineLatex: false,
  markdownMode: true,
  countTotalTokens: false,
  totalTokenUsed: {},
  faq: false,
  datasourceConfig: _defaultDatasourceConfig,
  isCitationMenu: false,
  citationContent: _defaultCitationContent,
  web: false,
  setOpenConfig: (openConfig: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      openConfig: openConfig,
    }));
  },
  setTheme: (theme: Theme) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      theme: theme,
    }));
  },
  setAutoTitle: (autoTitle: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      autoTitle: autoTitle,
    }));
  },
  setAdvancedMode: (advancedMode: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      advancedMode: advancedMode,
    }));
  },
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultChatConfig: defaultChatConfig,
    }));
  },
  setDefaultSystemMessage: (defaultSystemMessage: string) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultSystemMessage: defaultSystemMessage,
    }));
  },
  setHideMenuOptions: (hideMenuOptions: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideMenuOptions: hideMenuOptions,
    }));
  },
  setHideSideMenu: (hideSideMenu: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideSideMenu: hideSideMenu,
    }));
  },
  setEnterToSubmit: (enterToSubmit: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      enterToSubmit: enterToSubmit,
    }));
  },
  setInlineLatex: (inlineLatex: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      inlineLatex: inlineLatex,
    }));
  },
  setMarkdownMode: (markdownMode: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      markdownMode: markdownMode,
    }));
  },
  setCountTotalTokens: (countTotalTokens: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      countTotalTokens: countTotalTokens,
    }));
  },
  setTotalTokenUsed: (totalTokenUsed: TotalTokenUsed) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      totalTokenUsed: totalTokenUsed,
    }));
  },
  setFAQ: (faq: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      faq: faq,
    }));
  },
  setDatasourceConfig: (datasourceConfig: DatasourceInterface) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      datasourceConfig: datasourceConfig,
    }));
  },
  setIsCitationMenu: (isCitationMenu: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      isCitationMenu: isCitationMenu,
    }));
  },
  setCitationContent: (citationContent: CitationInterface) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      citationContent: citationContent,
    }));
  },
  setWeb: (web: boolean) =>{
    set((prev: ConfigSlice) => ({
      ...prev,
      web: web
    }));
  }
});
