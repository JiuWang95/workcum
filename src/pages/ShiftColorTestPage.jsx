import React from 'react';
import { useTranslation } from 'react-i18next';
import ShiftColorTest from '../components/ShiftColorTest';

const ShiftColorTestPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('time_entry.custom_shift.title')} - 颜色测试</h1>
      <ShiftColorTest />
    </div>
  );
};

export default ShiftColorTestPage;