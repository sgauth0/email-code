using System.Security.Cryptography;
using System.Text;

namespace EmailCode.Infrastructure;

public sealed class DpapiSecretStore
{
    public Task SaveSecretAsync(string key, string secret, string directoryPath, CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(directoryPath);
        var bytes = Encoding.UTF8.GetBytes(secret);
        var protectedBytes = ProtectedData.Protect(bytes, null, DataProtectionScope.CurrentUser);
        var filePath = Path.Combine(directoryPath, $"{key}.bin");
        File.WriteAllBytes(filePath, protectedBytes);
        return Task.CompletedTask;
    }

    public Task<string?> LoadSecretAsync(string key, string directoryPath, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(directoryPath, $"{key}.bin");
        if (!File.Exists(filePath))
        {
            return Task.FromResult<string?>(null);
        }

        var protectedBytes = File.ReadAllBytes(filePath);
        var bytes = ProtectedData.Unprotect(protectedBytes, null, DataProtectionScope.CurrentUser);
        return Task.FromResult<string?>(Encoding.UTF8.GetString(bytes));
    }
}
