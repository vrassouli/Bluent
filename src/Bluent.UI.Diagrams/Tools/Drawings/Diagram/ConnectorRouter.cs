using Bluent.UI.Diagrams.Elements;
using Bluent.UI.Diagrams.Elements.Diagram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Diagrams.Tools.Drawings.Diagram;

internal static class ConnectorRouter
{
    #region Public API

    public static void RouteConnector(IDiagramConnector connector,
                                      double stubLength = 20.0,
                                      double obstaclePadding = 10.0,
                                      double gridSize = 10.0)
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
            targetBoundary = new Boundary(connector.End.X - 1, connector.End.Y, 2, 2);

        var sourceEdge = sourceBoundary.GetNearestEdge(connector.Start);
        var targetEdge = targetBoundary.GetNearestEdge(connector.End);

        List<DiagramPoint> points = ConnectorRouter.GetRoute(sourceBoundary,
                                                             sourceEdge,
                                                             connector.Start,
                                                             targetBoundary,
                                                             targetEdge,
                                                             connector.End,
                                                             [sourceBoundary, targetBoundary],
                                                             stubLength,
                                                             obstaclePadding,
                                                             gridSize);

        connector.SetWayPoints(points.GetRange(1, points.Count - 2));
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
    /// <param name="gridSize">The resolution of the pathfinding grid. Smaller is more precise but slower.</param>
    /// <returns>A list of DiagramPoint objects that define the connector's path.</returns>
    public static List<DiagramPoint> GetRoute(
        Boundary sourceBoundary, Edges sourceEdge, DiagramPoint? start,
        Boundary targetBoundary, Edges targetEdge, DiagramPoint? end,
        IEnumerable<Boundary>? obstacles = null,
        double stubLength = 20.0,
        double obstaclePadding = 10.0,
        double gridSize = 10.0)
    {
        var startPoint = start ?? GetAttachmentPoint(sourceBoundary, sourceEdge);
        var endPoint = end ?? GetAttachmentPoint(targetBoundary, targetEdge);

        // If there are no obstacles, use the fast, simple router.
        if (obstacles == null || !obstacles.Any())
        {
            return GetSimpleRoute(startPoint, sourceEdge, endPoint, targetEdge, stubLength);
        }

        // Otherwise, use the A* router for obstacle avoidance.
        return GetAStarRoute(startPoint, sourceEdge, endPoint, targetEdge, sourceBoundary, targetBoundary, obstacles, obstaclePadding, gridSize, stubLength);
    }

    #endregion

    #region Simple Heuristic Router (No Obstacles)

    private static List<DiagramPoint> GetSimpleRoute(
        DiagramPoint startPoint, Edges sourceEdge,
        DiagramPoint endPoint, Edges targetEdge,
        double stubLength)
    {
        var firstWaypoint = GetStubEndPoint(startPoint, sourceEdge, stubLength);
        var secondWaypoint = GetStubEndPoint(endPoint, targetEdge, stubLength);

        var intermediatePoints = GetIntermediatePoints(firstWaypoint, sourceEdge, secondWaypoint, targetEdge);

        var fullPath = new List<DiagramPoint> { startPoint, firstWaypoint };
        fullPath.AddRange(intermediatePoints);
        fullPath.Add(secondWaypoint);
        fullPath.Add(endPoint);

        return SimplifyPath(fullPath);
    }

    private static List<DiagramPoint> GetIntermediatePoints(DiagramPoint p1, Edges edge1, DiagramPoint p2, Edges edge2)
    {
        var points = new List<DiagramPoint>();
        bool isEdge1Horizontal = edge1 == Edges.Left || edge1 == Edges.Right;

        if (isEdge1Horizontal)
        {
            points.Add(new DiagramPoint(p1.X, p2.Y));
        }
        else
        {
            points.Add(new DiagramPoint(p2.X, p1.Y));
        }
        return points;
    }

    #endregion

    #region A* Pathfinding Router (With Obstacle Avoidance)

    /// <summary>
    /// Internal representation of a node in the A* pathfinding grid.
    /// </summary>
    private class PathNode
    {
        public int X { get; }
        public int Y { get; }
        public bool IsWalkable { get; set; }
        public PathNode? Parent { get; set; }
        public int GCost { get; set; } // Cost from the start node
        public int HCost { get; set; } // Heuristic cost to the end node
        public int FCost => GCost + HCost; // Total cost

        public PathNode(int x, int y, bool isWalkable)
        {
            X = x;
            Y = y;
            IsWalkable = isWalkable;
        }
    }

    private static List<DiagramPoint> GetAStarRoute(
        DiagramPoint startPoint, Edges sourceEdge,
        DiagramPoint endPoint, Edges targetEdge,
        Boundary sourceBoundary, Boundary targetBoundary,
        IEnumerable<Boundary> obstacles, double padding, double gridSize, double stubLength)
    {
        // Define the start and end points of the stubs. The A* will route between these.
        var stubStartPoint = GetStubEndPoint(startPoint, sourceEdge, stubLength);
        var stubEndPoint = GetStubEndPoint(endPoint, targetEdge, stubLength);

        // 1. Define the total area for the grid
        var allBounds = new List<Boundary>(obstacles) { sourceBoundary, targetBoundary };
        double minX = allBounds.Min(b => b.X) - padding * 2 - stubLength;
        double minY = allBounds.Min(b => b.Y) - padding * 2 - stubLength;
        double maxX = allBounds.Max(b => b.Right) + padding * 2 + stubLength;
        double maxY = allBounds.Max(b => b.Bottom) + padding * 2 + stubLength;

        var gridOrigin = new DiagramPoint(minX, minY);
        int gridWidth = (int)Math.Ceiling((maxX - minX) / gridSize);
        int gridHeight = (int)Math.Ceiling((maxY - minY) / gridSize);

        if (gridWidth <= 0 || gridHeight <= 0) return GetSimpleRoute(startPoint, sourceEdge, endPoint, targetEdge, stubLength); // Fallback

        // 2. Create the grid and mark obstacles
        var grid = new PathNode[gridWidth, gridHeight];
        var paddedObstacles = obstacles.Select(o => new Boundary(o.X - padding, o.Y - padding, o.Width + padding * 2, o.Height + padding * 2)).ToList();

        for (int x = 0; x < gridWidth; x++)
        {
            for (int y = 0; y < gridHeight; y++)
            {
                var worldPoint = new DiagramPoint(minX + x * gridSize + gridSize / 2, minY + y * gridSize + gridSize / 2);
                var nodeBoundary = new Boundary(worldPoint.X - gridSize / 2, worldPoint.Y - gridSize / 2, gridSize, gridSize);
                bool isWalkable = !paddedObstacles.Any(o => o.Intersects(nodeBoundary));
                grid[x, y] = new PathNode(x, y, isWalkable);
            }
        }

        // 3. Find start and end nodes on the grid (for the stubs)
        var startNode = GetNodeFromWorldPoint(stubStartPoint, gridOrigin, gridSize, gridWidth, gridHeight);
        var endNode = GetNodeFromWorldPoint(stubEndPoint, gridOrigin, gridSize, gridWidth, gridHeight);

        if (startNode == null || endNode == null) return GetSimpleRoute(startPoint, sourceEdge, endPoint, targetEdge, stubLength); // Fallback

        // Ensure start/end nodes are walkable
        grid[startNode.X, startNode.Y].IsWalkable = true;
        grid[endNode.X, endNode.Y].IsWalkable = true;

        // 4. Run A* Algorithm
        var openList = new List<PathNode> { grid[startNode.X, startNode.Y] };
        var closedList = new HashSet<PathNode>();

        while (openList.Count > 0)
        {
            var currentNode = openList.OrderBy(n => n.FCost).ThenBy(n => n.HCost).First();

            openList.Remove(currentNode);
            closedList.Add(currentNode);

            if (currentNode.X == endNode.X && currentNode.Y == endNode.Y)
            {
                // Path found: assemble the stubs and the A* path, then simplify.
                var aStarPath = ReconstructPath(currentNode, gridOrigin, gridSize);
                var fullPath = new List<DiagramPoint> { startPoint };
                fullPath.AddRange(aStarPath);
                fullPath.Add(endPoint);
                return SimplifyPath(fullPath);
            }

            foreach (var neighbor in GetNeighbors(currentNode, grid))
            {
                if (!neighbor.IsWalkable || closedList.Contains(neighbor)) continue;

                int newGCost = currentNode.GCost + 10; // Cost for orthogonal movement
                if (newGCost < neighbor.GCost || !openList.Contains(neighbor))
                {
                    neighbor.GCost = newGCost;
                    neighbor.HCost = Math.Abs(neighbor.X - endNode.X) + Math.Abs(neighbor.Y - endNode.Y); // Manhattan distance
                    neighbor.Parent = currentNode;

                    if (!openList.Contains(neighbor))
                    {
                        openList.Add(neighbor);
                    }
                }
            }
        }

        // Path not found, return a simple direct route as a fallback
        return GetSimpleRoute(startPoint, sourceEdge, endPoint, targetEdge, stubLength);
    }

    private static PathNode? GetNodeFromWorldPoint(DiagramPoint point, DiagramPoint origin, double gridSize, int width, int height)
    {
        int x = (int)Math.Round((point.X - origin.X) / gridSize);
        int y = (int)Math.Round((point.Y - origin.Y) / gridSize);
        if (x >= 0 && x < width && y >= 0 && y < height) return new PathNode(x, y, true);
        return null;
    }

    private static IEnumerable<PathNode> GetNeighbors(PathNode node, PathNode[,] grid)
    {
        var neighbors = new List<PathNode>();
        int w = grid.GetLength(0);
        int h = grid.GetLength(1);

        if (node.X > 0) neighbors.Add(grid[node.X - 1, node.Y]);
        if (node.X < w - 1) neighbors.Add(grid[node.X + 1, node.Y]);
        if (node.Y > 0) neighbors.Add(grid[node.X, node.Y - 1]);
        if (node.Y < h - 1) neighbors.Add(grid[node.X, node.Y + 1]);

        return neighbors;
    }

    private static List<DiagramPoint> ReconstructPath(PathNode endNode, DiagramPoint origin, double gridSize)
    {
        var path = new List<DiagramPoint>();
        var current = endNode;
        while (current != null)
        {
            path.Add(new DiagramPoint(origin.X + current.X * gridSize, origin.Y + current.Y * gridSize));
            current = current.Parent;
        }
        path.Reverse();
        return path;
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

    private static List<DiagramPoint> SimplifyPath(List<DiagramPoint> path)
    {
        if (path.Count < 3) return path;
        var simplified = new List<DiagramPoint> { path[0] };
        for (int i = 1; i < path.Count - 1; i++)
        {
            var p_prev = simplified.Last();
            var p_curr = path[i];
            var p_next = path[i + 1];
            const double tolerance = 1e-5;
            bool isCollinear =
                (Math.Abs(p_prev.X - p_curr.X) < tolerance && Math.Abs(p_curr.X - p_next.X) < tolerance) ||
                (Math.Abs(p_prev.Y - p_curr.Y) < tolerance && Math.Abs(p_curr.Y - p_next.Y) < tolerance);
            if (!isCollinear)
            {
                simplified.Add(p_curr);
            }
        }
        simplified.Add(path.Last());
        return simplified;
    }

    #endregion
}