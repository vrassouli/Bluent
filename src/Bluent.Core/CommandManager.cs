namespace Bluent.Core;

public class CommandManager
{
    private readonly Stack<ICommand> _doneCommands = new();
    private readonly Stack<ICommand> _redoCommands = new();
    private ICommand? _savePoint = null;

    public bool CanUndo => _doneCommands.Count > 0;
    public bool CanRedo => _redoCommands.Count > 0;
    public bool HasChanges
    {
        get
        {
            if (_doneCommands.Count == 0)
                return _savePoint != null;
            
            if (_savePoint == null && _doneCommands.Count > 0)
                return true;
            
            return _savePoint != _doneCommands.Peek();
        }
    }

    public event EventHandler? CommandExecuted;
    public event EventHandler? SavePointChanged;

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

    public void SetSavePoint()
    {
        _savePoint = _doneCommands.Count > 0 ? _doneCommands.Peek() : null;
        SavePointChanged?.Invoke(this, EventArgs.Empty);
    }

    public void Reset()
    {
        _doneCommands.Clear();
        _redoCommands.Clear();
        _savePoint = null;

        SavePointChanged?.Invoke(this, EventArgs.Empty);
    }
}
