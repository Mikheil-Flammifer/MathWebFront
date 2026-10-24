import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { questApi } from '../../api/questApi';
import { problemStaffApi } from '../../api/problemApi';
import { applyProblemImages } from '../../utils/applyProblemImages';
import ProblemForm from '../../components/problem/ProblemForm';

export default function ProblemCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const presetQuestId = params.get('questId');

  const { data: quests, isLoading } = useQuery({
    queryKey: ['admin-quests'],
    queryFn: () => questApi.getAdminAll(),
  });

  const mutation = useMutation({
    mutationFn: async ({ payload, images }) => {
      const saved = await problemStaffApi.create(payload);
      const failed = await applyProblemImages(saved.id, images);
      return { saved, failed };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries();
      if (result.failed.length > 0) {
        toast.error(
          'Problem created, but an image failed: ' + result.failed.join('; ')
        );
        navigate(`/admin/problems/${result.saved.id}/edit`);
        return;
      }
      navigate(`/quests/${variables.payload.questId}/edit`);
    },
  });

  const errorMessage = mutation.isError
    ? mutation.error?.response?.data?.message || 'Could not create the problem'
    : '';

  if (isLoading) {
    return <div className="p-6 text-white/60">Loading…</div>;
  }

  const preset = (quests ?? []).find((q) => String(q.id) === presetQuestId);

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link to="/admin/quests" className="text-sm text-white/50 hover:text-white">
        ← Back to quests
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">New problem</h1>
      <ProblemForm
        key={preset ? preset.id : 'none'}
        quests={quests ?? []}
        initial={
          preset
            ? {
                questId: preset.id,
                difficultyLevel: preset.difficultyLevel,
                orderIndex: (preset.totalProblems ?? 0) + 1,
              }
            : undefined
        }
        submitLabel="Create problem"
        submitting={mutation.isPending}
        error={errorMessage}
        onSubmit={(payload, images) => mutation.mutate({ payload, images })}
      />
    </div>
  );
}