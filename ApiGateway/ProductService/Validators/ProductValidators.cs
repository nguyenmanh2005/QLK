using FluentValidation;
using ProductService.DTOs;

namespace ProductService.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên sản phẩm không được để trống!")
            .MinimumLength(2).WithMessage("Tên phải có ít nhất 2 ký tự!")
            .MaximumLength(200).WithMessage("Tên không được quá 200 ký tự!");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Giá phải lớn hơn 0!")
            .LessThanOrEqualTo(999999999).WithMessage("Giá không được quá 999,999,999!");

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("Số lượng tồn kho không được âm!");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Mô tả không được quá 1000 ký tự!");
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên sản phẩm không được để trống!")
            .MaximumLength(200).WithMessage("Tên không được quá 200 ký tự!");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Giá phải lớn hơn 0!");

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("Số lượng tồn kho không được âm!");
    }
}