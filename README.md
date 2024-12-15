# Welcome to Bluent.UI
Bluent.UI is a Fluent UI styled component library for Blazor!

It contains lots of components, like Buttons, Input field, Drop downs, Dialog, Popover, Tooltip, Cards, and lots more.\
To get started, add it to your project from nuget:

`dotnet add package Bluent.UI`

Then add it to your services:

`services.AddBluentUIAsScoped();`

Add `<Containers />` component to the end of your Layout file.
And make sure the following CSS files are linked to your index.html:

    <link href="_content/Bluent.UI/bluent.ui.theme.default.min.css" rel="stylesheet" />
    <link href="_content/Bluent.UI/bluent.ui.components.min.css" rel="stylesheet" />
    
Now you can have fun.\
For more details, see the Demo app.