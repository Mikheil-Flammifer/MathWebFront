import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { questApi } from '../../api/questApi';
import QuestForm from '../../components/quest/QuestForm';

const getPrereqIds = (quest) => {
  if (Array.isArray(quest.prerequisiteIds)) return quest.prerequisiteIds;
  if (Array.isArray(quest.prerequisites)) {
    return quest.prerequisites.map((p) => (typeof p === 'object' ? p.id : p));
  }
  return [];
};

export default function QuestSettingsPage() {
  const { id } = useParams();
  const questId = Number(id);
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: quests, isLoading, isError } = useQuery({
    queryKey: ['admin-quests'],
    queryFn: () => questApi.getAdminAll(),
  });

  const quest = useMemo(
    () => (quests ?? []).find((q) => q.id === questId),
    [quests, questId]
  );

  const knownDescription = quest ? 'description' in quest : false;
  const knownPrereqs = quest
    ? 'prerequisiteIds' in quest || 'prerequisites' in quest
    : false;

  const mutation = useMutation({
    mutationFn: (patch) => questApi.update(questId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSaved(true);
    },
  });

  const handleSubmit = (values) => {
    setSaved(false);
    const patch = {
      title: values.title,
      difficultyLevel: values.difficultyLevel,
      xpReward: values.xpReward,
    };
    if (knownDescription || values.description) {
      patch.description = values.description;
    }
    if (knownPrereqs || values.prerequisiteIds.length > 0) {
      patch.prerequisiteIds = values.prerequisiteIds;
    }
    mutation.mutate(patch);
  };

  const errorMessage = mutation.isError
    ? mutation.error?.response?.data?.message || 'Could not save the quest'
    : '';

  if (isLoading) {
    return <div className="p-6 text-white/60">Loading…</div>;
  }
  if (isError || !quest) {
    return (
      <div className="p-6 text-white/70">
        Quest not found.{' '}
        <Link to="/admin/quests" className="underline">
          Back to quests
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link to="/admin/quests" className="text-sm text-white/50 hover:text-white">
        ← Back to quests
      </Link>
      <div className="mb-6 mt-3 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-white">Quest settings</h1>
        <Link
          to={`/quests/${quest.id}/edit`}
          className="btn-secondary inline-flex items-center gap-1"
        >
          Edit map
        </Link>
      </div>

      {(!knownDescription || !knownPrereqs) && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          The quest list doesn't include{' '}
          {[!knownDescription && 'the description', !knownPrereqs && 'prerequisites']
            .filter(Boolean)
            .join(' or ')}
          , so those fields start blank. They stay unchanged unless you fill them in.
        </div>
      )}

      {saved && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          Saved.
        </div>
      )}

      <QuestForm
        key={quest.id}
        initial={{
          title: quest.title,
          description: quest.description ?? '',
          difficultyLevel: quest.difficultyLevel,
          xpReward: quest.xpReward ?? 0,
          prerequisiteIds: getPrereqIds(quest),
        }}
        excludeId={quest.id}
        submitLabel="Save changes"
        submitting={mutation.isPending}
        error={errorMessage}
        onSubmit={handleSubmit}
      />
    </div>
  );
}