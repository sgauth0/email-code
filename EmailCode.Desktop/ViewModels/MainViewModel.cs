using System.Collections.ObjectModel;
using System.Windows;
using EmailCode.Core.Models;
using EmailCode.Core.Services;

namespace EmailCode.Desktop.ViewModels;

public sealed class MainViewModel : ViewModelBase
{
    private readonly EmailStore _store;
    private readonly SyncSimulator _syncSimulator;
    private AccountViewModel? _selectedAccount;
    private FolderViewModel? _selectedFolder;
    private ThreadViewModel? _selectedThread;

    public MainViewModel(EmailStore store, SyncSimulator syncSimulator)
    {
        _store = store;
        _syncSimulator = syncSimulator;

        Accounts = new ObservableCollection<AccountViewModel>();
        Folders = new ObservableCollection<FolderViewModel>();
        Threads = new ObservableCollection<ThreadViewModel>();
        Messages = new ObservableCollection<MessageViewModel>();

        RefreshCommand = new RelayCommand(_ => _ = RefreshAsync());
        ArchiveCommand = new RelayCommand(_ => _ = ArchiveAsync(), _ => SelectedThread is not null);
        DeleteCommand = new RelayCommand(_ => _ = DeleteAsync(), _ => SelectedThread is not null);
        ApplyLabelCommand = new RelayCommand(_ => _ = ApplyLabelAsync(), _ => SelectedThread is not null && SelectedFolder is not null);

        _syncSimulator.Updated += (_, _) => _ = RefreshAsync();
        _syncSimulator.Start();

        _ = LoadAccountsAsync();
    }

    public ObservableCollection<AccountViewModel> Accounts { get; }
    public ObservableCollection<FolderViewModel> Folders { get; }
    public ObservableCollection<ThreadViewModel> Threads { get; }
    public ObservableCollection<MessageViewModel> Messages { get; }

    public AccountViewModel? SelectedAccount
    {
        get => _selectedAccount;
        set
        {
            if (SetField(ref _selectedAccount, value))
            {
                _ = LoadFoldersAsync();
                _ = LoadThreadsAsync();
            }
        }
    }

    public FolderViewModel? SelectedFolder
    {
        get => _selectedFolder;
        set
        {
            if (SetField(ref _selectedFolder, value))
            {
                _ = LoadThreadsAsync();
            }
        }
    }

    public ThreadViewModel? SelectedThread
    {
        get => _selectedThread;
        set
        {
            if (SetField(ref _selectedThread, value))
            {
                _ = LoadMessagesAsync();
            }
        }
    }

    public RelayCommand RefreshCommand { get; }
    public RelayCommand ArchiveCommand { get; }
    public RelayCommand DeleteCommand { get; }
    public RelayCommand ApplyLabelCommand { get; }

    private async Task LoadAccountsAsync()
    {
        var accounts = await _store.GetAccountsAsync();
        await Application.Current.Dispatcher.InvokeAsync(() =>
        {
            Accounts.Clear();
            foreach (var account in accounts)
            {
                Accounts.Add(new AccountViewModel(account));
            }

            SelectedAccount ??= Accounts.FirstOrDefault();
        });
    }

    private async Task LoadFoldersAsync()
    {
        var accountId = SelectedAccount?.Account.Id;
        if (string.IsNullOrWhiteSpace(accountId))
        {
            return;
        }

        var folders = await _store.GetFoldersAsync(accountId);
        await Application.Current.Dispatcher.InvokeAsync(() =>
        {
            Folders.Clear();
            foreach (var folder in folders)
            {
                Folders.Add(new FolderViewModel(folder));
            }

            SelectedFolder ??= Folders.FirstOrDefault();
        });
    }

    private async Task LoadThreadsAsync()
    {
        var accountId = SelectedAccount?.Account.Id;
        var folderId = SelectedFolder?.Folder.Id;
        if (string.IsNullOrWhiteSpace(accountId))
        {
            return;
        }

        IReadOnlyList<Thread> threads = string.IsNullOrWhiteSpace(folderId)
            ? await _store.ListThreadsAsync(accountId: accountId)
            : await _store.ListThreadsAsync(folderId: folderId);

        await Application.Current.Dispatcher.InvokeAsync(() =>
        {
            Threads.Clear();
            foreach (var thread in threads)
            {
                Threads.Add(new ThreadViewModel(thread));
            }

            SelectedThread ??= Threads.FirstOrDefault();
        });
    }

    private async Task LoadMessagesAsync()
    {
        var threadId = SelectedThread?.Thread.Id;
        if (string.IsNullOrWhiteSpace(threadId))
        {
            return;
        }

        var messages = await _store.GetThreadMessagesAsync(threadId);
        await Application.Current.Dispatcher.InvokeAsync(() =>
        {
            Messages.Clear();
            foreach (var message in messages)
            {
                Messages.Add(new MessageViewModel(message));
            }
        });
    }

    private async Task RefreshAsync()
    {
        await LoadAccountsAsync();
        await LoadFoldersAsync();
        await LoadThreadsAsync();
        await LoadMessagesAsync();
    }

    private async Task ArchiveAsync()
    {
        var threadId = SelectedThread?.Thread.Id;
        if (string.IsNullOrWhiteSpace(threadId))
        {
            return;
        }

        await _store.ArchiveThreadAsync(threadId);
        await RefreshAsync();
    }

    private async Task DeleteAsync()
    {
        var threadId = SelectedThread?.Thread.Id;
        if (string.IsNullOrWhiteSpace(threadId))
        {
            return;
        }

        await _store.TrashThreadAsync(threadId);
        await RefreshAsync();
    }

    private async Task ApplyLabelAsync()
    {
        var threadId = SelectedThread?.Thread.Id;
        var folderId = SelectedFolder?.Folder.Id;
        if (string.IsNullOrWhiteSpace(threadId) || string.IsNullOrWhiteSpace(folderId))
        {
            return;
        }

        await _store.ApplyLabelAsync(threadId, folderId);
        await RefreshAsync();
    }
}
