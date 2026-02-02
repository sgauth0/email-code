# EmailCode (C#)

EmailCode is a C#/.NET email client prototype with a WPF desktop shell, shared domain models, and infrastructure stubs for storage and providers.

## Projects

- **EmailCode.Core**: Domain models and in-memory services.
- **EmailCode.Infrastructure**: Provider/storage integrations (mocked/stubbed implementations).
- **EmailCode.Desktop**: WPF desktop UI that consumes the core and infrastructure layers.
- **EmailCode.Tests**: Unit tests covering core behaviors.

## Prerequisites

- .NET 8 SDK
- Windows (required for WPF desktop app)

## Build

```bash
dotnet build EmailCode.sln
```

## Run the desktop app

```bash
dotnet run --project EmailCode.Desktop/EmailCode.Desktop.csproj
```

## Run tests

```bash
dotnet test EmailCode.Tests/EmailCode.Tests.csproj
```
