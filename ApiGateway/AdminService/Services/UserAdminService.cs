using System.Net.Http.Headers;
using AdminService.DTOs;
using AdminService.Services.Interfaces;

namespace AdminService.Services;

public class UserAdminService : IUserAdminService
{
    private readonly IHttpClientFactory _http;

    public UserAdminService(IHttpClientFactory http)
    {
        _http = http;
    }

    private HttpClient GetClient(string token)
    {
        var client = _http.CreateClient("UserServiceClient");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public async Task<(bool Success, int StatusCode, string Body)> GetAllAsync(string token)
    {
        var res = await GetClient(token).GetAsync("/api/users");
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> CreateAsync(string token, CreatePersonDto dto)
    {
        var res = await GetClient(token).PostAsJsonAsync("/api/users", new
        {
            name = dto.Name,
            email = dto.Email,
            password = dto.Password,
        });
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> UpdateAsync(string token, int id, UpdatePersonDto dto)
    {
        var res = await GetClient(token).PutAsJsonAsync($"/api/users/{id}", new
        {
            name = dto.Name,
            email = dto.Email,
        });
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> DeleteAsync(string token, int id)
    {
        var res = await GetClient(token).DeleteAsync($"/api/users/{id}");
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }
}