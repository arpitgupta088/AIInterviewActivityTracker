using AIInterviewActivityTracker.Models;
using FluentValidation;

namespace AIInterviewActivityTracker.Validators
{
    /// <summary>
    /// Validates activity events.
    /// </summary>
    public class ActivityEventValidator : AbstractValidator<ActivityEvent>
    {
        public ActivityEventValidator()
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