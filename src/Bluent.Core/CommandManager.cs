namespace Bluent.Core;

public class CommandManager
{
    private Stack<ICommand> _doneCommands = new();
    private Stack<ICommand> _redoCommands = new();

    public bool CanUndo => _doneCommands.Count > 0;
    public bool CanRedo => _redoCommands.Count > 0;

    public event EventHandler? CommandExecuted;

    public void Do(ICommand command)
    {
        command.Do();

        _doneCommands.Push(command);
        _redoCommands.Clear();

        CommandExecuted?.Invoke(this, EventArgs.Empty);
    }

    public void Undo()
    {
        var cmd = _doneCommands.Pop();
     
        cmd.Undo();
        _redoCommands.Push(cmd);
  
        CommandExecuted?.Invoke(this, EventArgs.Empty);
    }

    public void Redo()
    {
        var cmd = _redoCommands.Pop();

        cmd.Do();
        _doneCommands.Push(cmd);

        CommandExecuted?.Invoke(this, EventArgs.Empty);
    }
}
