using System.ComponentModel.DataAnnotations;

namespace Bluent.OrderDesk.Models;

public sealed class CustomerEditorModel
{
    [Required, StringLength(80, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 2)]
    public string Company { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(80)]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Segment { get; set; } = CustomerSegment.Growth.ToString();

    public static CustomerEditorModel FromCustomer(Customer customer) =>
        new()
        {
            Name = customer.Name,
            Company = customer.Company,
            Email = customer.Email,
            City = customer.City,
            Segment = customer.Segment.ToString()
        };
}
