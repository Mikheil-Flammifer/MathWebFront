import { MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useComments, usePostComment, useVoteComment, useDeleteComment } from '../../hooks/useComments'
import CommentComposer from './CommentComposer'
import Comment from './Comment'
import { getErrorMessage } from '../../utils/helpers'

function countAll(comments = []) {
  return comments.reduce((sum, c) => sum + 1 + countAll(c.replies), 0)
}

export default function CommentSection({ videoId, initialCount }) {
  const { data: comments, isLoading } = useComments(videoId)
  const postComment = usePostComment(videoId)
  const voteMutation = useVoteComment(videoId)
  const deleteMutation = useDeleteComment(videoId)

  const handlePost = (content, parentCommentId = null) =>
    postComment.mutateAsync({ content, parentCommentId })

  const handleVote = (commentId, direction) => voteMutation.mutate({ commentId, direction })
  const votingCommentId = voteMutation.isPending ? voteMutation.variables?.commentId : null

  const handleDelete = async (commentId) => {
    try {
      await deleteMutation.mutateAsync(commentId)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not delete comment'))
    }
  }
  const deletingCommentId = deleteMutation.isPending ? deleteMutation.variables : null

  return (
    <div>
      <h2 className="section-title mb-5 flex items-center gap-2">
        <MessageSquare size={18} />
        {isLoading ? `${initialCount ?? ''} Comments` : `${countAll(comments)} Comments`}
      </h2>

      <div className="mb-6">
        <CommentComposer onSubmit={(content) => handlePost(content)} />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="h-16 skeleton rounded-lg" />)}
        </div>
      ) : comments?.length === 0 ? (
        <p className="text-sm text-chalk-500 text-center py-6">No comments yet. Be the first to ask a question.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <Comment
              key={c.id}
              comment={c}
              videoId={videoId}
              onReply={handlePost}
              onVote={handleVote}
              votingCommentId={votingCommentId}
              onDelete={handleDelete}
              deletingCommentId={deletingCommentId}
            />
          ))}
        </div>
      )}
    </div>
  )
}