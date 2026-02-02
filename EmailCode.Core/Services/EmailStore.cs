using EmailCode.Core.Models;

namespace EmailCode.Core.Services;

public sealed class EmailStore
{
    private readonly IEmailRepository _repository;
    private readonly List<Account> _accounts = new();
    private readonly List<Folder> _folders = new();
    private readonly List<Thread> _threads = new();
    private readonly List<Message> _messages = new();
    private readonly Dictionary<string, SyncStatus> _syncStatuses = new();

    public EmailStore(IEmailRepository repository)
    {
        _repository = repository;
    }

    public async Task InitializeAsync(EmailSnapshot? seedSnapshot = null, CancellationToken cancellationToken = default)
    {
        var snapshot = await _repository.LoadSnapshotAsync(cancellationToken);
        if (snapshot is null || snapshot.Accounts.Count == 0)
        {
            if (seedSnapshot is null)
            {
                seedSnapshot = new EmailSnapshot(
                    Array.Empty<Account>(),
                    Array.Empty<Folder>(),
                    Array.Empty<Thread>(),
                    Array.Empty<Message>(),
                    Array.Empty<SyncStatus>());
            }

            await _repository.SaveSnapshotAsync(seedSnapshot, cancellationToken);
            snapshot = seedSnapshot;
        }

        LoadSnapshot(snapshot);
    }

    public void LoadSnapshot(EmailSnapshot snapshot)
    {
        _accounts.Clear();
        _accounts.AddRange(snapshot.Accounts);
        _folders.Clear();
        _folders.AddRange(snapshot.Folders);
        _threads.Clear();
        _threads.AddRange(snapshot.Threads);
        _messages.Clear();
        _messages.AddRange(snapshot.Messages);
        _syncStatuses.Clear();
        foreach (var status in snapshot.SyncStatuses)
        {
            _syncStatuses[status.AccountId] = status;
        }
    }

    public Task<IReadOnlyList<Account>> GetAccountsAsync() => Task.FromResult<IReadOnlyList<Account>>(_accounts.ToList());

    public Task<Account?> GetAccountAsync(string accountId)
        => Task.FromResult(_accounts.FirstOrDefault(a => a.Id == accountId));

    public async Task UpdateAccountReauthStatusAsync(string accountId, bool needsReauth, CancellationToken cancellationToken = default)
    {
        var index = _accounts.FindIndex(a => a.Id == accountId);
        if (index >= 0)
        {
            var account = _accounts[index];
            _accounts[index] = account with { NeedsReauth = needsReauth };
            await PersistAsync(cancellationToken);
        }
    }

    public Task<IReadOnlyList<Folder>> GetFoldersAsync(string accountId)
        => Task.FromResult<IReadOnlyList<Folder>>(_folders.Where(f => f.AccountId == accountId).ToList());

    public Task<Folder?> GetFolderAsync(string folderId)
        => Task.FromResult(_folders.FirstOrDefault(f => f.Id == folderId));

    public Task<Folder?> GetFolderByPathAsync(string accountId, string path)
        => Task.FromResult(_folders.FirstOrDefault(f => f.AccountId == accountId && f.Path == path));

    public Task<IReadOnlyList<Thread>> ListThreadsAsync(string? folderId = null, string? accountId = null)
    {
        IEnumerable<Thread> filtered = _threads;

        if (!string.IsNullOrWhiteSpace(folderId))
        {
            filtered = filtered.Where(t => t.FolderIds.Contains(folderId));
        }
        else if (!string.IsNullOrWhiteSpace(accountId))
        {
            var accountFolderIds = _folders.Where(f => f.AccountId == accountId).Select(f => f.Id).ToHashSet();
            filtered = filtered.Where(t => t.FolderIds.Any(fid => accountFolderIds.Contains(fid)));
        }

        var result = filtered.OrderByDescending(t => t.LastActivity).ToList();
        return Task.FromResult<IReadOnlyList<Thread>>(result);
    }

    public Task<IReadOnlyList<Thread>> GetUnifiedInboxAsync()
    {
        var inboxFolderIds = _folders.Where(f => f.Type == FolderType.Inbox).Select(f => f.Id).ToHashSet();
        var inboxThreads = _threads.Where(t => t.FolderIds.Any(fid => inboxFolderIds.Contains(fid)));
        var uniqueThreads = inboxThreads.GroupBy(t => t.Id).Select(g => g.First());
        var result = uniqueThreads.OrderByDescending(t => t.LastActivity).ToList();
        return Task.FromResult<IReadOnlyList<Thread>>(result);
    }

    public Task<Thread?> GetThreadAsync(string threadId)
        => Task.FromResult(_threads.FirstOrDefault(t => t.Id == threadId));

    public Task<IReadOnlyList<Message>> GetThreadMessagesAsync(string threadId)
    {
        var result = _messages.Where(m => m.ThreadId == threadId).OrderBy(m => m.Date).ToList();
        return Task.FromResult<IReadOnlyList<Message>>(result);
    }

    public async Task MarkThreadReadAsync(string threadId, bool isRead, CancellationToken cancellationToken = default)
    {
        var threadIndex = _threads.FindIndex(t => t.Id == threadId);
        if (threadIndex < 0)
        {
            return;
        }

        var thread = _threads[threadIndex];
        _threads[threadIndex] = thread with { IsRead = isRead };

        for (var i = 0; i < _messages.Count; i++)
        {
            if (_messages[i].ThreadId == threadId)
            {
                _messages[i] = _messages[i] with { IsRead = isRead };
            }
        }

        UpdateFolderUnreadCounts(thread.FolderIds);
        await PersistAsync(cancellationToken);
    }

    public async Task ToggleThreadStarAsync(string threadId, CancellationToken cancellationToken = default)
    {
        var index = _threads.FindIndex(t => t.Id == threadId);
        if (index >= 0)
        {
            var thread = _threads[index];
            _threads[index] = thread with { IsStarred = !thread.IsStarred };
            await PersistAsync(cancellationToken);
        }
    }

    public async Task ArchiveThreadAsync(string threadId, CancellationToken cancellationToken = default)
    {
        var index = _threads.FindIndex(t => t.Id == threadId);
        if (index < 0)
        {
            return;
        }

        var thread = _threads[index];
        var inboxFolderIds = thread.FolderIds.Where(fid => _folders.FirstOrDefault(f => f.Id == fid)?.Type == FolderType.Inbox).ToList();
        var archiveFolders = _folders.Where(f => f.Type == FolderType.Archive && inboxFolderIds.Any(ifid => _folders.FirstOrDefault(inf => inf.Id == ifid)?.AccountId == f.AccountId)).ToList();

        var updatedFolderIds = thread.FolderIds.Where(fid => !inboxFolderIds.Contains(fid)).ToList();
        foreach (var archiveFolder in archiveFolders)
        {
            if (!updatedFolderIds.Contains(archiveFolder.Id))
            {
                updatedFolderIds.Add(archiveFolder.Id);
            }
        }

        _threads[index] = thread with { FolderIds = updatedFolderIds };
        UpdateFolderThreadLists();
        await PersistAsync(cancellationToken);
    }

    public async Task MoveThreadToFolderAsync(string threadId, string targetFolderId, CancellationToken cancellationToken = default)
    {
        var threadIndex = _threads.FindIndex(t => t.Id == threadId);
        var targetFolder = _folders.FirstOrDefault(f => f.Id == targetFolderId);
        if (threadIndex < 0 || targetFolder is null)
        {
            return;
        }

        var accountFolderIds = _folders.Where(f => f.AccountId == targetFolder.AccountId).Select(f => f.Id).ToHashSet();
        var thread = _threads[threadIndex];
        var updatedFolderIds = thread.FolderIds.Where(fid => !accountFolderIds.Contains(fid)).ToList();
        updatedFolderIds.Add(targetFolderId);
        _threads[threadIndex] = thread with { FolderIds = updatedFolderIds };

        UpdateFolderThreadLists();
        await PersistAsync(cancellationToken);
    }

    public async Task TrashThreadAsync(string threadId, CancellationToken cancellationToken = default)
    {
        var threadIndex = _threads.FindIndex(t => t.Id == threadId);
        if (threadIndex < 0)
        {
            return;
        }

        var thread = _threads[threadIndex];
        var currentAccountIds = thread.FolderIds
            .Select(fid => _folders.FirstOrDefault(f => f.Id == fid)?.AccountId)
            .Where(id => id is not null)
            .ToHashSet();

        var trashFolders = _folders.Where(f => f.Type == FolderType.Trash && f.AccountId is not null && currentAccountIds.Contains(f.AccountId)).ToList();
        _threads[threadIndex] = thread with { FolderIds = trashFolders.Select(f => f.Id).ToList() };
        UpdateFolderThreadLists();
        await PersistAsync(cancellationToken);
    }

    public async Task MarkAsSpamAsync(string threadId, CancellationToken cancellationToken = default)
    {
        var threadIndex = _threads.FindIndex(t => t.Id == threadId);
        if (threadIndex < 0)
        {
            return;
        }

        var thread = _threads[threadIndex];
        var currentAccountIds = thread.FolderIds
            .Select(fid => _folders.FirstOrDefault(f => f.Id == fid)?.AccountId)
            .Where(id => id is not null)
            .ToHashSet();

        var spamFolders = _folders.Where(f => f.Type == FolderType.Spam && f.AccountId is not null && currentAccountIds.Contains(f.AccountId)).ToList();
        _threads[threadIndex] = thread with { FolderIds = spamFolders.Select(f => f.Id).ToList() };
        UpdateFolderThreadLists();
        await PersistAsync(cancellationToken);
    }

    public async Task ApplyLabelAsync(string threadId, string folderId, CancellationToken cancellationToken = default)
    {
        var threadIndex = _threads.FindIndex(t => t.Id == threadId);
        var folder = _folders.FirstOrDefault(f => f.Id == folderId);
        if (threadIndex < 0 || folder is null)
        {
            return;
        }

        var thread = _threads[threadIndex];
        var updatedFolderIds = thread.FolderIds.ToList();
        if (!updatedFolderIds.Contains(folderId))
        {
            updatedFolderIds.Add(folderId);
        }

        var updatedLabels = thread.Labels.ToList();
        if (!updatedLabels.Contains(folder.Name, StringComparer.OrdinalIgnoreCase))
        {
            updatedLabels.Add(folder.Name);
        }

        _threads[threadIndex] = thread with { FolderIds = updatedFolderIds, Labels = updatedLabels };
        UpdateFolderThreadLists();
        await PersistAsync(cancellationToken);
    }

    public Task<IReadOnlyList<Thread>> SearchThreadsAsync(SearchFilters filters)
    {
        IEnumerable<Thread> results = _threads;

        if (!string.IsNullOrWhiteSpace(filters.AccountId))
        {
            var accountFolderIds = _folders.Where(f => f.AccountId == filters.AccountId).Select(f => f.Id).ToHashSet();
            results = results.Where(t => t.FolderIds.Any(fid => accountFolderIds.Contains(fid)));
        }

        if (!string.IsNullOrWhiteSpace(filters.FolderId))
        {
            results = results.Where(t => t.FolderIds.Contains(filters.FolderId));
        }

        if (filters.IsUnread is not null)
        {
            results = results.Where(t => t.IsRead != filters.IsUnread.Value);
        }

        if (filters.HasAttachment == true)
        {
            results = results.Where(t => _messages.Where(m => m.ThreadId == t.Id).Any(m => m.Attachments.Count > 0));
        }

        if (!string.IsNullOrWhiteSpace(filters.From))
        {
            var fromLower = filters.From.ToLowerInvariant();
            results = results.Where(t => t.Participants.Any(p => p.Email.ToLowerInvariant().Contains(fromLower) || p.Name.ToLowerInvariant().Contains(fromLower)));
        }

        if (!string.IsNullOrWhiteSpace(filters.To))
        {
            var toLower = filters.To.ToLowerInvariant();
            var threadIdsWithTo = _messages
                .Where(m => m.To.Any(p => p.Email.ToLowerInvariant().Contains(toLower) || p.Name.ToLowerInvariant().Contains(toLower)))
                .Select(m => m.ThreadId)
                .ToHashSet();
            results = results.Where(t => threadIdsWithTo.Contains(t.Id));
        }

        if (!string.IsNullOrWhiteSpace(filters.Query))
        {
            var query = filters.Query.ToLowerInvariant();
            results = results.Where(t =>
            {
                var subjectMatch = t.Subject.ToLowerInvariant().Contains(query);
                var snippetMatch = t.Snippet.ToLowerInvariant().Contains(query);
                var bodyMatch = _messages.Where(m => m.ThreadId == t.Id).Any(m => m.Body.ToLowerInvariant().Contains(query));
                return subjectMatch || snippetMatch || bodyMatch;
            });
        }

        var resultList = results.OrderByDescending(t => t.LastActivity).ToList();
        return Task.FromResult<IReadOnlyList<Thread>>(resultList);
    }

    public Task<SyncStatus?> GetSyncStatusAsync(string accountId)
    {
        _syncStatuses.TryGetValue(accountId, out var status);
        return Task.FromResult(status);
    }

    public Task<IReadOnlyList<SyncStatus>> GetAllSyncStatusesAsync()
        => Task.FromResult<IReadOnlyList<SyncStatus>>(_syncStatuses.Values.ToList());

    public async Task UpdateSyncStatusAsync(SyncStatus status, CancellationToken cancellationToken = default)
    {
        _syncStatuses[status.AccountId] = status;
        await PersistAsync(cancellationToken);
    }

    public async Task AddThreadAsync(Thread thread, CancellationToken cancellationToken = default)
    {
        _threads.Add(thread);
        UpdateFolderThreadLists();
        await PersistAsync(cancellationToken);
    }

    public async Task AddMessageAsync(Message message, CancellationToken cancellationToken = default)
    {
        _messages.Add(message);
        await PersistAsync(cancellationToken);
    }

    private void UpdateFolderThreadLists()
    {
        for (var i = 0; i < _folders.Count; i++)
        {
            var folder = _folders[i];
            var threadIds = _threads.Where(t => t.FolderIds.Contains(folder.Id)).Select(t => t.Id).ToList();
            _folders[i] = folder with { ThreadIds = threadIds };
        }

        UpdateFolderUnreadCounts(_folders.Select(f => f.Id).ToList());
    }

    private void UpdateFolderUnreadCounts(IEnumerable<string> folderIds)
    {
        foreach (var folderId in folderIds)
        {
            var index = _folders.FindIndex(f => f.Id == folderId);
            if (index >= 0)
            {
                var folderThreads = _threads.Where(t => t.FolderIds.Contains(folderId)).ToList();
                var unreadCount = folderThreads.Count(t => !t.IsRead);
                _folders[index] = _folders[index] with { UnreadCount = unreadCount };
            }
        }
    }

    private async Task PersistAsync(CancellationToken cancellationToken)
    {
        var snapshot = new EmailSnapshot(
            _accounts.ToList(),
            _folders.ToList(),
            _threads.ToList(),
            _messages.ToList(),
            _syncStatuses.Values.ToList());
        await _repository.SaveSnapshotAsync(snapshot, cancellationToken);
    }
}
