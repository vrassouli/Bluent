namespace Bluent.OrderDesk.Models;

public sealed record OrderFilter(OrderStatus? Status, decimal? MinimumTotal)
{
    public static OrderFilter Empty { get; } = new(null, null);

    public bool IsActive => Status is not null || MinimumTotal is not null;
}
