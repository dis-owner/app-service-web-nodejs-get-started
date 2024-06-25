import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from '@components/Toggle';

const FAQPluginToggle = () => {
  const { t } = useTranslation();

  const setFaq = useStore((state) => state.setFAQ);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().faq
  );

  useEffect(() => {
    setFaq(isChecked);
  }, [isChecked]);

  return (
    <>
      <Toggle
        label={t('FAQプラグイン') as string}
        isChecked={isChecked}
        setIsChecked={setIsChecked}
      />
    </>
  );
};

export default FAQPluginToggle;
