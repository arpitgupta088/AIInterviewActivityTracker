using AIInterviewActivityTracker.DTOs.InterviewSession;
using FluentValidation;

namespace AIInterviewActivityTracker.Validators
{
    /// <summary>
    /// Validates update interview session requests.
    /// </summary>
    public class UpdateInterviewSessionRequestValidator : AbstractValidator<UpdateInterviewSessionRequest>
    {
        public UpdateInterviewSessionRequestValidator()
        {
            RuleFor(x => x.SessionId)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Status)
                .NotEmpty()
                .Must(status =>
                    status == "IN_PROGRESS" ||
                    status == "COMPLETED" ||
                    status == "ABORTED")
                .WithMessage("Invalid session status.");
        }
    }
}