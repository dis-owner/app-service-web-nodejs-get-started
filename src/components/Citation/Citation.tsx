import React,{useState} from 'react';
import useStore from '@store/store';

const Citation = ({ index, title, content }:{index: number, title: string, content : string}) => {
  const setIsCitationMenu = useStore((state) => state.setIsCitationMenu);
  const setCitationContent = useStore((state) => state.setCitationContent);

  const isWebCitation = (url :string) =>{
    return url.startsWith('http');
  }

  // 引用サイドメニューへデータ受渡し 2024.5.27 nemoto
  const setCurrentCitation = () => {
    setCitationContent({
      id:index,
      title:title,
      content:content,
    })
    setIsCitationMenu(true);
  }

  const renderLink = () => {
    if (!isWebCitation(content)) {
      return (
        <a
          className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200  cursor-pointer text-sm'
          onClick={() => {
            setCurrentCitation();
          }}
        >[doc{index+1}]:{title}</a>
      );
    } else {
      return (
        <a
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200  cursor-pointer text-sm'
        >引用{index + 1}: {title}</a>
      );
    }
  }

  return (
    <>

      {renderLink()}
    </>
  );
};

export default Citation;