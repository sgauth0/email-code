using EmailCode.Core.Models;

namespace EmailCode.Core.Services;

public sealed class SyncSimulator : IDisposable
{
    private readonly EmailStore _store;
    private readonly Random _random;
    private readonly Func<TimeSpan, CancellationToken, Task> _delay;
    private Timer? _timer;

    private static readonly Participant[] MockSenders =
    {
        new("David Lee", "david@techcompany.com"),
        new("Sofia Martinez", "sofia.m@agency.co"),
        new("Zoom", "no-reply@zoom.us"),
        new("Amazon", "shipment@amazon.com"),
    };

    private static readonly string[] SubjectTemplates =
    {
        "🎯 Quick question about the project",
        "Meeting confirmed for tomorrow",
        "Your package has been delivered",
        "Action required: Please review",
        "🎉 You have been invited!",
        "Weekly team sync notes",
        "FYI: System maintenance tonight",
    };

    private static readonly string[] BodyTemplates =
    {
        "Just wanted to follow up on our previous conversation. Let me know if you have any questions!",
        "Your meeting has been confirmed for tomorrow at 2pm. Looking forward to it!",
        "Your package has been delivered to your front door. Track your order for more details.",
        "Please review the attached document and provide your feedback by end of week.",
        "You have been invited to join our upcoming event. Please RSVP to confirm your attendance.",
        "Here are the notes from the team sync meeting. Action items are highlighted.",
        "Scheduled system maintenance will occur tonight from 11pm to 2am. Service may be briefly interrupted.",
    };

    private int _threadCounter = 1000;
    private int _messageCounter = 1000;

    public SyncSimulator(EmailStore store, Random? random = null, Func<TimeSpan, CancellationToken, Task>? delay = null)
    {
        _store = store;
        _random = random ?? new Random();
        _delay = delay ?? ((span, token) => Task.Delay(span, token));
    }

    public event EventHandler? Updated;

    public void Start(TimeSpan? interval = null)
    {
        Stop();
        var tickInterval = interval ?? TimeSpan.FromSeconds(30);
        _timer = new Timer(_ => _ = SimulateSyncAsync(), null, TimeSpan.Zero, tickInterval);
    }

    public void Stop()
    {
        _timer?.Dispose();
        _timer = null;
    }

    public void Dispose() => Stop();

    public Task RunOnceAsync(CancellationToken cancellationToken = default) => SimulateSyncAsync(cancellationToken);

    private async Task SimulateSyncAsync(CancellationToken cancellationToken = default)
    {
        var accounts = await _store.GetAccountsAsync();

        foreach (var account in accounts)
        {
            await _store.UpdateSyncStatusAsync(new SyncStatus(account.Id, true, DateTimeOffset.UtcNow));

            var delay = TimeSpan.FromMilliseconds(1000 + _random.Next(0, 2000));
            await _delay(delay, cancellationToken);

            var action = _random.NextDouble();
            if (action < 0.1)
            {
                await _store.UpdateAccountReauthStatusAsync(account.Id, true);
                await _store.UpdateSyncStatusAsync(new SyncStatus(account.Id, false, DateTimeOffset.UtcNow, "Authentication required"));
            }
            else if (action < 0.5)
            {
                await AddNewMessageAsync(account.Id);
                await _store.UpdateSyncStatusAsync(new SyncStatus(account.Id, false, DateTimeOffset.UtcNow));
            }
            else
            {
                await _store.UpdateSyncStatusAsync(new SyncStatus(account.Id, false, DateTimeOffset.UtcNow));
            }

            Updated?.Invoke(this, EventArgs.Empty);
        }
    }

    private async Task AddNewMessageAsync(string accountId)
    {
        var folders = await _store.GetFoldersAsync(accountId);
        var inboxFolder = folders.FirstOrDefault(f => f.Type == FolderType.Inbox);
        if (inboxFolder is null)
        {
            return;
        }

        var threadId = $"thread_sim_{_threadCounter++}";
        var messageId = $"msg_sim_{_messageCounter++}";

        var sender = MockSenders[_random.Next(MockSenders.Length)];
        var subject = SubjectTemplates[_random.Next(SubjectTemplates.Length)];
        var body = BodyTemplates[_random.Next(BodyTemplates.Length)];

        var account = (await _store.GetAccountAsync(accountId));
        if (account is null)
        {
            return;
        }

        var message = new Message(
            Id: messageId,
            ThreadId: threadId,
            From: sender,
            To: new[] { new Participant(account.Name, account.Email) },
            Subject: subject,
            Body: body,
            Date: DateTimeOffset.UtcNow,
            IsRead: false,
            Attachments: Array.Empty<Attachment>()
        );

        var thread = new Thread(
            Id: threadId,
            Subject: subject,
            Participants: new[] { sender, new Participant(account.Name, account.Email) },
            MessageIds: new[] { messageId },
            FolderIds: new[] { inboxFolder.Id },
            Labels: Array.Empty<string>(),
            IsRead: false,
            IsStarred: false,
            LastActivity: DateTimeOffset.UtcNow,
            Snippet: body[..Math.Min(body.Length, 80)] + "..."
        );

        await _store.AddThreadAsync(thread);
        await _store.AddMessageAsync(message);
    }
}
