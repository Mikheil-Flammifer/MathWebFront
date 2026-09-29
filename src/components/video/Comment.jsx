import { useState } from 'react'
import { ArrowBigUp, Reply } from 'lucide-react'
import Avatar from '../common/Avatar'
import CommentComposer from './CommentComposer'
import { getFullName, timeAgo } from '../../utils/helpers'

export default function Comment({ comment, videoId, onReply, onUpvote, depth = 0 }) {
  const [replying, setReplying] = useState(false)

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

          <div className="flex items-center gap-4 mt-1.5">
            <button
              onClick={() => onUpvote(comment.id)}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                comment.hasUpvoted ? 'text-plasma-300' : 'text-chalk-500 hover:text-chalk-200'
              }`}
            >
              <ArrowBigUp size={15} fill={comment.hasUpvoted ? 'currentColor' : 'none'} />
              {comment.upvoteCount > 0 ? comment.upvoteCount : ''}
            </button>
            {depth < 5 && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="flex items-center gap-1 text-xs font-medium text-chalk-500 hover:text-chalk-200"
              >
                <Reply size={13} /> Reply
              </button>
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
            <Comment key={reply.id} comment={reply} videoId={videoId} onReply={onReply} onUpvote={onUpvote} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}