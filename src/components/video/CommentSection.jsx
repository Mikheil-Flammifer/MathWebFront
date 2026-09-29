import { MessageSquare } from 'lucide-react'
import { useComments, usePostComment, useUpvoteComment } from '../../hooks/useComments'
import CommentComposer from './CommentComposer'
import Comment from './Comment'

function countAll(comments = []) {
  return comments.reduce((sum, c) => sum + 1 + countAll(c.replies), 0)
}

export default function CommentSection({ videoId }) {
  const { data: comments, isLoading } = useComments(videoId)
  const postComment = usePostComment(videoId)
  const upvote = useUpvoteComment(videoId)

  const handlePost = (content, parentCommentId = null) =>
    postComment.mutateAsync({ content, parentCommentId })

  const handleUpvote = (commentId) => upvote.mutate(commentId)

  return (
    <div>
      <h2 className="section-title mb-5 flex items-center gap-2">
        <MessageSquare size={18} />
        {isLoading ? 'Comments' : `${countAll(comments)} Comments`}
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
            <Comment key={c.id} comment={c} videoId={videoId} onReply={handlePost} onUpvote={handleUpvote} />
          ))}
        </div>
      )}
    </div>
  )
}