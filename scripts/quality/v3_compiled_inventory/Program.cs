using System.Reflection;
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;
using System.Text.Json;
if (args.Length != 1) { Console.Error.WriteLine("Pass repository root"); return 2; }
string root = Path.GetFullPath(args[0]);
using var d = JsonDocument.Parse(File.ReadAllText(Path.Combine(root,"docs/v3/inventory/public-component-sources.json")));
var cache = new Dictionary<string,Dictionary<string,bool>>();
int exported = 0, reviewedExported = 0, missing = 0, total = 0;
foreach (var c in d.RootElement.GetProperty("components").EnumerateArray())
{
    string pkg = c.GetProperty("package").GetString()!;
    string name = c.GetProperty("markupName").GetString()!;
    string klass = c.GetProperty("classification").GetString()!;
    if (!cache.TryGetValue(pkg,out var types))
    {
        string dll = Path.Combine(root,"src",pkg,"bin/Release/net10.0",pkg+".dll");
        if (!File.Exists(dll)) {Console.Error.WriteLine("Missing assembly "+dll);return 2;}
        using var stream = File.OpenRead(dll);
        using var pe = new PEReader(stream);
        var rd = pe.GetMetadataReader();
        types = new Dictionary<string,bool>();
        foreach(var h in rd.TypeDefinitions)
        {
            var t=rd.GetTypeDefinition(h);
            var n=rd.GetString(t.Name).Split((char)96)[0];
            var isExported=(t.Attributes & TypeAttributes.VisibilityMask)==TypeAttributes.Public;
            types[n]=types.GetValueOrDefault(n)||isExported;
        }
        cache[pkg]=types;
    }
    total++;
    if (!types.TryGetValue(name,out bool visible)) { Console.Error.WriteLine("MISSING "+pkg+"::"+name); missing++;continue;}
    if (klass=="public-candidate")
    {
        if(!visible){ Console.Error.WriteLine("NOT PUBLIC "+pkg+"::"+name);missing++;}
        else exported++;
    }
    else if(visible) reviewedExported++;
    else
    {
        Console.Error.WriteLine("BREAKING CLR EXPORT: "+pkg+"::"+name);
        missing++;
    }
}
Console.WriteLine($"CLR metadata #494: {total} source candidates, {exported} public-candidate CLR exports, {reviewedExported} excluded/review CLR exports, {missing} missing or hidden");
Console.WriteLine("CLR visibility is NOT public consumer documentation, runtime parity or accessibility signoff.");
return missing==0?0:1;
