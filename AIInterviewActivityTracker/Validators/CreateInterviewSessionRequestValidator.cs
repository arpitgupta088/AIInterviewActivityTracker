using AIInterviewActivityTracker.Models;
using FluentValidation;

namespace AIInterviewActivityTracker.Validators
{
    /// <summary>
    /// Validate create interview session requests.
    /// </summary>
    public class CreateInterviewSessionRequestValidator : AbstractValidator<CreateInterviewSessionRequest>
    {
        public CreateInterviewSessionRequestValidator() 
        {
            RuleFor(x => x.SessionId).NotEmpty().MaximumLength(100);

            RuleFor(x=> x.CandidateId).NotEmpty().MaximumLength(100);

            RuleFor(x => x.InterviewId).NotEmpty().MaximumLength(100);
        }
    }
}
