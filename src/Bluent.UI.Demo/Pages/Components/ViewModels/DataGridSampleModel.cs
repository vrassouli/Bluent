using System.ComponentModel.DataAnnotations;

namespace Bluent.UI.Demo.Pages.Components.ViewModels;

public class DataGridSampleModel
{
    [Display(Name = "Id")]
    public int Id { get; set; }

    [Display(Name = "Name")]
    public string FirstName { get; set; }

    [Display(Name = "Last name")]
    public string LastName { get; set; }

    [Display(Name = "Birth date")]
    public DateOnly Birthdate { get; set; }

    [Display(Name = "Weight")]
    public int Weight { get; set; }

    [Display(Name = "Height")]
    public int Height { get; set; }
        
    public string Nationality { get; set; }

    public DataGridSampleModel(int id)
    {
        Id = id;
        FirstName = $"Name {id}";
        LastName = $"Last name {id}";
        Birthdate = DateOnly.FromDateTime(DateTime.Today.AddDays(-1 * id));
        Weight = id;
        Height = id;
        Nationality = $"Nationality {id}";
    }

    public override string ToString()
    {
        return $"{FirstName} {LastName}";
    }

    public static IEnumerable<DataGridSampleModel> LoadSample(int count)
    {
        return Enumerable.Range(0, count).Select(x => new DataGridSampleModel(x));
    }
}
