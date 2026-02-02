using System.Text.Json.Serialization;

namespace EmailCode.Core.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AccountProvider
{
    Gmail,
    Outlook,
    Imap
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FolderType
{
    Inbox,
    Sent,
    Drafts,
    Trash,
    Spam,
    Archive,
    Custom
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum HealthStatus
{
    Good,
    Reauth,
    Failing
}

public sealed record Account(
    string Id,
    string Email,
    string Name,
    AccountProvider Provider,
    string Color,
    IReadOnlyList<Folder> Folders,
    bool? NeedsReauth = null,
    bool? IsPinned = null,
    bool? IsInFavorites = null,
    bool? IsSnoozed = null,
    DateTimeOffset? SnoozeUntil = null,
    HealthStatus? HealthStatus = null
);

public sealed record Folder(
    string Id,
    string AccountId,
    string Name,
    string Path,
    FolderType Type,
    int UnreadCount,
    IReadOnlyList<string> ThreadIds
);

public sealed record Thread(
    string Id,
    string Subject,
    IReadOnlyList<Participant> Participants,
    IReadOnlyList<string> MessageIds,
    IReadOnlyList<string> FolderIds,
    IReadOnlyList<string> Labels,
    bool IsRead,
    bool IsStarred,
    DateTimeOffset LastActivity,
    string Snippet
);

public sealed record Message(
    string Id,
    string ThreadId,
    Participant From,
    IReadOnlyList<Participant> To,
    string Subject,
    string Body,
    DateTimeOffset Date,
    bool IsRead,
    IReadOnlyList<Attachment> Attachments,
    IReadOnlyList<Participant>? Cc = null,
    IReadOnlyList<Participant>? Bcc = null,
    string? BodyHtml = null,
    string? InReplyTo = null
);

public sealed record Participant(string Name, string Email);

public sealed record Attachment(
    string Id,
    string Filename,
    string MimeType,
    long Size,
    string? Url = null
);

public sealed record SearchFilters(
    string Query,
    string? AccountId = null,
    string? FolderId = null,
    bool? IsUnread = null,
    bool? HasAttachment = null,
    string? From = null,
    string? To = null
);

public sealed record SyncStatus(
    string AccountId,
    bool IsSyncing,
    DateTimeOffset? LastSyncTime = null,
    string? Error = null
);

public sealed record EmailSnapshot(
    IReadOnlyList<Account> Accounts,
    IReadOnlyList<Folder> Folders,
    IReadOnlyList<Thread> Threads,
    IReadOnlyList<Message> Messages,
    IReadOnlyList<SyncStatus> SyncStatuses
);
