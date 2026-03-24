using CartService.DTOs;

namespace CartService.Services
{
    public interface IProductClient
    {
        Task<List<ProductInfo>> GetProductsByIdsAsync(List<string> productIds);
    }

    public class ProductClient : IProductClient
    {
        private readonly HttpClient _http;
        private readonly ILogger<ProductClient> _logger;

        public ProductClient(HttpClient http, ILogger<ProductClient> logger)
        {
            _http = http;
            _logger = logger;
        }

        public async Task<List<ProductInfo>> GetProductsByIdsAsync(List<string> productIds)
        {
            if (!productIds.Any()) return new();

            try
            {
                var ids = string.Join(",", productIds);
                var response = await _http.GetAsync($"/api/Products/batch?ids={ids}");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("ProductService trả về {Status}", response.StatusCode);
                    return new();
                }

                var products = await response.Content
                    .ReadFromJsonAsync<List<ProductInfo>>();

                return products ?? new();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gọi ProductService");
                return new();
            }
        }
    }
}