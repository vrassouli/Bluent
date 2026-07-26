using Bluent.OrderDesk.Models;

namespace Bluent.OrderDesk.Data;

public sealed class OrderDeskRepository
{
    private readonly List<Customer> _customers =
    [
        new(1, "Maya Chen", "Northwind Health", "maya@northwind.example", "Seattle", CustomerSegment.Strategic, CustomerStatus.Active, new(2022, 3, 14)),
        new(2, "Noah Williams", "Alpine Logistics", "noah@alpine.example", "Denver", CustomerSegment.Enterprise, CustomerStatus.Active, new(2023, 7, 2)),
        new(3, "Ava Patel", "Contoso Retail", "ava@contoso.example", "Austin", CustomerSegment.Growth, CustomerStatus.Active, new(2024, 1, 19)),
        new(4, "Ethan Kim", "Fabrikam Energy", "ethan@fabrikam.example", "Portland", CustomerSegment.Enterprise, CustomerStatus.Active, new(2021, 11, 8)),
        new(5, "Sofia Garcia", "Adventure Works", "sofia@adventure.example", "Chicago", CustomerSegment.Growth, CustomerStatus.Active, new(2024, 5, 27)),
        new(6, "Liam Martin", "Tailspin Toys", "liam@tailspin.example", "Boston", CustomerSegment.Growth, CustomerStatus.Archived, new(2020, 9, 3))
    ];

    private readonly List<Order> _orders =
    [
        new(1, "SO-1048", 1, "Northwind Health", new(2026, 7, 25), OrderStatus.Review, 18450m),
        new(2, "SO-1047", 2, "Alpine Logistics", new(2026, 7, 25), OrderStatus.Ready, 9275m),
        new(3, "SO-1046", 3, "Contoso Retail", new(2026, 7, 24), OrderStatus.Fulfilled, 4380m),
        new(4, "SO-1045", 4, "Fabrikam Energy", new(2026, 7, 24), OrderStatus.Draft, 12700m),
        new(5, "SO-1044", 5, "Adventure Works", new(2026, 7, 23), OrderStatus.Ready, 6950m),
        new(6, "SO-1043", 1, "Northwind Health", new(2026, 7, 22), OrderStatus.Fulfilled, 22100m),
        new(7, "SO-1042", 2, "Alpine Logistics", new(2026, 7, 21), OrderStatus.Fulfilled, 8100m),
        new(8, "SO-1041", 3, "Contoso Retail", new(2026, 7, 20), OrderStatus.Fulfilled, 5150m),
        new(9, "SO-1040", 4, "Fabrikam Energy", new(2026, 7, 19), OrderStatus.Fulfilled, 17400m),
        new(10, "SO-1039", 5, "Adventure Works", new(2026, 7, 18), OrderStatus.Fulfilled, 3600m),
        new(11, "SO-1038", 1, "Northwind Health", new(2026, 7, 17), OrderStatus.Fulfilled, 14100m),
        new(12, "SO-1037", 2, "Alpine Logistics", new(2026, 7, 16), OrderStatus.Fulfilled, 7700m)
    ];

    public async Task<IReadOnlyList<Customer>> GetCustomersAsync(
        string? query = null,
        bool includeArchived = false,
        CancellationToken cancellationToken = default)
    {
        await Task.Delay(350, cancellationToken);

        IEnumerable<Customer> customers = _customers;
        if (!includeArchived)
        {
            customers = customers.Where(customer => customer.Status == CustomerStatus.Active);
        }

        if (!string.IsNullOrWhiteSpace(query))
        {
            customers = customers.Where(customer =>
                customer.Name.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                customer.Company.Contains(query, StringComparison.OrdinalIgnoreCase));
        }

        return customers.OrderBy(customer => customer.Company).ToArray();
    }

    public async Task<Customer?> GetCustomerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        await Task.Delay(250, cancellationToken);
        return _customers.SingleOrDefault(customer => customer.Id == id);
    }

    public IReadOnlyList<Order> GetOrders(OrderFilter? filter = null)
    {
        IEnumerable<Order> orders = _orders;
        if (filter?.Status is { } status)
        {
            orders = orders.Where(order => order.Status == status);
        }

        if (filter?.MinimumTotal is { } minimumTotal)
        {
            orders = orders.Where(order => order.Total >= minimumTotal);
        }

        return orders.OrderByDescending(order => order.PlacedOn).ThenByDescending(order => order.Id).ToArray();
    }

    public IReadOnlyList<Order> GetCustomerOrders(int customerId) =>
        _orders
            .Where(order => order.CustomerId == customerId)
            .OrderByDescending(order => order.PlacedOn)
            .ToArray();

    public Customer SaveCustomer(int? id, CustomerEditorModel input)
    {
        var segment = Enum.Parse<CustomerSegment>(input.Segment);
        if (id is { } customerId)
        {
            var index = _customers.FindIndex(customer => customer.Id == customerId);
            if (index < 0)
            {
                throw new InvalidOperationException($"Customer {customerId} was not found.");
            }

            var existing = _customers[index];
            var updated = existing with
            {
                Name = input.Name.Trim(),
                Company = input.Company.Trim(),
                Email = input.Email.Trim(),
                City = input.City.Trim(),
                Segment = segment
            };
            _customers[index] = updated;
            return updated;
        }

        var customer = new Customer(
            _customers.Max(existing => existing.Id) + 1,
            input.Name.Trim(),
            input.Company.Trim(),
            input.Email.Trim(),
            input.City.Trim(),
            segment,
            CustomerStatus.Active,
            new DateOnly(2026, 7, 26));
        _customers.Add(customer);
        return customer;
    }

    public bool ArchiveCustomer(int id)
    {
        var index = _customers.FindIndex(customer => customer.Id == id);
        if (index < 0 || _customers[index].Status == CustomerStatus.Archived)
        {
            return false;
        }

        _customers[index] = _customers[index] with { Status = CustomerStatus.Archived };
        return true;
    }

    public int ActiveCustomerCount => _customers.Count(customer => customer.Status == CustomerStatus.Active);
    public int OrdersNeedingAttention => _orders.Count(order => order.Status is OrderStatus.Draft or OrderStatus.Review);
    public decimal OpenOrderValue => _orders
        .Where(order => order.Status != OrderStatus.Fulfilled)
        .Sum(order => order.Total);

    public Dictionary<string, double> GetFulfilledRevenueByDay() =>
        _orders
            .Where(order => order.Status == OrderStatus.Fulfilled)
            .OrderBy(order => order.PlacedOn)
            .GroupBy(order => order.PlacedOn)
            .ToDictionary(
                group => group.Key.ToString("MMM d"),
                group => (double)group.Sum(order => order.Total));
}
