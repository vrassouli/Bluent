using System.ComponentModel.DataAnnotations;

namespace Bluent.UI.Demo.Pages.Components.ViewModels;

public class DataGridSampleModel
{
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

    public DataGridSampleModel(string firstName, string lastName, DateOnly birthdate, int weight, int height, string nationality)
    {
        FirstName = firstName;
        LastName = lastName;
        Birthdate = birthdate;
        Weight = weight;
        Height = height;
        Nationality = nationality;
    }

    public override string ToString()
    {
        return $"{FirstName} {LastName}";
    }

    public static IEnumerable<DataGridSampleModel> LoadSample(int count)
    {
        return Enumerable.Range(0, count).Select(x => new DataGridSampleModel($"Name {x}",
                                                                              $"Last name {x}",
                                                                              DateOnly.FromDateTime(DateTime.Today.AddDays(-1 * x)),
                                                                              x,
                                                                              x,
                                                                              $"Nationality {x}"));
    }
}
