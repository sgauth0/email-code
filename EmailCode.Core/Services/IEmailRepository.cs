using EmailCode.Core.Models;

namespace EmailCode.Core.Services;

public interface IEmailRepository
{
    Task<EmailSnapshot?> LoadSnapshotAsync(CancellationToken cancellationToken = default);
    Task SaveSnapshotAsync(EmailSnapshot snapshot, CancellationToken cancellationToken = default);
}
