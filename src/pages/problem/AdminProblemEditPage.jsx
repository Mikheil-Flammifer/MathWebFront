import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { questApi } from '../../api/questApi';
import { problemStaffApi } from '../../api/problemApi';
import ProblemForm from '../../components/problem/ProblemForm';

export default function ProblemEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: problem, isLoading, isError, error } = useQuery({
    queryKey: ['problem-staff', id],
    queryFn: () => problemStaffApi.getById(id),
  });

  const { data: quests } = useQuery({
    queryKey: ['admin-quests'],
    queryFn: () => questApi.getAdminAll(),
  });

  const mutation = useMutation({
    mutationFn: (payload) => problemStaffApi.update(id, payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries();
      navigate(`/quests/${payload.questId}/edit`);
    },
  });

  const errorMessage = mutation.isError
    ? mutation.error?.response?.data?.message || 'Could not save the problem'
    : '';

  if (isLoading) {
    return <div className="p-6 text-white/60">Loading…</div>;
  }
  if (isError || !problem) {
    return (
      <div className="p-6 text-white/70">
        {error?.response?.data?.message || 'Problem not found.'}{' '}
        <Link to="/admin/quests" className="underline">
          Back to quests
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link
        to={`/quests/${problem.questId}/edit`}
        className="text-sm text-white/50 hover:text-white"
      >
        ← Back to map editor
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold text-white">
        Edit problem #{problem.id}
      </h1>
      <ProblemForm
        key={problem.id}
        quests={quests ?? []}
        lockQuest
        initial={{
          questId: problem.questId,
          questionText: problem.questionText,
          problemType: problem.problemType,
          difficultyLevel: problem.difficultyLevel,
          categoryId: problem.categoryId,
          xpReward: problem.xpReward,
          orderIndex: problem.orderIndex,
          explanation: problem.explanation ?? '',
          correctAnswer: problem.correctAnswer ?? '',
          answerOptions: (problem.answerOptions ?? []).map((o) => ({
            optionText: o.optionText,
            isCorrect: !!(o.isCorrect ?? o.correct),
          })),
        }}
        submitLabel="Save changes"
        submitting={mutation.isPending}
        error={errorMessage}
        onSubmit={(payload) => mutation.mutate(payload)}
      />
    </div>
  );
}