import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from '@components/Toggle';

const WebPluginToggle = () => {
  const { t } = useTranslation();

  const setWeb = useStore((state) => state.setWeb);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().web
  );

  useEffect(() => {
    setWeb(isChecked);
  }, [isChecked]);

  return (
    <>
      <Toggle
        label={t('Web検索プラグイン') as string}
        isChecked={isChecked}
        setIsChecked={setIsChecked}
      />
    </>
  );
};

export default WebPluginToggle;
