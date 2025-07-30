using System.ComponentModel;

namespace Bluent.UI.Diagrams.Elements.Diagram;

//public abstract class ElementContainerBase : DiagramNode
//{



//    public override void PointerMovingOutside()
//    {
//        if (_pointerDirectlyOnNode || _pointerIndirectlyOnNode)
//        {
//            _pointerDirectlyOnNode = false;
//            _pointerIndirectlyOnNode = false;
//            NotifyPropertyChanged();
//        }
//    }

//    public override void PointerMovingInside(DiagramPoint offsetPoint, bool direct)
//    {
//        if (direct && !_pointerDirectlyOnNode)
//        {
//            _pointerDirectlyOnNode = true;
//            _pointerIndirectlyOnNode = false;
//            NotifyPropertyChanged();
//        }
//        else if (!direct && !_pointerIndirectlyOnNode)
//        {
//            _pointerDirectlyOnNode = false;
//            _pointerIndirectlyOnNode = true;
//            NotifyPropertyChanged();
//        }
//    }

//    public override void SetDrag(Distance2D drag)
//    {
//        foreach (var el in DiagramElements)
//        {
//            el.SetDrag(drag);
//        }

//        base.SetDrag(drag);
//    }

//    public override void CancelDrag()
//    {
//        foreach (var el in DiagramElements)
//        {
//            el.CancelDrag();
//        }

//        base.CancelDrag();
//    }

//    public override void ApplyDrag()
//    {
//        foreach (var el in DiagramElements)
//        {
//            el.ApplyDrag();
//        }

//        base.ApplyDrag();
//    }

//}
