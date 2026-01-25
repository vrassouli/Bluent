namespace Bluent.Core.Utilities;

public class BatchCommand : ICommand
{
    private readonly List<ICommand> _commands = [];

    public void AddCommand(ICommand? command)
    {
        if (command == null)
            return;
        
        _commands.Add(command);
    }

    public void Do()
    {
        foreach (var cmd in _commands)
        {
            cmd.Do();
        }
    }

    public void Undo()
    {
        foreach (var cmd in _commands)
        {
            cmd.Undo();
        }
    }
}