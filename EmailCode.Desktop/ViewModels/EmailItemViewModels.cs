using EmailCode.Core.Models;

namespace EmailCode.Desktop.ViewModels;

public sealed class AccountViewModel : ViewModelBase
{
    public AccountViewModel(Account account)
    {
        Account = account;
    }

    public Account Account { get; }
    public string DisplayName => Account.Name;
    public string Email => Account.Email;
}

public sealed class FolderViewModel : ViewModelBase
{
    public FolderViewModel(Folder folder)
    {
        Folder = folder;
    }

    public Folder Folder { get; }
    public string DisplayName => $"{Folder.Name} ({Folder.UnreadCount})";
}

public sealed class ThreadViewModel : ViewModelBase
{
    public ThreadViewModel(Thread thread)
    {
        Thread = thread;
    }

    public Thread Thread { get; }
    public string Subject => Thread.Subject;
    public string Snippet => Thread.Snippet;
    public string LastActivity => Thread.LastActivity.LocalDateTime.ToString("g");
}

public sealed class MessageViewModel : ViewModelBase
{
    public MessageViewModel(Message message)
    {
        Message = message;
    }

    public Message Message { get; }
    public string From => $"{Message.From.Name} <{Message.From.Email}>";
    public string Body => Message.Body;
    public string SentAt => Message.Date.LocalDateTime.ToString("g");
}
