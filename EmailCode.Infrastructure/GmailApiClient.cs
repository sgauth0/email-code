using System.Net.Http.Headers;
using System.Text.Json;
using EmailCode.Core.Models;

namespace EmailCode.Infrastructure;

public sealed class GmailApiClient
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    public GmailApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress ??= new Uri("https://gmail.googleapis.com/gmail/v1/");
    }

    public void SetAccessToken(string accessToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    }

    public async Task<IReadOnlyList<string>> ListLabelsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"users/{userId}/labels", cancellationToken);
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (!doc.RootElement.TryGetProperty("labels", out var labelsElement))
        {
            return Array.Empty<string>();
        }

        var labels = new List<string>();
        foreach (var label in labelsElement.EnumerateArray())
        {
            if (label.TryGetProperty("name", out var nameElement))
            {
                labels.Add(nameElement.GetString() ?? string.Empty);
            }
        }

        return labels;
    }

    public async Task<IReadOnlyList<Thread>> ListThreadsAsync(string userId, int maxResults = 50, CancellationToken cancellationToken = default)
    {
        var response = await _httpClient.GetAsync($"users/{userId}/threads?maxResults={maxResults}", cancellationToken);
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        var threads = new List<Thread>();
        if (!doc.RootElement.TryGetProperty("threads", out var threadsElement))
        {
            return threads;
        }

        foreach (var item in threadsElement.EnumerateArray())
        {
            var id = item.GetProperty("id").GetString() ?? string.Empty;
            var snippet = item.TryGetProperty("snippet", out var snippetElement) ? snippetElement.GetString() ?? string.Empty : string.Empty;

            threads.Add(new Thread(
                Id: id,
                Subject: string.Empty,
                Participants: Array.Empty<Participant>(),
                MessageIds: Array.Empty<string>(),
                FolderIds: Array.Empty<string>(),
                Labels: Array.Empty<string>(),
                IsRead: false,
                IsStarred: false,
                LastActivity: DateTimeOffset.UtcNow,
                Snippet: snippet
            ));
        }

        return threads;
    }
}
