import React from 'react';
import { useParams } from 'react-router-dom';
import SkillHubPage from './SkillHubPage';
import SkillInputPage from './SkillInputPage';

export default function SkillRoutePage() {
  const { pathId } = useParams<{ pathId: string }>();
  const looksLikeMongoId = /^[a-f0-9]{24}$/i.test(pathId || '');

  return looksLikeMongoId ? <SkillInputPage /> : <SkillHubPage />;
}
