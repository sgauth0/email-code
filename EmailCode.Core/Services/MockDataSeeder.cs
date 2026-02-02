using EmailCode.Core.Models;

namespace EmailCode.Core.Services;

public static class MockDataSeeder
{
    private static readonly string[] ColorGradients =
    {
        "from-purple-400 to-pink-400",
        "from-blue-400 to-pink-400",
        "from-green-400 to-emerald-400",
        "from-yellow-400 to-orange-400",
        "from-red-400 to-pink-400",
        "from-indigo-400 to-purple-400",
    };

    private static readonly Participant[] MockSenders =
    {
        new("Sarah Chen", "sarah.chen@techcorp.com"),
        new("Marcus Johnson", "marcus@designstudio.io"),
        new("Emma Rodriguez", "emma.r@startup.com"),
        new("James Wilson", "jwilson@marketing.co"),
        new("Priya Patel", "priya@cloudservices.com"),
        new("Alex Kim", "alex.kim@freelance.dev"),
        new("LinkedIn", "notifications@linkedin.com"),
        new("GitHub", "noreply@github.com"),
        new("Slack", "feedback@slack.com"),
        new("Netflix", "info@netflix.com"),
    };

    public static EmailSnapshot Generate()
    {
        var accounts = new List<Account>
        {
            new(
                Id: "acc_1",
                Email: "you@personal.com",
                Name: "Personal Account",
                Provider: AccountProvider.Gmail,
                Color: ColorGradients[0],
                Folders: new List<Folder>(),
                IsPinned: true,
                IsInFavorites: true,
                HealthStatus: HealthStatus.Good
            ),
            new(
                Id: "acc_2",
                Email: "you@work.com",
                Name: "Work Account",
                Provider: AccountProvider.Outlook,
                Color: ColorGradients[1],
                Folders: new List<Folder>(),
                IsPinned: true,
                IsInFavorites: true,
                HealthStatus: HealthStatus.Good
            ),
        };

        var folders = new List<Folder>();

        foreach (var account in accounts.Select((value, index) => new { value, index }))
        {
            var accountFolders = new List<Folder>
            {
                new($"folder_{account.value.Id}_inbox", account.value.Id, "Inbox", "INBOX", FolderType.Inbox, 0, Array.Empty<string>()),
                new($"folder_{account.value.Id}_sent", account.value.Id, "Sent", "SENT", FolderType.Sent, 0, Array.Empty<string>()),
                new($"folder_{account.value.Id}_drafts", account.value.Id, "Drafts", "DRAFTS", FolderType.Drafts, 0, Array.Empty<string>()),
                new($"folder_{account.value.Id}_archive", account.value.Id, "Archive", "ARCHIVE", FolderType.Archive, 0, Array.Empty<string>()),
                new($"folder_{account.value.Id}_spam", account.value.Id, "Spam", "SPAM", FolderType.Spam, 0, Array.Empty<string>()),
                new($"folder_{account.value.Id}_trash", account.value.Id, "Trash", "TRASH", FolderType.Trash, 0, Array.Empty<string>()),
            };

            if (account.index == 1)
            {
                accountFolders.Add(new($"folder_{account.value.Id}_projects", account.value.Id, "Projects", "Projects", FolderType.Custom, 0, Array.Empty<string>()));
                accountFolders.Add(new($"folder_{account.value.Id}_clients", account.value.Id, "Clients", "Clients", FolderType.Custom, 0, Array.Empty<string>()));
            }

            accounts[account.index] = account.value with { Folders = accountFolders };
            folders.AddRange(accountFolders);
        }

        var threads = new List<Thread>();
        var messages = new List<Message>();

        var threadTemplates = new[]
        {
            new
            {
                Subject = "✨ Weekend Coffee Plans",
                Sender = MockSenders[0],
                Snippet = "Hey! Want to try that new cafe downtown this Saturday? I heard they have amazing...",
                Body = "Hey! Want to try that new cafe downtown this Saturday? I heard they have amazing matcha lattes and the vibe is super cozy. Let me know if you are free around 11am! 🍵",
                AccountIds = new[] { "acc_1" },
                IsUnread = true,
                HasAttachment = false,
            },
            new
            {
                Subject = "Project Deadline Update",
                Sender = MockSenders[1],
                Snippet = "Quick update on the design sprint - we need to push the final review to next...",
                Body = "Quick update on the design sprint - we need to push the final review to next Wednesday. The client requested some additional changes to the homepage mockups. Can you have the revisions ready by Tuesday EOD?",
                AccountIds = new[] { "acc_2" },
                IsUnread = true,
                HasAttachment = false,
            },
            new
            {
                Subject = "Re: Q4 Budget Proposal",
                Sender = MockSenders[3],
                Snippet = "Thanks for sending over the proposal. I reviewed it with the team and we have...",
                Body = "Thanks for sending over the proposal. I reviewed it with the team and we have a few questions about the marketing spend allocation. Can we schedule a call this week to discuss?",
                AccountIds = new[] { "acc_2" },
                IsUnread = false,
                HasAttachment = true,
            },
            new
            {
                Subject = "Netflix: New shows you might like",
                Sender = MockSenders[9],
                Snippet = "Based on your viewing history, we think you will love these new releases...",
                Body = "Based on your viewing history, we think you will love these new releases coming this month. Check out our recommendations!",
                AccountIds = new[] { "acc_1" },
                IsUnread = false,
                HasAttachment = false,
            },
            new
            {
                Subject = "GitHub: Pull request merged",
                Sender = MockSenders[7],
                Snippet = "Your pull request #234 has been merged into main branch...",
                Body = "Your pull request #234 'Add email client features' has been merged into main branch by @reviewer. Great work!",
                AccountIds = new[] { "acc_1", "acc_2" },
                IsUnread = true,
                HasAttachment = false,
            },
            new
            {
                Subject = "Client Meeting Notes - TechCorp",
                Sender = MockSenders[2],
                Snippet = "Here are the notes from the client meeting with TechCorp. Key takeaways...",
                Body = "Here are the notes from the client meeting with TechCorp. Key takeaways: 1) They want to launch by end of Q1, 2) Budget approved for additional features, 3) Need weekly status updates. Action items attached.",
                AccountIds = new[] { "acc_2" },
                IsUnread = true,
                HasAttachment = true,
            },
            new
            {
                Subject = "Lunch tomorrow?",
                Sender = MockSenders[5],
                Snippet = "Hey! Are you free for lunch tomorrow around 12:30? There is a new ramen place...",
                Body = "Hey! Are you free for lunch tomorrow around 12:30? There is a new ramen place that opened near the office and I have been wanting to try it. Let me know!",
                AccountIds = new[] { "acc_1" },
                IsUnread = false,
                HasAttachment = false,
            },
            new
            {
                Subject = "LinkedIn: You appeared in 45 searches this week",
                Sender = MockSenders[6],
                Snippet = "Your profile is getting attention! You appeared in 45 searches this week...",
                Body = "Your profile is getting attention! You appeared in 45 searches this week. Update your profile to increase visibility.",
                AccountIds = new[] { "acc_1", "acc_2" },
                IsUnread = false,
                HasAttachment = false,
            },
        };

        var threadIdCounter = 1;
        var messageIdCounter = 1;

        for (var idx = 0; idx < threadTemplates.Length; idx++)
        {
            var template = threadTemplates[idx];
            foreach (var accountId in template.AccountIds)
            {
                var threadId = $"thread_{threadIdCounter++}";
                var inboxFolder = folders.FirstOrDefault(f => f.AccountId == accountId && f.Type == FolderType.Inbox);
                if (inboxFolder is null)
                {
                    continue;
                }

                var messageId = $"msg_{messageIdCounter++}";
                var now = DateTimeOffset.UtcNow;
                var messageDate = now.AddHours(-idx);
                var account = accounts.FirstOrDefault(a => a.Id == accountId);
                var recipient = new Participant(account?.Name ?? "You", account?.Email ?? "you@example.com");

                var attachments = template.HasAttachment
                    ? new[] { new Attachment($"att_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}", "meeting-notes.pdf", "application/pdf", 245678) }
                    : Array.Empty<Attachment>();

                var message = new Message(
                    Id: messageId,
                    ThreadId: threadId,
                    From: template.Sender,
                    To: new[] { recipient },
                    Subject: template.Subject,
                    Body: template.Body,
                    Date: messageDate,
                    IsRead: !template.IsUnread,
                    Attachments: attachments
                );

                var thread = new Thread(
                    Id: threadId,
                    Subject: template.Subject,
                    Participants: new[] { template.Sender, recipient },
                    MessageIds: new[] { messageId },
                    FolderIds: new[] { inboxFolder.Id },
                    Labels: Array.Empty<string>(),
                    IsRead: !template.IsUnread,
                    IsStarred: idx == 0 || idx == 4,
                    LastActivity: messageDate,
                    Snippet: template.Snippet
                );

                threads.Add(thread);
                messages.Add(message);
            }
        }

        var syncStatuses = accounts.Select(account => new SyncStatus(account.Id, false, DateTimeOffset.UtcNow)).ToList();

        return new EmailSnapshot(accounts, folders, threads, messages, syncStatuses);
    }
}
