using System.Net;
using System.Net.Mail;

namespace EmailCode.Infrastructure;

public sealed class SmtpEmailSender
{
    public async Task SendAsync(string host, int port, bool enableSsl, NetworkCredential credential, MailMessage message, CancellationToken cancellationToken = default)
    {
        using var client = new SmtpClient(host, port)
        {
            EnableSsl = enableSsl,
            Credentials = credential
        };

        using (cancellationToken.Register(() => client.SendAsyncCancel()))
        {
            await client.SendMailAsync(message, cancellationToken);
        }
    }
}
