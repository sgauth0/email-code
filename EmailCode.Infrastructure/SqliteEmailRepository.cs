using System.Text.Json;
using EmailCode.Core.Models;
using EmailCode.Core.Services;
using Microsoft.Data.Sqlite;

namespace EmailCode.Infrastructure;

public sealed class SqliteEmailRepository : IEmailRepository
{
    private readonly string _connectionString;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    public SqliteEmailRepository(string databasePath)
    {
        _connectionString = new SqliteConnectionStringBuilder { DataSource = databasePath }.ToString();
        Initialize();
    }

    public Task<EmailSnapshot?> LoadSnapshotAsync(CancellationToken cancellationToken = default)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var accounts = new List<Account>();
        var folders = new List<Folder>();
        var threads = new List<Thread>();
        var messages = new List<Message>();
        var syncStatuses = new List<SyncStatus>();

        using (var command = connection.CreateCommand())
        {
            command.CommandText = "SELECT Id, Email, Name, Provider, Color, NeedsReauth, IsPinned, IsInFavorites, IsSnoozed, SnoozeUntil, HealthStatus FROM Accounts";
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                accounts.Add(new Account(
                    Id: reader.GetString(0),
                    Email: reader.GetString(1),
                    Name: reader.GetString(2),
                    Provider: Enum.Parse<AccountProvider>(reader.GetString(3), true),
                    Color: reader.GetString(4),
                    Folders: Array.Empty<Folder>(),
                    NeedsReauth: reader.IsDBNull(5) ? null : reader.GetBoolean(5),
                    IsPinned: reader.IsDBNull(6) ? null : reader.GetBoolean(6),
                    IsInFavorites: reader.IsDBNull(7) ? null : reader.GetBoolean(7),
                    IsSnoozed: reader.IsDBNull(8) ? null : reader.GetBoolean(8),
                    SnoozeUntil: reader.IsDBNull(9) ? null : DateTimeOffset.Parse(reader.GetString(9)),
                    HealthStatus: reader.IsDBNull(10) ? null : Enum.Parse<HealthStatus>(reader.GetString(10), true)
                ));
            }
        }

        using (var command = connection.CreateCommand())
        {
            command.CommandText = "SELECT Id, AccountId, Name, Path, Type, UnreadCount, ThreadIds FROM Folders";
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var threadIds = JsonSerializer.Deserialize<List<string>>(reader.GetString(6), _jsonOptions) ?? new List<string>();
                folders.Add(new Folder(
                    reader.GetString(0),
                    reader.GetString(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    Enum.Parse<FolderType>(reader.GetString(4), true),
                    reader.GetInt32(5),
                    threadIds
                ));
            }
        }

        using (var command = connection.CreateCommand())
        {
            command.CommandText = "SELECT Id, Subject, Participants, MessageIds, FolderIds, Labels, IsRead, IsStarred, LastActivity, Snippet FROM Threads";
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var participants = JsonSerializer.Deserialize<List<Participant>>(reader.GetString(2), _jsonOptions) ?? new List<Participant>();
                var messageIds = JsonSerializer.Deserialize<List<string>>(reader.GetString(3), _jsonOptions) ?? new List<string>();
                var folderIds = JsonSerializer.Deserialize<List<string>>(reader.GetString(4), _jsonOptions) ?? new List<string>();
                var labels = JsonSerializer.Deserialize<List<string>>(reader.GetString(5), _jsonOptions) ?? new List<string>();

                threads.Add(new Thread(
                    reader.GetString(0),
                    reader.GetString(1),
                    participants,
                    messageIds,
                    folderIds,
                    labels,
                    reader.GetBoolean(6),
                    reader.GetBoolean(7),
                    DateTimeOffset.Parse(reader.GetString(8)),
                    reader.GetString(9)
                ));
            }
        }

        using (var command = connection.CreateCommand())
        {
            command.CommandText = "SELECT Id, ThreadId, FromParticipant, ToParticipants, CcParticipants, BccParticipants, Subject, Body, BodyHtml, Date, IsRead, Attachments, InReplyTo FROM Messages";
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                var from = JsonSerializer.Deserialize<Participant>(reader.GetString(2), _jsonOptions) ?? new Participant("", "");
                var to = JsonSerializer.Deserialize<List<Participant>>(reader.GetString(3), _jsonOptions) ?? new List<Participant>();
                var cc = reader.IsDBNull(4) ? null : JsonSerializer.Deserialize<List<Participant>>(reader.GetString(4), _jsonOptions);
                var bcc = reader.IsDBNull(5) ? null : JsonSerializer.Deserialize<List<Participant>>(reader.GetString(5), _jsonOptions);
                var attachments = JsonSerializer.Deserialize<List<Attachment>>(reader.GetString(11), _jsonOptions) ?? new List<Attachment>();

                messages.Add(new Message(
                    Id: reader.GetString(0),
                    ThreadId: reader.GetString(1),
                    From: from,
                    To: to,
                    Subject: reader.GetString(6),
                    Body: reader.GetString(7),
                    Date: DateTimeOffset.Parse(reader.GetString(9)),
                    IsRead: reader.GetBoolean(10),
                    Attachments: attachments,
                    Cc: cc,
                    Bcc: bcc,
                    BodyHtml: reader.IsDBNull(8) ? null : reader.GetString(8),
                    InReplyTo: reader.IsDBNull(12) ? null : reader.GetString(12)
                ));
            }
        }

        using (var command = connection.CreateCommand())
        {
            command.CommandText = "SELECT AccountId, IsSyncing, LastSyncTime, Error FROM SyncStatuses";
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                syncStatuses.Add(new SyncStatus(
                    reader.GetString(0),
                    reader.GetBoolean(1),
                    reader.IsDBNull(2) ? null : DateTimeOffset.Parse(reader.GetString(2)),
                    reader.IsDBNull(3) ? null : reader.GetString(3)
                ));
            }
        }

        if (accounts.Count == 0 && folders.Count == 0 && threads.Count == 0 && messages.Count == 0)
        {
            return Task.FromResult<EmailSnapshot?>(null);
        }

        var accountMap = accounts.ToDictionary(a => a.Id, a => a);
        foreach (var folder in folders)
        {
            if (accountMap.TryGetValue(folder.AccountId, out var account))
            {
                var updatedFolders = account.Folders.ToList();
                updatedFolders.Add(folder);
                accountMap[account.Id] = account with { Folders = updatedFolders };
            }
        }

        var finalAccounts = accountMap.Values.ToList();
        return Task.FromResult<EmailSnapshot?>(new EmailSnapshot(finalAccounts, folders, threads, messages, syncStatuses));
    }

    public Task SaveSnapshotAsync(EmailSnapshot snapshot, CancellationToken cancellationToken = default)
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        using var transaction = connection.BeginTransaction();

        ExecuteNonQuery(connection, "DELETE FROM Accounts");
        ExecuteNonQuery(connection, "DELETE FROM Folders");
        ExecuteNonQuery(connection, "DELETE FROM Threads");
        ExecuteNonQuery(connection, "DELETE FROM Messages");
        ExecuteNonQuery(connection, "DELETE FROM SyncStatuses");

        foreach (var account in snapshot.Accounts)
        {
            using var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Accounts (Id, Email, Name, Provider, Color, NeedsReauth, IsPinned, IsInFavorites, IsSnoozed, SnoozeUntil, HealthStatus)
                                    VALUES ($id, $email, $name, $provider, $color, $needsReauth, $isPinned, $isInFavorites, $isSnoozed, $snoozeUntil, $healthStatus)";
            command.Parameters.AddWithValue("$id", account.Id);
            command.Parameters.AddWithValue("$email", account.Email);
            command.Parameters.AddWithValue("$name", account.Name);
            command.Parameters.AddWithValue("$provider", account.Provider.ToString());
            command.Parameters.AddWithValue("$color", account.Color);
            command.Parameters.AddWithValue("$needsReauth", account.NeedsReauth.HasValue ? account.NeedsReauth.Value : (object?)DBNull.Value ?? DBNull.Value);
            command.Parameters.AddWithValue("$isPinned", account.IsPinned.HasValue ? account.IsPinned.Value : (object?)DBNull.Value ?? DBNull.Value);
            command.Parameters.AddWithValue("$isInFavorites", account.IsInFavorites.HasValue ? account.IsInFavorites.Value : (object?)DBNull.Value ?? DBNull.Value);
            command.Parameters.AddWithValue("$isSnoozed", account.IsSnoozed.HasValue ? account.IsSnoozed.Value : (object?)DBNull.Value ?? DBNull.Value);
            command.Parameters.AddWithValue("$snoozeUntil", account.SnoozeUntil.HasValue ? account.SnoozeUntil.Value.ToString("O") : (object?)DBNull.Value ?? DBNull.Value);
            command.Parameters.AddWithValue("$healthStatus", account.HealthStatus.HasValue ? account.HealthStatus.Value.ToString() : (object?)DBNull.Value ?? DBNull.Value);
            command.ExecuteNonQuery();
        }

        foreach (var folder in snapshot.Folders)
        {
            using var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Folders (Id, AccountId, Name, Path, Type, UnreadCount, ThreadIds)
                                    VALUES ($id, $accountId, $name, $path, $type, $unreadCount, $threadIds)";
            command.Parameters.AddWithValue("$id", folder.Id);
            command.Parameters.AddWithValue("$accountId", folder.AccountId);
            command.Parameters.AddWithValue("$name", folder.Name);
            command.Parameters.AddWithValue("$path", folder.Path);
            command.Parameters.AddWithValue("$type", folder.Type.ToString());
            command.Parameters.AddWithValue("$unreadCount", folder.UnreadCount);
            command.Parameters.AddWithValue("$threadIds", JsonSerializer.Serialize(folder.ThreadIds, _jsonOptions));
            command.ExecuteNonQuery();
        }

        foreach (var thread in snapshot.Threads)
        {
            using var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Threads (Id, Subject, Participants, MessageIds, FolderIds, Labels, IsRead, IsStarred, LastActivity, Snippet)
                                    VALUES ($id, $subject, $participants, $messageIds, $folderIds, $labels, $isRead, $isStarred, $lastActivity, $snippet)";
            command.Parameters.AddWithValue("$id", thread.Id);
            command.Parameters.AddWithValue("$subject", thread.Subject);
            command.Parameters.AddWithValue("$participants", JsonSerializer.Serialize(thread.Participants, _jsonOptions));
            command.Parameters.AddWithValue("$messageIds", JsonSerializer.Serialize(thread.MessageIds, _jsonOptions));
            command.Parameters.AddWithValue("$folderIds", JsonSerializer.Serialize(thread.FolderIds, _jsonOptions));
            command.Parameters.AddWithValue("$labels", JsonSerializer.Serialize(thread.Labels, _jsonOptions));
            command.Parameters.AddWithValue("$isRead", thread.IsRead);
            command.Parameters.AddWithValue("$isStarred", thread.IsStarred);
            command.Parameters.AddWithValue("$lastActivity", thread.LastActivity.ToString("O"));
            command.Parameters.AddWithValue("$snippet", thread.Snippet);
            command.ExecuteNonQuery();
        }

        foreach (var message in snapshot.Messages)
        {
            using var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO Messages (Id, ThreadId, FromParticipant, ToParticipants, CcParticipants, BccParticipants, Subject, Body, BodyHtml, Date, IsRead, Attachments, InReplyTo)
                                    VALUES ($id, $threadId, $fromParticipant, $toParticipants, $ccParticipants, $bccParticipants, $subject, $body, $bodyHtml, $date, $isRead, $attachments, $inReplyTo)";
            command.Parameters.AddWithValue("$id", message.Id);
            command.Parameters.AddWithValue("$threadId", message.ThreadId);
            command.Parameters.AddWithValue("$fromParticipant", JsonSerializer.Serialize(message.From, _jsonOptions));
            command.Parameters.AddWithValue("$toParticipants", JsonSerializer.Serialize(message.To, _jsonOptions));
            command.Parameters.AddWithValue("$ccParticipants", message.Cc is null ? (object?)DBNull.Value ?? DBNull.Value : JsonSerializer.Serialize(message.Cc, _jsonOptions));
            command.Parameters.AddWithValue("$bccParticipants", message.Bcc is null ? (object?)DBNull.Value ?? DBNull.Value : JsonSerializer.Serialize(message.Bcc, _jsonOptions));
            command.Parameters.AddWithValue("$subject", message.Subject);
            command.Parameters.AddWithValue("$body", message.Body);
            command.Parameters.AddWithValue("$bodyHtml", message.BodyHtml is null ? (object?)DBNull.Value ?? DBNull.Value : message.BodyHtml);
            command.Parameters.AddWithValue("$date", message.Date.ToString("O"));
            command.Parameters.AddWithValue("$isRead", message.IsRead);
            command.Parameters.AddWithValue("$attachments", JsonSerializer.Serialize(message.Attachments, _jsonOptions));
            command.Parameters.AddWithValue("$inReplyTo", message.InReplyTo is null ? (object?)DBNull.Value ?? DBNull.Value : message.InReplyTo);
            command.ExecuteNonQuery();
        }

        foreach (var status in snapshot.SyncStatuses)
        {
            using var command = connection.CreateCommand();
            command.CommandText = @"INSERT INTO SyncStatuses (AccountId, IsSyncing, LastSyncTime, Error)
                                    VALUES ($accountId, $isSyncing, $lastSyncTime, $error)";
            command.Parameters.AddWithValue("$accountId", status.AccountId);
            command.Parameters.AddWithValue("$isSyncing", status.IsSyncing);
            command.Parameters.AddWithValue("$lastSyncTime", status.LastSyncTime.HasValue ? status.LastSyncTime.Value.ToString("O") : (object?)DBNull.Value ?? DBNull.Value);
            command.Parameters.AddWithValue("$error", status.Error is null ? (object?)DBNull.Value ?? DBNull.Value : status.Error);
            command.ExecuteNonQuery();
        }

        transaction.Commit();
        return Task.CompletedTask;
    }

    private void Initialize()
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        ExecuteNonQuery(connection, @"CREATE TABLE IF NOT EXISTS Accounts (
            Id TEXT PRIMARY KEY,
            Email TEXT NOT NULL,
            Name TEXT NOT NULL,
            Provider TEXT NOT NULL,
            Color TEXT NOT NULL,
            NeedsReauth INTEGER NULL,
            IsPinned INTEGER NULL,
            IsInFavorites INTEGER NULL,
            IsSnoozed INTEGER NULL,
            SnoozeUntil TEXT NULL,
            HealthStatus TEXT NULL
        )");

        ExecuteNonQuery(connection, @"CREATE TABLE IF NOT EXISTS Folders (
            Id TEXT PRIMARY KEY,
            AccountId TEXT NOT NULL,
            Name TEXT NOT NULL,
            Path TEXT NOT NULL,
            Type TEXT NOT NULL,
            UnreadCount INTEGER NOT NULL,
            ThreadIds TEXT NOT NULL
        )");

        ExecuteNonQuery(connection, @"CREATE TABLE IF NOT EXISTS Threads (
            Id TEXT PRIMARY KEY,
            Subject TEXT NOT NULL,
            Participants TEXT NOT NULL,
            MessageIds TEXT NOT NULL,
            FolderIds TEXT NOT NULL,
            Labels TEXT NOT NULL,
            IsRead INTEGER NOT NULL,
            IsStarred INTEGER NOT NULL,
            LastActivity TEXT NOT NULL,
            Snippet TEXT NOT NULL
        )");

        ExecuteNonQuery(connection, @"CREATE TABLE IF NOT EXISTS Messages (
            Id TEXT PRIMARY KEY,
            ThreadId TEXT NOT NULL,
            FromParticipant TEXT NOT NULL,
            ToParticipants TEXT NOT NULL,
            CcParticipants TEXT NULL,
            BccParticipants TEXT NULL,
            Subject TEXT NOT NULL,
            Body TEXT NOT NULL,
            BodyHtml TEXT NULL,
            Date TEXT NOT NULL,
            IsRead INTEGER NOT NULL,
            Attachments TEXT NOT NULL,
            InReplyTo TEXT NULL
        )");

        ExecuteNonQuery(connection, @"CREATE TABLE IF NOT EXISTS SyncStatuses (
            AccountId TEXT PRIMARY KEY,
            IsSyncing INTEGER NOT NULL,
            LastSyncTime TEXT NULL,
            Error TEXT NULL
        )");

        ExecuteNonQuery(connection, "CREATE INDEX IF NOT EXISTS IX_Folders_AccountId ON Folders(AccountId)");
        ExecuteNonQuery(connection, "CREATE INDEX IF NOT EXISTS IX_Threads_LastActivity ON Threads(LastActivity)");
        ExecuteNonQuery(connection, "CREATE INDEX IF NOT EXISTS IX_Messages_ThreadId ON Messages(ThreadId)");
    }

    private static void ExecuteNonQuery(SqliteConnection connection, string commandText)
    {
        using var command = connection.CreateCommand();
        command.CommandText = commandText;
        command.ExecuteNonQuery();
    }
}
