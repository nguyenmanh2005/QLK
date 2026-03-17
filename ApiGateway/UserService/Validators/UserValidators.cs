using FluentValidation;
using UserService.DTOs;

namespace UserService.Validators;

public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên không được để trống!")
            .MinimumLength(2).WithMessage("Tên phải có ít nhất 2 ký tự!")
            .MaximumLength(100).WithMessage("Tên không được quá 100 ký tự!");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống!")
            .EmailAddress().WithMessage("Email không đúng định dạng!")
            .MaximumLength(200).WithMessage("Email không được quá 200 ký tự!");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống!")
            .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự!")
            .MaximumLength(50).WithMessage("Mật khẩu không được quá 50 ký tự!");
    }
}

public class UpdateUserValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên không được để trống!")
            .MinimumLength(2).WithMessage("Tên phải có ít nhất 2 ký tự!")
            .MaximumLength(100).WithMessage("Tên không được quá 100 ký tự!");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống!")
            .EmailAddress().WithMessage("Email không đúng định dạng!");
    }
}

public class LoginValidator : AbstractValidator<LoginDto>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống!")
            .EmailAddress().WithMessage("Email không đúng định dạng!");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống!");
    }
}