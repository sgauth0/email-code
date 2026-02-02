using EmailCode.Core.Models;
using EmailCode.Core.Services;

namespace EmailCode.Tests;

public sealed class CoreModuleTests
{
    private sealed class InMemoryEmailRepository : IEmailRepository
    {
        private EmailSnapshot? _snapshot;

        public Task<EmailSnapshot?> LoadSnapshotAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(_snapshot);

        public Task SaveSnapshotAsync(EmailSnapshot snapshot, CancellationToken cancellationToken = default)
        {
            _snapshot = snapshot;
            return Task.CompletedTask;
        }
    }

    private sealed class FixedRandom : Random
    {
        private readonly Queue<double> _doubleValues = new(new[] { 0.05 });
        private readonly Queue<int> _intValues = new(new[] { 0 });

        public override double NextDouble() => _doubleValues.Count > 0 ? _doubleValues.Dequeue() : 0.05;

        public override int Next(int minValue, int maxValue)
        {
            if (_intValues.Count > 0)
            {
                return minValue + _intValues.Dequeue();
            }

            return minValue;
        }
    }

    [Fact]
    public void MockDataSeeder_GeneratesExpectedAccounts()
    {
        var snapshot = MockDataSeeder.Generate();

        Assert.Equal(2, snapshot.Accounts.Count);
        Assert.Contains(snapshot.Folders, folder => folder.Type == FolderType.Inbox);
        Assert.NotEmpty(snapshot.Threads);
        Assert.NotEmpty(snapshot.Messages);
    }

    [Fact]
    public async Task EmailStore_ArchivesThreadMovesToArchive()
    {
        var repository = new InMemoryEmailRepository();
        var store = new EmailStore(repository);
        var snapshot = MockDataSeeder.Generate();

        await store.InitializeAsync(snapshot);
        var inboxFolder = snapshot.Folders.First(f => f.Type == FolderType.Inbox && f.AccountId == "acc_1");
        var archiveFolder = snapshot.Folders.First(f => f.Type == FolderType.Archive && f.AccountId == "acc_1");
        var thread = (await store.ListThreadsAsync(folderId: inboxFolder.Id)).First();

        await store.ArchiveThreadAsync(thread.Id);

        var updatedThread = await store.GetThreadAsync(thread.Id);
        Assert.NotNull(updatedThread);
        Assert.DoesNotContain(inboxFolder.Id, updatedThread!.FolderIds);
        Assert.Contains(archiveFolder.Id, updatedThread.FolderIds);
    }

    [Fact]
    public async Task EmailStore_SearchFiltersByQuery()
    {
        var repository = new InMemoryEmailRepository();
        var store = new EmailStore(repository);
        await store.InitializeAsync(MockDataSeeder.Generate());

        var results = await store.SearchThreadsAsync(new SearchFilters(Query: "netflix"));

        Assert.Contains(results, thread => thread.Subject.Contains("Netflix", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task SyncSimulator_UpdatesSyncStatus()
    {
        var repository = new InMemoryEmailRepository();
        var store = new EmailStore(repository);
        await store.InitializeAsync(MockDataSeeder.Generate());

        var simulator = new SyncSimulator(store, new FixedRandom(), (_, _) => Task.CompletedTask);
        await simulator.RunOnceAsync();

        var status = await store.GetSyncStatusAsync("acc_1");
        Assert.NotNull(status);
        Assert.False(status!.IsSyncing);
        Assert.Equal("Authentication required", status.Error);
    }
}
