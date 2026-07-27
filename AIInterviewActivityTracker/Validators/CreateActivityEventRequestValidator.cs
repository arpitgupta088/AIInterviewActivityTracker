using AIInterviewActivityTracker.DTOs.ActivityEvent;
using FluentValidation;

namespace AIInterviewActivityTracker.Validators
{
    /// <summary>
    /// Validates activity event requests.
    /// </summary>
    public class CreateActivityEventRequestValidator : AbstractValidator<CreateActivityEventRequest>
    {
        public CreateActivityEventRequestValidator()
        {
            RuleFor(x => x.SessionId).NotEmpty().MaximumLength(100);

            RuleFor(x => x.CandidateId)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.EventType)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Module)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.MetadataJson)
                .MaximumLength(5000);
        }
    }
}