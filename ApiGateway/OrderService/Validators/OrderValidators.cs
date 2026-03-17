using FluentValidation;
using OrderService.DTOs;

namespace OrderService.Validators;

public class CreateOrderValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.UserId)
            .GreaterThan(0).WithMessage("UserId phải lớn hơn 0!");

        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("ProductId phải lớn hơn 0!");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Số lượng phải lớn hơn 0!")
            .LessThanOrEqualTo(1000).WithMessage("Số lượng không được quá 1000!");
    }
}

public class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatusDto>
{
    private static readonly string[] ValidStatuses =
        { "Pending", "Packing", "Shipping", "Delivering", "Delivered", "Cancelled" };

    public UpdateOrderStatusValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status không được để trống!")
            .Must(s => ValidStatuses.Contains(s))
            .WithMessage($"Status chỉ được là: {string.Join(", ", ValidStatuses)}");
    }
}