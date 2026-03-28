import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ConversationThread = ({ conversation, onSelect, isActive }) => {
  const formatTimestamp = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <button
      onClick={() => onSelect(conversation?.id)}
      className={`group w-full text-left rounded-2xl border px-3 py-3 transition-gentle ${
        isActive
          ? 'border-primary/40 bg-primary/10 shadow-gentle-sm'
          : 'border-transparent hover:border-border hover:bg-background/90'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="h-12 w-12 rounded-full overflow-hidden ring-1 ring-border">
            <Image
              src={conversation?.avatar}
              alt={conversation?.avatarAlt}
              className="w-full h-full object-cover"
            />
          </div>
          {conversation?.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-success"></div>
          )}
          {conversation?.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1">
              <span className="text-[10px] font-semibold text-primary-foreground">
                {conversation?.unreadCount}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-foreground md:text-[15px]">
              {conversation?.name}
            </h4>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatTimestamp(conversation?.lastMessageTime)}
            </span>
          </div>

          <p
            className={`line-clamp-1 text-sm ${
              conversation?.unreadCount > 0
                ? 'font-medium text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {conversation?.lastMessage}
          </p>

          <div className="mt-2 flex items-center gap-2 text-xs">
            {conversation?.status && conversation?.status !== 'active' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-1 text-warning">
                <Icon name="AlertCircle" size={12} color="currentColor" />
                {conversation?.status}
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                {conversation?.status === 'group' ? 'Group' : 'Direct'}
              </span>
            )}
            {conversation?.isDraft && (
              <span className="rounded-full bg-accent/10 px-2 py-1 text-accent">
                Draft
              </span>
            )}
            <span className="text-muted-foreground">{conversation?.messageCount} msgs</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ConversationThread;
