using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

public class ConnectorRouter
{
    #region Public API

    public virtual void RouteConnector(IDiagramConnector connector,
        double stubLength = 20.0,
        double obstaclePadding = 10.0,
        double gridSize = 0)
    {
        Boundary? sourceBoundary = null;
        Boundary? targetBoundary = null;
        if (connector.SourceElement is IDiagramElement sourceElement)
            sourceBoundary = sourceElement.Boundary;

        if (connector.TargetElement is IDiagramElement targetElement)
            targetBoundary = targetElement.Boundary;

        if (sourceBoundary is null)
            return;

        if (targetBoundary is null)
        {
            // Create a temp boundary
            // align it a way that connector end marker look appropriate
            const int size = 2;
            var dx = connector.End.X - connector.Start.X;
            var dy = connector.End.Y - connector.Start.Y;

            var endEdge = Edges.Left;
            if (Math.Abs(dx) > Math.Abs(dy))
            {
                // left or right
                if (dx < 0)
                    endEdge = Edges.Right;
                else
                    endEdge = Edges.Left;
            }
            else
            {
                // top or bottom
                if (dy < 0)
                    endEdge = Edges.Bottom;
                else
                    endEdge = Edges.Top;
            }

            targetBoundary = endEdge switch
            {
                Edges.Left => new Boundary(connector.End.X, connector.End.Y - size / 2, size, size),

                Edges.Top => new Boundary(connector.End.X - size / 2, connector.End.Y, size, size),

                Edges.Right => new Boundary(connector.End.X - size, connector.End.Y - size / 2, size, size),

                _ => new Boundary(connector.End.X - size / 2, connector.End.Y - size, size, size)
            };
        }

        var sourceEdge = GetNearestEdge(sourceBoundary, connector.Start);
        var targetEdge = GetNearestEdge(targetBoundary, connector.End);

        List<DiagramPoint> points = GetRoute(sourceBoundary,
            sourceEdge,
            connector.Start,
            targetBoundary,
            targetEdge,
            connector.End,
            [sourceBoundary, targetBoundary],
            stubLength,
            obstaclePadding,
            gridSize);

        connector.SetWayPoints(points.Count > 2 ? points.GetRange(1, points.Count - 2) : []);
    }


    /// <summary>
    /// Calculates an orthogonal route between two elements, with optional obstacle avoidance.
    /// </summary>
    /// <param name="sourceBoundary">The boundary of the source shape.</param>
    /// <param name="sourceEdge">The edge on the source shape from which the connector leaves.</param>
    /// <param name="start">An optional, specific start point. If null, it's calculated from the source edge.</param>
    /// <param name="targetBoundary">The boundary of the target shape.</param>
    /// <param name="targetEdge">The edge on the target shape to which the connector arrives.</param>
    /// <param name="end">An optional, specific end point. If null, it's calculated from the target edge.</param>
    /// <param name="obstacles">A list of all other elements on the diagram to be avoided.</param>
    /// <param name="stubLength">The minimum length of the initial and final segments of the connector.</param>
    /// <param name="obstaclePadding">The clearance margin around obstacles.</param>
    /// <param name="gridSize">Reserved for compatibility with existing callers.</param>
    /// <returns>A list of DiagramPoint objects that define the connector's path.</returns>
    public List<DiagramPoint> GetRoute(
        Boundary sourceBoundary, Edges sourceEdge, DiagramPoint? start,
        Boundary targetBoundary, Edges targetEdge, DiagramPoint? end,
        Boundary[]? obstacles = null,
        double stubLength = 20.0,
        double obstaclePadding = 10.0,
        double gridSize = 10.0)
    {
        var startPoint = start ?? GetAttachmentPoint(sourceBoundary, sourceEdge);
        var endPoint = end ?? GetAttachmentPoint(targetBoundary, targetEdge);

        return GetOrthogonalRoute(
            sourceBoundary,
            sourceEdge,
            startPoint,
            targetBoundary,
            targetEdge,
            endPoint,
            obstacles,
            obstaclePadding,
            stubLength);
    }

    #endregion

    #region Protected Virtual API

    protected virtual Edges GetNearestEdge(Boundary boundary, DiagramPoint point)
    {
        return boundary.GetNearestEdge(point);
    }

    #endregion

    #region Orthogonal Router

    private static List<DiagramPoint> GetOrthogonalRoute(
        Boundary sourceBoundary,
        Edges sourceEdge,
        DiagramPoint startPoint,
        Boundary targetBoundary,
        Edges targetEdge,
        DiagramPoint endPoint,
        Boundary[]? obstacles,
        double obstaclePadding,
        double stubLength)
    {
        var firstWaypoint = GetStubEndPoint(startPoint, sourceEdge, stubLength);
        var secondWaypoint = GetStubEndPoint(endPoint, targetEdge, stubLength);
        var paddedObstacles = GetPaddedObstacles(sourceBoundary, targetBoundary, obstacles, obstaclePadding, stubLength);

        var preferredPath = BuildRoute(
            startPoint,
            firstWaypoint,
            GetIntermediatePoints(firstWaypoint, sourceEdge, secondWaypoint, targetEdge),
            secondWaypoint,
            endPoint);

        if (IsRouteBodyClear(preferredPath, paddedObstacles))
            return SimplifyPath(preferredPath, firstWaypoint, secondWaypoint);

        var visibilityPath = GetVisibilityRoute(firstWaypoint, sourceEdge, secondWaypoint, targetEdge, paddedObstacles);
        if (visibilityPath.Count > 0)
        {
            var fullPath = new List<DiagramPoint> { startPoint, firstWaypoint };
            AddOrthogonalPath(fullPath, visibilityPath.Skip(1));
            AddOrthogonalPoint(fullPath, secondWaypoint);
            fullPath.Add(endPoint);
            return SimplifyPath(fullPath, firstWaypoint, secondWaypoint);
        }

        return SimplifyPath(preferredPath, firstWaypoint, secondWaypoint);
    }

    private static List<DiagramPoint> BuildRoute(
        DiagramPoint startPoint,
        DiagramPoint firstWaypoint,
        IEnumerable<DiagramPoint> intermediatePoints,
        DiagramPoint secondWaypoint,
        DiagramPoint endPoint)
    {
        var fullPath = new List<DiagramPoint> { startPoint, firstWaypoint };
        AddOrthogonalPath(fullPath, intermediatePoints);
        AddOrthogonalPoint(fullPath, secondWaypoint);
        fullPath.Add(endPoint);
        return fullPath;
    }

    private static List<DiagramPoint> GetIntermediatePoints(DiagramPoint p1, Edges edge1, DiagramPoint p2, Edges edge2)
    {
        var points = new List<DiagramPoint>();

        if (AreVerticalEdges(edge1, edge2))
        {
            if (edge1 == edge2)
            {
                points.Add(new DiagramPoint(p1.X, p2.Y));
            }
            else
            {
                var middleY = (p1.Y + p2.Y) / 2;
                points.Add(new DiagramPoint(p1.X, middleY));
                points.Add(new DiagramPoint(p2.X, middleY));
            }
        }
        else if (AreHorizontalEdges(edge1, edge2))
        {
            if (edge1 == edge2)
            {
                points.Add(new DiagramPoint(p2.X, p1.Y));
            }
            else
            {
                var middleX = (p1.X + p2.X) / 2;
                points.Add(new DiagramPoint(middleX, p1.Y));
                points.Add(new DiagramPoint(middleX, p2.Y));
            }
        }
        else if (IsVerticalEdge(edge1))
        {
            points.Add(new DiagramPoint(p1.X, p2.Y));
        }
        else
        {
            points.Add(new DiagramPoint(p2.X, p1.Y));
        }

        return points;
    }

    private sealed class VisibilityNode(DiagramPoint point)
    {
        public DiagramPoint Point { get; } = point;
        public VisibilityNode? Parent { get; set; }
        public double Cost { get; set; } = double.PositiveInfinity;
    }

    private static List<Boundary> GetPaddedObstacles(
        Boundary sourceBoundary,
        Boundary targetBoundary,
        Boundary[]? obstacles,
        double obstaclePadding,
        double stubLength)
    {
        var allObstacles = obstacles?.Distinct().ToList() ?? [];
        if (!allObstacles.Contains(sourceBoundary))
            allObstacles.Add(sourceBoundary);
        if (!allObstacles.Contains(targetBoundary))
            allObstacles.Add(targetBoundary);

        var padding = Math.Max(0, obstaclePadding);
        var endpointPadding = Math.Min(padding, Math.Max(0, stubLength));
        var endpointBoundaries = new[] { sourceBoundary, targetBoundary };

        return allObstacles
            .Select(o => Inflate(o, endpointBoundaries.Contains(o) ? endpointPadding : padding))
            .ToList();
    }

    private static Boundary Inflate(Boundary boundary, double padding)
    {
        return new Boundary(
            boundary.X - padding,
            boundary.Y - padding,
            boundary.Width + padding * 2,
            boundary.Height + padding * 2);
    }

    private static bool IsRouteBodyClear(IReadOnlyList<DiagramPoint> route, IReadOnlyList<Boundary> obstacles)
    {
        for (var i = 1; i < route.Count - 2; i++)
        {
            if (IsSegmentBlocked(route[i], route[i + 1], obstacles))
                return false;
        }

        return true;
    }

    private static List<DiagramPoint> GetVisibilityRoute(
        DiagramPoint start,
        Edges sourceEdge,
        DiagramPoint end,
        Edges targetEdge,
        IReadOnlyList<Boundary> obstacles)
    {
        var xCoordinates = new SortedSet<double> { start.X, end.X };
        var yCoordinates = new SortedSet<double> { start.Y, end.Y };

        foreach (var obstacle in obstacles)
        {
            xCoordinates.Add(obstacle.X);
            xCoordinates.Add(obstacle.Right);
            yCoordinates.Add(obstacle.Y);
            yCoordinates.Add(obstacle.Bottom);
        }

        var nodes = new Dictionary<DiagramPoint, VisibilityNode>();
        foreach (var x in xCoordinates)
        {
            foreach (var y in yCoordinates)
            {
                var point = new DiagramPoint(x, y);
                if (AreSamePoint(point, start) || AreSamePoint(point, end) || !IsInsideAnyObstacle(point, obstacles))
                    nodes[point] = new VisibilityNode(point);
            }
        }

        if (!nodes.TryGetValue(start, out var startNode) || !nodes.TryGetValue(end, out var endNode))
            return [];

        var queue = new PriorityQueue<VisibilityNode, double>();
        startNode.Cost = 0;
        queue.Enqueue(startNode, 0);

        while (queue.Count > 0)
        {
            var node = queue.Dequeue();
            if (node == endNode)
                return ReconstructVisibilityPath(endNode);

            foreach (var neighbor in GetVisibleNeighbors(
                         node,
                         nodes,
                         xCoordinates,
                         yCoordinates,
                         start,
                         sourceEdge,
                         end,
                         targetEdge,
                         obstacles))
            {
                var cost = node.Cost + GetOrthogonalDistance(node.Point, neighbor.Point);
                if (cost >= neighbor.Cost)
                    continue;

                neighbor.Cost = cost;
                neighbor.Parent = node;
                queue.Enqueue(neighbor, cost);
            }
        }

        return [];
    }

    private static IEnumerable<VisibilityNode> GetVisibleNeighbors(
        VisibilityNode node,
        IReadOnlyDictionary<DiagramPoint, VisibilityNode> nodes,
        SortedSet<double> xCoordinates,
        SortedSet<double> yCoordinates,
        DiagramPoint start,
        Edges sourceEdge,
        DiagramPoint end,
        Edges targetEdge,
        IReadOnlyList<Boundary> obstacles)
    {
        foreach (var x in GetAdjacentCoordinates(xCoordinates, node.Point.X))
        {
            var point = new DiagramPoint(x, node.Point.Y);
            if (CanUseVisibilitySegment(node.Point, point, start, sourceEdge, end, targetEdge, obstacles) &&
                nodes.TryGetValue(point, out var neighbor))
                yield return neighbor;
        }

        foreach (var y in GetAdjacentCoordinates(yCoordinates, node.Point.Y))
        {
            var point = new DiagramPoint(node.Point.X, y);
            if (CanUseVisibilitySegment(node.Point, point, start, sourceEdge, end, targetEdge, obstacles) &&
                nodes.TryGetValue(point, out var neighbor))
                yield return neighbor;
        }
    }

    private static bool CanUseVisibilitySegment(
        DiagramPoint from,
        DiagramPoint to,
        DiagramPoint start,
        Edges sourceEdge,
        DiagramPoint end,
        Edges targetEdge,
        IReadOnlyList<Boundary> obstacles)
    {
        if (AreSamePoint(from, start) && IsMovingInEdgeDirection(from, to, GetOppositeEdge(sourceEdge)))
            return false;

        if (AreSamePoint(to, end) && IsMovingInEdgeDirection(from, to, targetEdge))
            return false;

        return !IsSegmentBlocked(from, to, obstacles);
    }

    private static IEnumerable<double> GetAdjacentCoordinates(SortedSet<double> coordinates, double value)
    {
        var lower = coordinates.GetViewBetween(double.NegativeInfinity, value).Reverse().Skip(1).FirstOrDefault(double.NaN);
        if (!double.IsNaN(lower))
            yield return lower;

        var upper = coordinates.GetViewBetween(value, double.PositiveInfinity).Skip(1).FirstOrDefault(double.NaN);
        if (!double.IsNaN(upper))
            yield return upper;
    }

    private static List<DiagramPoint> ReconstructVisibilityPath(VisibilityNode endNode)
    {
        var path = new List<DiagramPoint>();
        var current = endNode;
        while (current != null)
        {
            path.Add(current.Point);
            current = current.Parent;
        }

        path.Reverse();
        return path;
    }

    private static bool IsInsideAnyObstacle(DiagramPoint point, IEnumerable<Boundary> obstacles)
    {
        return obstacles.Any(o =>
            point.X > o.X + Tolerance &&
            point.X < o.Right - Tolerance &&
            point.Y > o.Y + Tolerance &&
            point.Y < o.Bottom - Tolerance);
    }

    private static bool IsSegmentBlocked(
        DiagramPoint start,
        DiagramPoint end,
        IEnumerable<Boundary> obstacles)
    {
        if (AreSamePoint(start, end))
            return false;

        return obstacles.Any(o => SegmentIntersectsInterior(start, end, o));
    }

    private static bool SegmentIntersectsInterior(DiagramPoint start, DiagramPoint end, Boundary obstacle)
    {
        if (AreSameY(start, end))
        {
            var y = start.Y;
            if (y <= obstacle.Y + Tolerance || y >= obstacle.Bottom - Tolerance)
                return false;

            var minX = Math.Min(start.X, end.X);
            var maxX = Math.Max(start.X, end.X);
            return minX < obstacle.Right - Tolerance && maxX > obstacle.X + Tolerance;
        }

        if (AreSameX(start, end))
        {
            var x = start.X;
            if (x <= obstacle.X + Tolerance || x >= obstacle.Right - Tolerance)
                return false;

            var minY = Math.Min(start.Y, end.Y);
            var maxY = Math.Max(start.Y, end.Y);
            return minY < obstacle.Bottom - Tolerance && maxY > obstacle.Y + Tolerance;
        }

        return true;
    }

    private static double GetOrthogonalDistance(DiagramPoint a, DiagramPoint b)
    {
        return Math.Abs(a.X - b.X) + Math.Abs(a.Y - b.Y);
    }

    #endregion

    #region Shared Helpers

    private static DiagramPoint GetAttachmentPoint(Boundary boundary, Edges edge)
    {
        return edge switch
        {
            Edges.Left => new DiagramPoint(boundary.X, boundary.Cy),
            Edges.Right => new DiagramPoint(boundary.Right, boundary.Cy),
            Edges.Top => new DiagramPoint(boundary.Cx, boundary.Y),
            Edges.Bottom => new DiagramPoint(boundary.Cx, boundary.Bottom),
            _ => boundary.Center,
        };
    }

    private static DiagramPoint GetStubEndPoint(DiagramPoint point, Edges edge, double length)
    {
        return edge switch
        {
            Edges.Left => point with { X = point.X - length },
            Edges.Right => point with { X = point.X + length },
            Edges.Top => point with { Y = point.Y - length },
            Edges.Bottom => point with { Y = point.Y + length },
            _ => point,
        };
    }

    private static bool AreVerticalEdges(Edges edge1, Edges edge2) => IsVerticalEdge(edge1) && IsVerticalEdge(edge2);

    private static bool AreHorizontalEdges(Edges edge1, Edges edge2) =>
        IsHorizontalEdge(edge1) && IsHorizontalEdge(edge2);

    private static bool IsVerticalEdge(Edges edge) => edge is Edges.Top or Edges.Bottom;

    private static bool IsHorizontalEdge(Edges edge) => edge is Edges.Left or Edges.Right;

    private static Edges GetOppositeEdge(Edges edge)
    {
        return edge switch
        {
            Edges.Left => Edges.Right,
            Edges.Right => Edges.Left,
            Edges.Top => Edges.Bottom,
            Edges.Bottom => Edges.Top,
            _ => edge,
        };
    }

    private static bool IsMovingInEdgeDirection(DiagramPoint from, DiagramPoint to, Edges edge)
    {
        return edge switch
        {
            Edges.Left => AreSameY(from, to) && to.X < from.X - Tolerance,
            Edges.Right => AreSameY(from, to) && to.X > from.X + Tolerance,
            Edges.Top => AreSameX(from, to) && to.Y < from.Y - Tolerance,
            Edges.Bottom => AreSameX(from, to) && to.Y > from.Y + Tolerance,
            _ => false,
        };
    }

    private static void AddOrthogonalPath(List<DiagramPoint> path, IEnumerable<DiagramPoint> points)
    {
        foreach (var point in points)
        {
            AddOrthogonalPoint(path, point);
        }
    }

    private static void AddOrthogonalPoint(List<DiagramPoint> path, DiagramPoint point)
    {
        if (path.Count == 0)
        {
            path.Add(point);
            return;
        }

        var last = path.Last();
        if (AreSamePoint(last, point))
            return;

        if (!AreOrthogonal(last, point))
        {
            var corner = new DiagramPoint(point.X, last.Y);
            if (!AreSamePoint(last, corner) && !AreSamePoint(corner, point))
                path.Add(corner);
        }

        path.Add(point);
    }

    private static List<DiagramPoint> SimplifyPath(List<DiagramPoint> path, params DiagramPoint[] protectedPoints)
    {
        if (path.Count < 3) return path;
        var protectedPointSet = protectedPoints.ToHashSet();
        var simplified = new List<DiagramPoint> { path[0] };
        for (int i = 1; i < path.Count - 1; i++)
        {
            var p_prev = simplified.Last();
            var p_curr = path[i];
            var p_next = path[i + 1];
            bool isCollinear =
                (AreSameX(p_prev, p_curr) && AreSameX(p_curr, p_next)) ||
                (AreSameY(p_prev, p_curr) && AreSameY(p_curr, p_next));
            if (!isCollinear || protectedPointSet.Contains(p_curr))
            {
                simplified.Add(p_curr);
            }
        }

        simplified.Add(path.Last());
        return simplified;
    }

    private static bool AreOrthogonal(DiagramPoint a, DiagramPoint b) => AreSameX(a, b) || AreSameY(a, b);

    private static bool AreSamePoint(DiagramPoint a, DiagramPoint b) => AreSameX(a, b) && AreSameY(a, b);

    private static bool AreSameX(DiagramPoint a, DiagramPoint b) => Math.Abs(a.X - b.X) < Tolerance;

    private static bool AreSameY(DiagramPoint a, DiagramPoint b) => Math.Abs(a.Y - b.Y) < Tolerance;

    private const double Tolerance = 1e-5;

    #endregion
}
