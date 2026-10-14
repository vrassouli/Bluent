using System.Reflection;
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;
using System.Text.Json;

if (args.Length < 1 || args.Length > 4)
{
    Console.Error.WriteLine("Usage: V3CompiledInventory <repository-root> [--write-contracts|--check-contracts] [--contracts-path file]");
    return 2;
}
string root = Path.GetFullPath(args[0]);
bool write = args.Contains("--write-contracts", StringComparer.Ordinal);
string contractsPath = Path.Combine(root, "docs/v3/inventory/public-component-contracts.json");
int customPathIndex = Array.IndexOf(args, "--contracts-path");
if (customPathIndex >= 0)
{
    if (customPathIndex + 1 >= args.Length) { Console.Error.WriteLine("Missing --contracts-path value"); return 2; }
    contractsPath = Path.GetFullPath(args[customPathIndex + 1]);
}
string manifest = Path.Combine(root, "docs/v3/inventory/public-component-sources.json");
using var doc = JsonDocument.Parse(File.ReadAllText(manifest));
var provider = new ApiSignatureProvider();
var packageTypes = new Dictionary<string, Dictionary<string, List<(bool Public, bool Abstract, ApiComponent Component)>>>(StringComparer.Ordinal);
var components = new SortedDictionary<string, ApiComponent>(StringComparer.Ordinal);
int missing = 0, exported = 0, reviewedExported = 0, total = 0;

foreach (var candidate in doc.RootElement.GetProperty("components").EnumerateArray())
{
    string package = candidate.GetProperty("package").GetString()!;
    string name = candidate.GetProperty("markupName").GetString()!;
    string classification = candidate.GetProperty("classification").GetString()!;
    if (!packageTypes.TryGetValue(package, out var classes))
    {
        classes = ReadPackage(package);
        packageTypes.Add(package, classes);
    }

    total++;
    if (!classes.TryGetValue(name, out var matches) || matches.Count == 0)
    {
        Console.Error.WriteLine($"MISSING CLR symbol: {package}::{name}");
        missing++;
        continue;
    }
    var concrete = matches.Where(m => m.Public && !m.Abstract).ToList();
    if (concrete.Count == 0) concrete = matches.Where(m => m.Public).ToList();
    if (concrete.Count != 1)
    {
        Console.Error.WriteLine($"AMBIGUOUS CLR symbol: {package}::{name} has {concrete.Count} concrete public definitions. Route by namespace.");
        missing++;
        continue;
    }
    var found = concrete[0];
    if (!found.Public)
    {
        Console.Error.WriteLine($"BREAKING CLR EXPORT: {package}::{name} no longer public");
        missing++;
        continue;
    }
    if (classification == "public-candidate" && found.Abstract)
    {
        Console.Error.WriteLine($"NOT A CONCRETE COMPONENT: {package}::{name}");
        missing++;
        continue;
    }
    if (classification == "abstract-public-api" && !found.Abstract)
    {
        Console.Error.WriteLine($"ABSTRACT BASE CONTRACT CHANGED: {package}::{name}");
        missing++;
        continue;
    }
    if (classification == "public-candidate") exported++; else reviewedExported++;
    var entry = found.Component with { Classification = classification };
    components.Add($"{package}::{entry.Type}", entry);
}

Console.WriteLine($"CLR metadata #494: {total} source candidates, {exported} public-candidate CLR exports, {reviewedExported} review CLR exports, {missing} missing/ambiguous/hidden");
if (missing != 0) return 1;
var contract = new ApiContract("Declared CLR API baseline only; inherited members summarized by base type, not flattened; no runtime/AT certification", components);
string expected = JsonSerializer.Serialize(contract, new JsonSerializerOptions { WriteIndented = true }) + "\n";
if (write)
{
    Directory.CreateDirectory(Path.GetDirectoryName(contractsPath)!);
    File.WriteAllText(contractsPath, expected);
    Console.WriteLine($"WROTE contract: {components.Count} components, {components.Values.Sum(c => c.Properties.Count)} declared properties, {components.Values.Sum(c => c.Methods.Count)} declared public methods, {components.Values.Sum(c => c.Fields.Count)} declared public fields. {contractsPath}");
    return 0;
}
if (!File.Exists(contractsPath))
{
    Console.Error.WriteLine("MISSING contract snapshot. Review metadata output and explicitly run --write-contracts.");
    return 1;
}
string observed = File.ReadAllText(contractsPath).Replace("\r\n", "\n", StringComparison.Ordinal);
using var beforeDocument = JsonDocument.Parse(observed);
using var expectedDocument = JsonDocument.Parse(expected);
if (!JsonElement.DeepEquals(beforeDocument.RootElement, expectedDocument.RootElement))
{
    var actual = JsonSerializer.Deserialize<ApiContract>(observed);
    var before = actual?.Components ?? new SortedDictionary<string, ApiComponent>(StringComparer.Ordinal);
    var removed = before.Keys.Except(components.Keys, StringComparer.Ordinal).ToList();
    var added = components.Keys.Except(before.Keys, StringComparer.Ordinal).ToList();
    var changed = components.Keys.Intersect(before.Keys, StringComparer.Ordinal)
        .Where(k => !JsonElement.DeepEquals(JsonSerializer.SerializeToElement(components[k]), JsonSerializer.SerializeToElement(before[k])))
        .ToList();
    Console.Error.WriteLine($"BREAKING/UNREVIEWED component contract drift: -{removed.Count}, +{added.Count}, changed={changed.Count}");
    foreach (var key in removed.Take(8)) Console.Error.WriteLine("  REMOVED " + key);
    foreach (var key in added.Take(8)) Console.Error.WriteLine("  ADDED " + key);
    foreach (var key in changed.Take(12))
    {
        Console.Error.WriteLine("  CHANGED " + key);
        var oldProps = before[key].Properties;
        var newProps = components[key].Properties;
        foreach (var prop in oldProps.Keys.Union(newProps.Keys).OrderBy(p => p, StringComparer.Ordinal)
                     .Where(prop => oldProps.GetValueOrDefault(prop) != newProps.GetValueOrDefault(prop)).Take(7))
            Console.Error.WriteLine($"    {prop}: {oldProps.GetValueOrDefault(prop, "<absent>")} => {newProps.GetValueOrDefault(prop, "<absent>")}");
    }
    Console.Error.WriteLine("Do NOT silently regenerate snapshot; review as a deliberate migration/API decision first.");
    return 1;
}
Console.WriteLine($"API contract PASS: {components.Count} fully qualified public CLR types, {components.Values.Sum(c => c.Properties.Count)} declared public properties, {components.Values.Sum(c => c.Methods.Count)} declared public methods, {components.Values.Sum(c => c.Fields.Count)} declared public fields.");
return 0;

Dictionary<string, List<(bool Public, bool Abstract, ApiComponent Component)>> ReadPackage(string package)
{
    string dllPath = Path.Combine(root, "src", package, "bin", "Release", "net10.0", package + ".dll");
    if (!File.Exists(dllPath)) throw new FileNotFoundException("Build all four component packages first", dllPath);
    using var stream = File.OpenRead(dllPath);
    using var pe = new PEReader(stream);
    var reader = pe.GetMetadataReader();
    var result = new Dictionary<string, List<(bool Public, bool Abstract, ApiComponent Component)>>(StringComparer.Ordinal);
    foreach (var handle in reader.TypeDefinitions)
    {
        var type = reader.GetTypeDefinition(handle);
        string name = reader.GetString(type.Name);
        string fullName = ApiSignatureProvider.Join(reader.GetString(type.Namespace), name);
        bool isPublic = (type.Attributes & TypeAttributes.VisibilityMask) == TypeAttributes.Public;
        string baseName = TypeName(type.BaseType);
        var properties = new SortedDictionary<string, string>(StringComparer.Ordinal);
        var methods = new SortedSet<string>(StringComparer.Ordinal);
        var fields = new SortedDictionary<string, string>(StringComparer.Ordinal);
        if (isPublic)
        {
            foreach (var ph in type.GetProperties())
            {
                var prop = reader.GetPropertyDefinition(ph);
                var access = prop.GetAccessors();
                bool readPublic = IsPublic(access.Getter), writePublic = IsPublic(access.Setter);
                if (!readPublic && !writePublic) continue;
                var signature = prop.DecodeSignature(provider, null);
                string kind = string.Join(",", prop.GetCustomAttributes().Select(AttributeName)
                    .Where(a => a is "ParameterAttribute" or "CascadingParameterAttribute" or "SupplyParameterFromQueryAttribute" or "EditorRequiredAttribute")
                    .Distinct(StringComparer.Ordinal).OrderBy(a => a, StringComparer.Ordinal));
                string indexer = signature.ParameterTypes.Length == 0 ? "" : $"[{string.Join(",", signature.ParameterTypes)}]";
                properties[reader.GetString(prop.Name) + indexer] =
                    $"{signature.ReturnType} | get={readPublic} set={writePublic} | {kind}";
            }
            foreach (var mh in type.GetMethods())
            {
                var method = reader.GetMethodDefinition(mh);
                if ((method.Attributes & MethodAttributes.MemberAccessMask) != MethodAttributes.Public ||
                    (method.Attributes & MethodAttributes.SpecialName) != 0) continue;
                var signature = method.DecodeSignature(provider, null);
                methods.Add($"{reader.GetString(method.Name)}({string.Join(",", signature.ParameterTypes)}):{signature.ReturnType} | generic={signature.GenericParameterCount}");
            }
            foreach (var fh in type.GetFields())
            {
                var field = reader.GetFieldDefinition(fh);
                if ((field.Attributes & FieldAttributes.FieldAccessMask) != FieldAttributes.Public) continue;
                fields[reader.GetString(field.Name)] = field.DecodeSignature(provider, null);
            }
        }
        var item = new ApiComponent(package, fullName, "", baseName, (type.Attributes & TypeAttributes.Abstract) != 0, properties, methods.ToList(), fields);
        string simpleName = name.Split((char)96)[0];
        if (!result.TryGetValue(simpleName, out var list))
        {
            list = [];
            result.Add(simpleName, list);
        }
        list.Add((isPublic, (type.Attributes & TypeAttributes.Abstract) != 0, item));
    }
    return result;

    bool IsPublic(MethodDefinitionHandle handle) =>
        !handle.IsNil && (reader.GetMethodDefinition(handle).Attributes & MethodAttributes.MemberAccessMask) == MethodAttributes.Public;
    string TypeName(EntityHandle handle) => handle.IsNil ? "none" : handle.Kind switch
    {
        HandleKind.TypeDefinition => provider.GetTypeFromDefinition(reader, (TypeDefinitionHandle)handle, 0),
        HandleKind.TypeReference => provider.GetTypeFromReference(reader, (TypeReferenceHandle)handle, 0),
        HandleKind.TypeSpecification => provider.GetTypeFromSpecification(reader, null, (TypeSpecificationHandle)handle, 0),
        _ => "none"
    };
    string AttributeName(CustomAttributeHandle handle)
    {
        var attr = reader.GetCustomAttribute(handle);
        EntityHandle declaring = attr.Constructor.Kind switch
        {
            HandleKind.MemberReference => reader.GetMemberReference((MemberReferenceHandle)attr.Constructor).Parent,
            HandleKind.MethodDefinition => reader.GetMethodDefinition((MethodDefinitionHandle)attr.Constructor).GetDeclaringType(),
            _ => default
        };
        return TypeName(declaring).Split('.').Last();
    }
}

internal sealed record ApiComponent(
    string Package, string Type, string Classification, string BaseType, bool IsAbstract,
    SortedDictionary<string,string> Properties, List<string> Methods, SortedDictionary<string,string> Fields);
internal sealed record ApiContract(string Scope, SortedDictionary<string,ApiComponent> Components);
