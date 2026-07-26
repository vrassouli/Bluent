namespace Bluent.OrderDesk.Models;

public sealed record Order(
    int Id,
    string Number,
    int CustomerId,
    string CustomerName,
    DateOnly PlacedOn,
    OrderStatus Status,
    decimal Total);

public enum OrderStatus
{
    Draft,
    Review,
    Ready,
    Fulfilled
}
