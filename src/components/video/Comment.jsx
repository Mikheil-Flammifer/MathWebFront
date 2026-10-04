import { useState } from 'react'
import { ArrowBigUp, ArrowBigDown, Reply, Trash2, Ban } from 'lucide-react'
import Avatar from '../common/Avatar'
import CommentComposer from './CommentComposer'
import useAuthStore from '../../store/authStore'
import { getFullName, timeAgo } from '../../utils/helpers'

export default function Comment({ comment, videoId, onReply, onVote, votingCommentId, onDelete, deletingCommentId, depth = 0 }) {
  const [replying, setReplying] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const isOwner = user?.id === comment.author?.id
  const canDelete = !comment.deleted && (isOwner || isAdmin)
  const pending = votingCommentId === comment.id
  const deleting = deletingCommentId === comment.id

  // Soft-deleted: hide author + content, keep replies intact, no actions available
  if (comment.deleted) {
    return (
      <div>
        <div className="flex gap-3 opacity-60">
          <span className="w-8 h-8 rounded-full bg-space-600 grid place-items-center text-chalk-600 shrink-0">
            <Ban size={14} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-chalk-600 italic">[deleted]</span>
              <span className="text-xs text-chalk-600">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-chalk-600 italic mt-0.5">This comment has been removed.</p>
          </div>
        </div>

        {comment.replies?.length > 0 && (
          <div className="comment-rail">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                videoId={videoId}
                onReply={onReply}
                onVote={onVote}
                votingCommentId={votingCommentId}
                onDelete={onDelete}
                deletingCommentId={deletingCommentId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-3">
        <Avatar user={comment.author} className="w-8 h-8 text-xs shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-chalk-100">{getFullName(comment.author)}</span>
            <span className="text-xs text-chalk-500">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-chalk-300 mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>

          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onVote(comment.id, 'up')}
                disabled={pending}
                aria-label="Upvote"
                className={`p-0.5 rounded transition-colors disabled:opacity-40 ${
                  comment.myVote === 1 ? 'text-plasma-300' : 'text-chalk-500 hover:text-chalk-200'
                }`}
              >
                <ArrowBigUp size={16} fill={comment.myVote === 1 ? 'currentColor' : 'none'} />
              </button>
              <span className="text-xs font-mono font-medium text-chalk-300 min-w-[1.2em] text-center">
                {comment.score ?? 0}
              </span>
              <button
                onClick={() => onVote(comment.id, 'down')}
                disabled={pending}
                aria-label="Downvote"
                className={`p-0.5 rounded transition-colors disabled:opacity-40 ${
                  comment.myVote === -1 ? 'text-red-400' : 'text-chalk-500 hover:text-chalk-200'
                }`}
              >
                <ArrowBigDown size={16} fill={comment.myVote === -1 ? 'currentColor' : 'none'} />
              </button>
            </div>

            {depth < 5 && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="flex items-center gap-1 text-xs font-medium text-chalk-500 hover:text-chalk-200"
              >
                <Reply size={13} /> Reply
              </button>
            )}

            {canDelete && !confirmingDelete && (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-1 text-xs font-medium text-chalk-500 hover:text-red-400"
              >
                <Trash2 size={13} /> Delete
              </button>
            )}

            {confirmingDelete && (
              <span className="flex items-center gap-2 text-xs">
                <span className="text-chalk-400">Delete this comment?</span>
                <button
                  onClick={() => onDelete(comment.id)}
                  disabled={deleting}
                  className="font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Yes'}
                </button>
                <button onClick={() => setConfirmingDelete(false)} disabled={deleting} className="text-chalk-500 hover:text-chalk-200">
                  Cancel
                </button>
              </span>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <CommentComposer
                placeholder={`Reply to ${comment.author?.firstName || 'this comment'}...`}
                autoFocus
                onCancel={() => setReplying(false)}
                onSubmit={(content) => onReply(content, comment.id)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="comment-rail">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              videoId={videoId}
              onReply={onReply}
              onVote={onVote}
              votingCommentId={votingCommentId}
              onDelete={onDelete}
              deletingCommentId={deletingCommentId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}