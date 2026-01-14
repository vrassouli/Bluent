using Bluent.Core;

namespace Bluent.UI.Components.PropertyEditorComponent
{
    public sealed class AddToCollectionCommand<T> : ICommand
    {
        private readonly ICollection<T> _collection;
        private readonly T _value;

        public AddToCollectionCommand(ICollection<T> collection, T value)
        {
            _collection = collection;
            _value = value;
        }
    
        public void Do()
        {
            _collection.Add(_value);
        }

        public void Undo()
        {
            _collection.Remove(_value);
        }
    }
}