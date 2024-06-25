import React, { useState } from 'react';
import useStore from '@store/store';

import ContentView from './View/ContentView';
import EditView from './View/EditView';
import {CitationInterface} from '@type/chat'
const MessageContent = ({
  role,
  content,
  messageIndex,
  sticky = false,
  citation,
}: {
  role: string;
  content: string;
  messageIndex: number;
  sticky?: boolean;
  citation?: CitationInterface[];
}) => {
  const [isEdit, setIsEdit] = useState<boolean>(sticky);
  const advancedMode = useStore((state) => state.advancedMode);

  return (
    <div className='relative flex flex-col gap-2 md:gap-3 lg:w-[calc(100%-115px)]'>
      {advancedMode && <div className='flex flex-grow flex-col gap-3'></div>}
      {isEdit ? (
        <EditView
          content={content}
          setIsEdit={setIsEdit}
          messageIndex={messageIndex}
          sticky={sticky}
        />
      ) : (
        <ContentView
          role={role}
          content={content}
          setIsEdit={setIsEdit}
          messageIndex={messageIndex}
          citation={citation}
        />
      )}
    </div>
  );
};

export default MessageContent;
