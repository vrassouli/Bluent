namespace Bluent.OrderDesk.Models;

public sealed record Customer(
    int Id,
    string Name,
    string Company,
    string Email,
    string City,
    CustomerSegment Segment,
    CustomerStatus Status,
    DateOnly CustomerSince);

public enum CustomerSegment
{
    Growth,
    Enterprise,
    Strategic
}

public enum CustomerStatus
{
    Active,
    Archived
}
