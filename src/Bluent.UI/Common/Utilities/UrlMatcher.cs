using Microsoft.AspNetCore.Components.Routing;
using System.Diagnostics;

namespace Bluent.UI.Common.Utilities;

internal static class UrlMatcher
{
    public static bool ShouldMatch(NavLinkMatch match, string currentUriAbsolute, string? targetUriAbsolute)
    {
        if (targetUriAbsolute == null)
        {
            return false;
        }

        if (EqualsHrefExactlyOrIfTrailingSlashAdded(currentUriAbsolute, targetUriAbsolute))
        {
            return true;
        }

        if (match == NavLinkMatch.Prefix && IsStrictlyPrefixWithSeparator(currentUriAbsolute, targetUriAbsolute))
        {
            return true;
        }

        return false;
    }
    private static bool EqualsHrefExactlyOrIfTrailingSlashAdded(string currentUriAbsolute, string? targetUriAbsolute)
    {
        Debug.Assert(targetUriAbsolute != null);

        if (string.Equals(currentUriAbsolute, targetUriAbsolute, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (currentUriAbsolute.Length == targetUriAbsolute.Length - 1)
        {
            // Special case: highlight links to http://host/path/ even if you're
            // at http://host/path (with no trailing slash)
            //
            // This is because the router accepts an absolute URI value of "same
            // as base URI but without trailing slash" as equivalent to "base URI",
            // which in turn is because it's common for servers to return the same page
            // for http://host/vdir as they do for host://host/vdir/ as it's no
            // good to display a blank page in that case.
            if (targetUriAbsolute[targetUriAbsolute.Length - 1] == '/'
                && targetUriAbsolute.StartsWith(currentUriAbsolute, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsStrictlyPrefixWithSeparator(string value, string prefix)
    {
        var prefixLength = prefix.Length;
        if (value.Length > prefixLength)
        {
            return value.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
                && (
                    // Only match when there's a separator character either at the end of the
                    // prefix or right after it.
                    // Example: "/abc" is treated as a prefix of "/abc/def" but not "/abcdef"
                    // Example: "/abc/" is treated as a prefix of "/abc/def" but not "/abcdef"
                    prefixLength == 0
                    || !IsUnreservedCharacter(prefix[prefixLength - 1])
                    || !IsUnreservedCharacter(value[prefixLength])
                );
        }
        else
        {
            return false;
        }
    }

    private static bool IsUnreservedCharacter(char c)
    {
        // Checks whether it is an unreserved character according to 
        // https://datatracker.ietf.org/doc/html/rfc3986#section-2.3
        // Those are characters that are allowed in a URI but do not have a reserved
        // purpose (e.g. they do not separate the components of the URI)
        return char.IsLetterOrDigit(c) ||
                c == '-' ||
                c == '.' ||
                c == '_' ||
                c == '~';
    }
}
