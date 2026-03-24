@echo off
cd d:\3\QLK\backend
dotnet sln QLK_Backend.sln add Shared.Messages\Shared.Messages.csproj
dotnet add OrderService\OrderService.csproj package MassTransit.RabbitMQ
dotnet add OrderService\OrderService.csproj reference Shared.Messages\Shared.Messages.csproj
dotnet add ProductService\ProductService.csproj package MassTransit.RabbitMQ
dotnet add ProductService\ProductService.csproj reference Shared.Messages\Shared.Messages.csproj
echo Setup Complete
