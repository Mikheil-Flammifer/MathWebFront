import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { questApi } from '../../api/questApi';
import QuestForm from '../../components/quest/QuestForm';

export default function QuestCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => questApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries();
      const created = res.data.data;
      navigate(`/quests/${created.id}/edit`);
    },
  });

  const errorMessage = mutation.isError
    ? mutation.error?.response?.data?.message || 'Could not create the quest'
    : '';

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link to="/admin/quests" className="text-sm text-white/50 hover:text-white">
        ← Back to quests
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">New quest</h1>
      <QuestForm
        submitLabel="Create quest"
        submitting={mutation.isPending}
        error={errorMessage}
        onSubmit={(payload) => mutation.mutate(payload)}
      />
    </div>
  );
}