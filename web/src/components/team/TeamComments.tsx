/**
 * TeamComments Component
 *
 * Comments system with @mentions for team collaboration
 * Cycle 96: Team Collaboration Features
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Person } from '@/components/ontology-ui/types';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  author: Person;
  content: string;
  mentions: string[];
  timestamp: number;
  edited?: boolean;
  replies?: Comment[];
}

interface TeamCommentsProps {
  members: Person[];
  resourceId: string;
  resourceType: string;
}

export function TeamComments({ members, resourceId, resourceType }: TeamCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      author: members[0],
      content: 'Looking great! @Bob Smith can you review the checkout page?',
      mentions: ['2'],
      timestamp: Date.now() - 7200000,
    },
    {
      id: 'c2',
      author: members[1],
      content: '@Alice Johnson Just reviewed it - looks perfect! Should we add urgency banners?',
      mentions: ['1'],
      timestamp: Date.now() - 3600000,
      replies: [
        {
          id: 'c2r1',
          author: members[0],
          content: 'Yes! Great idea. @Carol White can you design the banners?',
          mentions: ['3'],
          timestamp: Date.now() - 1800000,
        },
      ],
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter members based on mention query
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Handle @ mention trigger
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;

    setNewComment(value);
    setCursorPosition(position);

    // Check if @ was typed
    const beforeCursor = value.substring(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const afterAt = beforeCursor.substring(lastAtIndex + 1);
      // Only show mentions if @ is at start of word
      if (!afterAt.includes(' ')) {
        setMentionQuery(afterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Insert mention
  const insertMention = (member: Person) => {
    const beforeCursor = newComment.substring(0, cursorPosition);
    const afterCursor = newComment.substring(cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    const before = newComment.substring(0, lastAtIndex);
    const mention = `@${member.name} `;
    const after = afterCursor;

    setNewComment(before + mention + after);
    setShowMentions(false);
    setMentionQuery('');

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPosition = (before + mention).length;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Post comment
  const handlePostComment = () => {
    if (!newComment.trim()) return;

    // Extract mentions
    const mentionRegex = /@(\w+\s?\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(newComment)) !== null) {
      const mentionedName = match[1];
      const member = members.find(m => m.name === mentionedName);
      if (member) {
        mentions.push(member._id);
      }
    }

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: members[0], // Current user
      content: newComment,
      mentions,
      timestamp: Date.now(),
    };

    setComments([...comments, comment]);
    setNewComment('');

    // TODO: Save to backend via Convex mutation
    console.log('Posting comment:', comment);
  };

  // Render comment content with highlighted mentions
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@\w+\s?\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionedName = part.substring(1);
        return (
          <span
            key={index}
            className="text-primary font-medium bg-primary/10 px-1 rounded"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      {/* New Comment Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Comment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Write a comment... Use @ to mention team members"
              value={newComment}
              onChange={handleTextChange}
              rows={3}
              className="resize-none"
            />

            {/* Mention Dropdown */}
            {showMentions && filteredMembers.length > 0 && (
              <Card className="absolute z-10 w-64 mt-1 shadow-lg">
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {filteredMembers.map(member => (
                      <button
                        key={member._id}
                        onClick={() => insertMention(member)}
                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Tip: Type @ to mention team members
            </p>
            <Button onClick={handlePostComment} disabled={!newComment.trim()}>
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id}>
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {comment.author.role.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                      </span>
                      {comment.edited && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                    </div>

                    <div className="text-sm leading-relaxed">
                      {renderCommentContent(comment.content)}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 mt-3 space-y-3 border-l-2 border-muted pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                              <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{reply.author.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(reply.timestamp, { addSuffix: true })}
                                </span>
                              </div>

                              <div className="text-sm leading-relaxed">
                                {renderCommentContent(reply.content)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="mt-4" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
