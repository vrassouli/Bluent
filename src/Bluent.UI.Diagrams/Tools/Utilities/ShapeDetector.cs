using Bluent.UI.Diagrams.Elements;

namespace Bluent.UI.Diagrams.Tools.Utilities;

public class ShapeDetector
{
    // --- Configuration Thresholds ---
    private const double ClosedShapeThreshold = 0.25;
    private const double LineStraightnessThreshold = 1.20;
    private const double RectangleAlignmentThreshold = 0.70;

    /// <summary>
    /// Lenient aspect ratio to allow ellipse-like shapes to be considered circles.
    /// </summary>
    private const double CircleAspectRatioThreshold = 1.65;

    /// <summary>
    /// A guard to reject angular shapes. A circle's path is ~78.5% of its bounding box
    /// perimeter, while a diamond's is ~100%. Anything over 91% is likely not a circle.
    /// </summary>
    private const double CirclePerimeterFillCeiling = 0.91;

    private readonly IReadOnlyList<DiagramPoint> _points;
    private readonly int _pointCount;

    public ShapeDetector(IReadOnlyList<DiagramPoint> points)
    {
        _points = points ?? new List<DiagramPoint>();
        _pointCount = _points.Count;
    }

    public ShapeDetectionResult Detect()
    {
        if (_pointCount < 2)
        {
            var point = _pointCount == 1 ? _points[0] : new DiagramPoint(0, 0);
            return new ShapeDetectionResult(CommonShapes.Unknown, point, point, point);
        }

        var startPoint = _points[0];
        var endPoint = _points[_pointCount - 1];
        var box = GetBoundingBox();
        var centerPoint = new DiagramPoint(box.minX + box.width / 2, box.minY + box.height / 2);

        var pathLength = GetPathLength();
        if (pathLength == 0)
        {
            return new ShapeDetectionResult(CommonShapes.Unknown, startPoint, endPoint, centerPoint);
        }

        var startEndDistance = GetDistance(startPoint, endPoint);
        bool isClosed = (startEndDistance / pathLength) < ClosedShapeThreshold;

        if (!isClosed)
        {
            if (startEndDistance > 0)
            {
                double straightness = pathLength / startEndDistance;
                if (straightness < LineStraightnessThreshold)
                    return new ShapeDetectionResult(CommonShapes.Line, startPoint, endPoint, centerPoint);
            }
        }
        else // --- Logic for Closed Shapes (Restored to the most reliable order) ---
        {
            if (box.width <= 0 || box.height <= 0)
                return new ShapeDetectionResult(CommonShapes.Unknown, startPoint, endPoint, centerPoint);

            // 1. Check for Rectangle first, as it's the most distinct.
            if (IsRectangle())
            {
                return new ShapeDetectionResult(CommonShapes.Rectangle, startPoint, endPoint, centerPoint);
            }

            // 2. Check for Circle/Ellipse, using a smarter check that rejects diamonds.
            if (IsCircle(box, pathLength))
            {
                return new ShapeDetectionResult(CommonShapes.Circle, startPoint, endPoint, centerPoint);
            }

            // 3. If it's a closed shape that isn't a rectangle or a circle, it must be a diamond.
            return new ShapeDetectionResult(CommonShapes.Diamond, startPoint, endPoint, centerPoint);
        }

        return new ShapeDetectionResult(CommonShapes.Unknown, startPoint, endPoint, centerPoint);
    }

    // --- Helper methods ---

    private bool IsRectangle()
    {
        int alignedSegments = 0;
        const double angleTolerance = Math.PI / 9; // 20 degrees

        for (int i = 0; i < _pointCount - 1; i++)
        {
            var p1 = _points[i];
            var p2 = _points[i + 1];
            double angle = Math.Atan2(p2.Y - p1.Y, p2.X - p1.X);
            double absAngle = Math.Abs(angle);

            if (absAngle < angleTolerance ||
                Math.Abs(absAngle - Math.PI) < angleTolerance ||
                Math.Abs(absAngle - Math.PI / 2) < angleTolerance)
            {
                alignedSegments++;
            }
        }
        return (_pointCount > 1) && ((double)alignedSegments / (_pointCount - 1) > RectangleAlignmentThreshold);
    }

    private bool IsCircle((double minX, double minY, double maxX, double maxY, double width, double height) box, double pathLength)
    {
        // Guard 1: Reject shapes that are too "full" in their bounding box (i.e., diamonds).
        double boxPerimeter = 2 * (box.width + box.height);
        if (boxPerimeter == 0) return false;
        double perimeterFillRatio = pathLength / boxPerimeter;
        if (perimeterFillRatio > CirclePerimeterFillCeiling)
        {
            return false;
        }

        // Guard 2: Allow for a non-perfect aspect ratio (for ellipses).
        double aspectRatio = box.width / box.height;
        if (aspectRatio > CircleAspectRatioThreshold || aspectRatio < 1 / CircleAspectRatioThreshold)
        {
            return false;
        }

        return true;
    }

    private double GetPathLength()
    {
        double length = 0;
        for (int i = 0; i < _pointCount - 1; i++)
        {
            length += GetDistance(_points[i], _points[i + 1]);
        }
        return length;
    }

    private (double minX, double minY, double maxX, double maxY, double width, double height) GetBoundingBox()
    {
        double minX = _points[0].X, minY = _points[0].Y;
        double maxX = _points[0].X, maxY = _points[0].Y;

        for (int i = 1; i < _pointCount; i++)
        {
            minX = Math.Min(minX, _points[i].X);
            minY = Math.Min(minY, _points[i].Y);
            maxX = Math.Max(maxX, _points[i].X);
            maxY = Math.Max(maxY, _points[i].Y);
        }
        return (minX, minY, maxX, maxY, maxX - minX, maxY - minY);
    }

    private double GetDistance(DiagramPoint p1, DiagramPoint p2)
    {
        return Math.Sqrt(Math.Pow(p2.X - p1.X, 2) + Math.Pow(p2.Y - p1.Y, 2));
    }
}//public class ShapeDetector
 //{
 //    // --- Configuration Thresholds (Unchanged) ---
 //    private const double ClosedShapeThreshold = 0.25;
 //    private const double LineStraightnessThreshold = 1.20;
 //    private const double RectangleAlignmentThreshold = 0.70;
 //    private const double CircleAspectRatioThreshold = 1.65;
 //    private const double CircleFitThreshold = 0.25;
 //    private const double CirclePerimeterFillCeiling = 0.90;

//    private readonly IReadOnlyList<DiagramPoint> _points;
//    private readonly int _pointCount;

//    public ShapeDetector(IReadOnlyList<DiagramPoint> points)
//    {
//        _points = points ?? new List<DiagramPoint>();
//        _pointCount = _points.Count;
//    }

//    /// <summary>
//    /// Detects the shape and returns its properties.
//    /// </summary>
//    /// <returns>A ShapeDetectionResult record containing the shape, start, end, and center points.</returns>
//    public ShapeDetectionResult Detect()
//    {
//        // Handle edge cases with insufficient points
//        if (_pointCount < 2)
//        {
//            var point = _pointCount == 1 ? _points[0] : new DiagramPoint(0, 0);
//            return new ShapeDetectionResult(DetectedShape.Unknown, point, point, point);
//        }

//        // Define start, end, and center points for all return paths
//        var startPoint = _points[0];
//        var endPoint = _points[_pointCount - 1];
//        var box = GetBoundingBox();
//        var centerPoint = new DiagramPoint(box.minX + box.width / 2, box.minY + box.height / 2);

//        var pathLength = GetPathLength();
//        if (pathLength == 0)
//        {
//            return new ShapeDetectionResult(DetectedShape.Unknown, startPoint, endPoint, centerPoint);
//        }

//        var startEndDistance = GetDistance(startPoint, endPoint);
//        bool isClosed = (startEndDistance / pathLength) < ClosedShapeThreshold;

//        if (!isClosed)
//        {
//            if (startEndDistance > 0)
//            {
//                double straightness = pathLength / startEndDistance;
//                if (straightness < LineStraightnessThreshold)
//                {
//                    return new ShapeDetectionResult(DetectedShape.Line, startPoint, endPoint, centerPoint);
//                }
//            }
//        }
//        else // Closed Shapes
//        {
//            if (box.width <= 0 || box.height <= 0)
//            {
//                return new ShapeDetectionResult(DetectedShape.Unknown, startPoint, endPoint, centerPoint);
//            }

//            if (IsCircle(box, pathLength))
//            {
//                return new ShapeDetectionResult(DetectedShape.Circle, startPoint, endPoint, centerPoint);
//            }

//            if (IsRectangle())
//            {
//                return new ShapeDetectionResult(DetectedShape.Rectangle, startPoint, endPoint, centerPoint);
//            }

//            return new ShapeDetectionResult(DetectedShape.Diamond, startPoint, endPoint, centerPoint);
//        }

//        return new ShapeDetectionResult(DetectedShape.Unknown, startPoint, endPoint, centerPoint);
//    }

//    // --- Helper methods are unchanged ---
//    private bool IsRectangle()
//    {
//        int alignedSegments = 0;
//        const double angleTolerance = Math.PI / 9;

//        for (int i = 0; i < _pointCount - 1; i++)
//        {
//            var p1 = _points[i];
//            var p2 = _points[i + 1];
//            double angle = Math.Atan2(p2.Y - p1.Y, p2.X - p1.X);
//            double absAngle = Math.Abs(angle);

//            if (absAngle < angleTolerance ||
//                Math.Abs(absAngle - Math.PI) < angleTolerance ||
//                Math.Abs(absAngle - Math.PI / 2) < angleTolerance)
//            {
//                alignedSegments++;
//            }
//        }

//        return (_pointCount > 1) && ((double)alignedSegments / (_pointCount - 1) > RectangleAlignmentThreshold);
//    }

//    private bool IsCircle((double minX, double minY, double maxX, double maxY, double width, double height) box, double pathLength)
//    {
//        double aspectRatio = box.width / box.height;
//        if (aspectRatio > CircleAspectRatioThreshold || aspectRatio < 1 / CircleAspectRatioThreshold) return false;

//        double boxPerimeter = 2 * (box.width + box.height);
//        double perimeterFillRatio = pathLength / boxPerimeter;
//        if (perimeterFillRatio > CirclePerimeterFillCeiling) return false;

//        var center = new DiagramPoint(box.minX + box.width / 2, box.minY + box.height / 2);
//        var distances = _points.Select(p => GetDistance(p, center)).ToList();
//        double averageRadius = distances.Average();
//        if (averageRadius == 0) return false;

//        double stdDev = Math.Sqrt(distances.Select(d => Math.Pow(d - averageRadius, 2)).Average());
//        return (stdDev / averageRadius) < CircleFitThreshold;
//    }

//    private double GetPathLength()
//    {
//        double length = 0;
//        for (int i = 0; i < _pointCount - 1; i++)
//        {
//            length += GetDistance(_points[i], _points[i + 1]);
//        }
//        return length;
//    }

//    private (double minX, double minY, double maxX, double maxY, double width, double height) GetBoundingBox()
//    {
//        double minX = _points[0].X, minY = _points[0].Y;
//        double maxX = _points[0].X, maxY = _points[0].Y;

//        for (int i = 1; i < _pointCount; i++)
//        {
//            minX = Math.Min(minX, _points[i].X);
//            minY = Math.Min(minY, _points[i].Y);
//            maxX = Math.Max(maxX, _points[i].X);
//            maxY = Math.Max(maxY, _points[i].Y);
//        }
//        return (minX, minY, maxX, maxY, maxX - minX, maxY - minY);
//    }

//    private double GetDistance(DiagramPoint p1, DiagramPoint p2)
//    {
//        return Math.Sqrt(Math.Pow(p2.X - p1.X, 2) + Math.Pow(p2.Y - p1.Y, 2));
//    }
//}