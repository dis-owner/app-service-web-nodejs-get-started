import React, { useState } from 'react';
import useStore from '@store/store';

import ChatContent from './ChatContent';
import MobileBar from '../MobileBar';
import CitationMenu from '@components/CitationMenu';
import StopGeneratingButton from '@components/StopGeneratingButton/StopGeneratingButton';

const Chat = () => {
  const hideSideMenu = useStore((state) => state.hideSideMenu);
  // 引用サイドメニュー用フラグ 2024.5.27 nemoto
  const isCitationMenu = useStore((state) => state.isCitationMenu);
  return (
    <div
      className={`flex h-full flex-1 flex-col ${
        hideSideMenu ? 'md:pl-0' : 'md:pl-[260px]'
      } ${isCitationMenu ? 'md:pr-[300px]' : 'md:pr-0'}`} 
    >
      <MobileBar />
      
      <CitationMenu /> 
      <main className='relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1'>
        <ChatContent />
        <StopGeneratingButton />
      </main>
    </div>
  );
};

export default Chat;
