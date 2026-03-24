using System.Net.Http.Headers;
using AdminService.DTOs;
using AdminService.Services.Interfaces;

namespace AdminService.Services;

public class SellerAdminService : ISellerAdminService
{
    private readonly IHttpClientFactory _http;

    public SellerAdminService(IHttpClientFactory http)
    {
        _http = http;
    }

    private HttpClient GetClient(string token)
    {
        var client = _http.CreateClient("SellerServiceClient");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public async Task<(bool Success, int StatusCode, string Body)> GetAllAsync(string token)
    {
        var res = await GetClient(token).GetAsync("/api/seller/list");
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> CreateAsync(string token, CreatePersonDto dto)
    {
        var res = await GetClient(token).PostAsJsonAsync("/api/seller/register", new
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
        var res = await GetClient(token).PutAsJsonAsync($"/api/seller/admin/update/{id}", new
        {
            name = dto.Name,
            email = dto.Email,
            password = dto.Password,
        });
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }

    public async Task<(bool Success, int StatusCode, string Body)> DeleteAsync(string token, int id)
    {
        var res = await GetClient(token).DeleteAsync($"/api/seller/{id}");
        var body = await res.Content.ReadAsStringAsync();
        return (res.IsSuccessStatusCode, (int)res.StatusCode, body);
    }
}