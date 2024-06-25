import React from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { ChatInterface, MessageInterface,CitationInterface } from '@type/chat';
import { getChatCompletion, getChatCompletionStream, getFAQChatCompletionStream } from '@api/api';
import { parseEventSource } from '@api/helper';
import { limitMessageTokens, updateTotalTokenUsed } from '@utils/messageUtils';
import { _defaultChatConfig } from '@constants/chat';
import { officialAPIEndpoint } from '@constants/auth';


const useSubmit = () => {
  const { t, i18n } = useTranslation('api');
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const apiEndpoint = useStore((state) => state.apiEndpoint);
  const apiKey = useStore((state) => state.apiKey);
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);
  const faq = useStore((state) => state.faq);
  const datasourceConfig = useStore((state) => state.datasourceConfig);

  const generateTitle = async (
    message: MessageInterface[]
  ): Promise<string> => {
    let data;
    try {
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        data = await getChatCompletion(
          useStore.getState().apiEndpoint,
          message,
          _defaultChatConfig
        );
      } else if (apiKey) {
        // own apikey
        
        data = await getChatCompletion(
          useStore.getState().apiEndpoint,
          message,
          _defaultChatConfig,
          apiKey
        );
      }
    } catch (error: unknown) {
      throw new Error(`Error generating title!\n${(error as Error).message}`);
    }
    return data.choices[0].message.content;
  };

  const handleSubmit = async () => {
    const chats = useStore.getState().chats;
    if (generating || !chats) return;

    const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));

    updatedChats[currentChatIndex].messages.push({
      role: 'assistant',
      content: '',
    });

    setChats(updatedChats);
    setGenerating(true);

    try {
      let stream;
      if (chats[currentChatIndex].messages.length === 0)
        throw new Error('No messages submitted!');

      const messages = limitMessageTokens(
        chats[currentChatIndex].messages,
        chats[currentChatIndex].config.max_tokens,
        chats[currentChatIndex].config.model
      );
      if (messages.length === 0) throw new Error('Message exceed max token!');

      // no api key (free)
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint,
          messages,
          chats[currentChatIndex].config
        );
      } else if (apiKey) {
        // own apikey
        if(faq){
          console.log('FAQ')
          stream = await getFAQChatCompletionStream(
            useStore.getState().apiEndpoint,
            messages,
            chats[currentChatIndex].config,
            apiKey,
            [datasourceConfig]
          );
        }else{
          stream = await getChatCompletionStream(
            useStore.getState().apiEndpoint,
            messages,
            chats[currentChatIndex].config,
            apiKey
          );
        }
      }

      if (stream) {
        if (stream.locked)
          throw new Error(
            'Oops, the stream is locked right now. Please try again'
          );
        const reader = stream.getReader();
        let reading = true;
        let partial = '';
        let citations: CitationInterface[] = []
        while (reading && useStore.getState().generating) {
          const { done, value } = await reader.read();
          const result = parseEventSource(
            partial + new TextDecoder().decode(value)
          );
          partial = '';
          
          if (result === '[DONE]' || done) {      
            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );

            const updatedMessages = updatedChats[currentChatIndex].messages;
            updatedMessages[updatedMessages.length - 1].citation = citations;
            setChats(updatedChats);    
            reading = false;
          } else {
            const resultString = result.reduce((output: string, curr) => {
              if (faq) {
                if (typeof curr === 'string') {
                  const test = curr.split('data:');
                  console.log(test)
                  if (test.length<=4){
                    for(var i = 1;i<test.length;i++){
                      const jsonObject = JSON.parse(test[i])
                      const role = jsonObject.choices[0]?.messages[0]?.delta?.role ?? null
                      const content = jsonObject.choices[0]?.messages[0]?.delta?.content ?? null;
                      
                      if (role && role == "tool"){
                        const jsonCitation = JSON.parse(content)
                        
                        console.log(jsonCitation)
                        for(const cit of jsonCitation.citations){
                          const citationExists = citations.some(citation => citation.title === cit.filepath);
                          if (!citationExists) {
                            citations.push({'id': citations.length + 1, 'title': cit.filepath, 'content':cit.content});
                          }
                          else{
                            const existingCitation = citations.find(citation => citation.title === cit.filepath);
                            if (existingCitation && !existingCitation.content.includes(cit.content)) {
                              // content が含まれていない場合は、追加する
                              existingCitation.content += " " + cit.content; // 既存の content に追加
                            }
                          }
                        }
                      }
                    }
                  }
                }
                else{
                  console.log(curr)
                  const tool = curr.choices[0]?.delta?.context?.messages[0]?.role                 
                  if(tool === 'tool'){
                    const content = curr.choices[0]?.delta?.context?.messages[0]?.content ?? null;
                    const jsonCitation = JSON.parse(content)
                    
                    for(const cit of jsonCitation.citations){
                      const citationExists = citations.some(citation => citation.title === cit.filepath);
                      if (!citationExists) {
                        citations.push({'id': citations.length + 1, 'title': cit.filepath, 'content':cit.content});
                      }
                      else{
                        const existingCitation = citations.find(citation => citation.title === cit.filepath);
                        if (existingCitation && !existingCitation.content.includes(cit.content)) {
                          // content が含まれていない場合は、追加する
                          existingCitation.content += " " + cit.content; // 既存の content に追加
                        }
                      }
                    }
                  }
                }
              }
              if (typeof curr === 'string') {
                partial += curr;
              } else {

                const content = curr.choices[0]?.delta?.content ?? null;
                if (content) output += content;
              }
              return output;
            }, '');
            
            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );

            const updatedMessages = updatedChats[currentChatIndex].messages;
            updatedMessages[updatedMessages.length - 1].content += resultString;
            
            setChats(updatedChats);
          }
        }
        
        if (useStore.getState().generating) {
          reader.cancel('Cancelled by user');
        } else {
          reader.cancel('Generation completed');
        }
        reader.releaseLock();
        stream.cancel();
      }

      // update tokens used in chatting
      const currChats = useStore.getState().chats;
      const countTotalTokens = useStore.getState().countTotalTokens;
     
      if (currChats && countTotalTokens) {
        const model = currChats[currentChatIndex].config.model;
        const messages = currChats[currentChatIndex].messages;
        updateTotalTokenUsed(
          model,
          messages.slice(0, -1),
          messages[messages.length - 1]
        );
      }

      // generate title for new chats
      if (
        useStore.getState().autoTitle &&
        currChats &&
        !currChats[currentChatIndex]?.titleSet
      ) {
        const messages_length = currChats[currentChatIndex].messages.length;
        const assistant_message =
          currChats[currentChatIndex].messages[messages_length - 1].content;
        const user_message =
          currChats[currentChatIndex].messages[messages_length - 2].content;

        const message: MessageInterface = {
          role: 'user',
          content: `Generate a title in less than 6 words for the following message (language: ${i18n.language}):\n"""\nUser: ${user_message}\nAssistant: ${assistant_message}\n"""`,
        };

        let title = (await generateTitle([message])).trim();
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.slice(1, -1);
        }
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].title = title;
        updatedChats[currentChatIndex].titleSet = true;
        setChats(updatedChats);

        // update tokens used for generating title
        if (countTotalTokens) {
          const model = _defaultChatConfig.model;
          updateTotalTokenUsed(model, [message], {
            role: 'assistant',
            content: title,
          });
        }
      }
    } catch (e: unknown) {
      const err = (e as Error).message;
      console.log(err);
      setError(err);
    }
    setGenerating(false);
  };

  return { handleSubmit, error };
};

export default useSubmit;
