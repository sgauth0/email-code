using System.IO;
using System.Windows;
using EmailCode.Core.Services;
using EmailCode.Infrastructure;

namespace EmailCode.Desktop;

public partial class App : Application
{
    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "EmailCode");
        Directory.CreateDirectory(appData);
        var dbPath = Path.Combine(appData, "emailcode.db");

        var repository = new SqliteEmailRepository(dbPath);
        var store = new EmailStore(repository);
        await store.InitializeAsync(MockDataSeeder.Generate());

        var syncSimulator = new SyncSimulator(store);
        var mainWindow = new Views.MainWindow
        {
            DataContext = new ViewModels.MainViewModel(store, syncSimulator)
        };
        mainWindow.Show();
    }
}
