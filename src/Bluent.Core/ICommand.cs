namespace Bluent.Core;

public interface ICommand
{
    void Do();
    void Undo();
}
