using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public class DialogConfiguration
{
    public DialogConfiguration(bool modal = true)
    {
        Modal = modal;
    }

    public bool Modal { get; }
}
