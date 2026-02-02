using System.Net.Security;
using System.Net.Sockets;
using System.Text;

namespace EmailCode.Infrastructure;

public sealed class ImapClient : IAsyncDisposable
{
    private readonly string _host;
    private readonly int _port;
    private readonly bool _useSsl;
    private TcpClient? _tcpClient;
    private Stream? _stream;

    public ImapClient(string host, int port = 993, bool useSsl = true)
    {
        _host = host;
        _port = port;
        _useSsl = useSsl;
    }

    public async Task ConnectAsync(string username, string password, CancellationToken cancellationToken = default)
    {
        _tcpClient = new TcpClient();
        await _tcpClient.ConnectAsync(_host, _port, cancellationToken);

        _stream = _tcpClient.GetStream();
        if (_useSsl)
        {
            var ssl = new SslStream(_stream, false);
            await ssl.AuthenticateAsClientAsync(_host);
            _stream = ssl;
        }

        await ReadResponseAsync(cancellationToken);
        await SendCommandAsync($"a1 LOGIN {username} {password}", cancellationToken);
    }

    public async Task<IReadOnlyList<string>> ListFoldersAsync(CancellationToken cancellationToken = default)
    {
        var response = await SendCommandAsync("a2 LIST \"\" \"*\"", cancellationToken);
        var folders = new List<string>();
        foreach (var line in response)
        {
            if (line.StartsWith("* LIST", StringComparison.OrdinalIgnoreCase))
            {
                var parts = line.Split('"');
                if (parts.Length >= 2)
                {
                    folders.Add(parts[^2]);
                }
            }
        }

        return folders;
    }

    public async Task DisconnectAsync(CancellationToken cancellationToken = default)
    {
        if (_stream is null)
        {
            return;
        }

        await SendCommandAsync("a3 LOGOUT", cancellationToken);
        _stream.Dispose();
        _stream = null;
        _tcpClient?.Dispose();
        _tcpClient = null;
    }

    public async ValueTask DisposeAsync()
    {
        await DisconnectAsync();
    }

    private async Task<IReadOnlyList<string>> SendCommandAsync(string command, CancellationToken cancellationToken)
    {
        if (_stream is null)
        {
            throw new InvalidOperationException("IMAP connection not initialized.");
        }

        var data = Encoding.ASCII.GetBytes(command + "\r\n");
        await _stream.WriteAsync(data, 0, data.Length, cancellationToken);
        await _stream.FlushAsync(cancellationToken);

        return await ReadResponseAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<string>> ReadResponseAsync(CancellationToken cancellationToken)
    {
        if (_stream is null)
        {
            throw new InvalidOperationException("IMAP connection not initialized.");
        }

        using var reader = new StreamReader(_stream, Encoding.ASCII, leaveOpen: true);
        var lines = new List<string>();
        while (true)
        {
            var line = await reader.ReadLineAsync(cancellationToken);
            if (line is null)
            {
                break;
            }

            lines.Add(line);
            if (line.StartsWith("a", StringComparison.OrdinalIgnoreCase))
            {
                break;
            }
        }

        return lines;
    }
}
