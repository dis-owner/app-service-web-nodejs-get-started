import useStore from '@store/store';
import { bingAPIKey,bingAPIEndpoint } from '@constants/auth'

export const getBingSearch = async (
  search_query: string
) => {
  const response = await fetch(
    `https://api.bing.microsoft.com/v7.0/search${search_query}&count=5`,
    {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': `${bingAPIKey}`,
      },
    }
  );
  if (!response.ok) throw new Error(await response.text());
  
  const data = await response.json();
  return data;
};
