  'use strict';

  // A WrappedOperation contains an operation, selection and metadata.
  function WrappedOperation (operation, selection, metadata) {
    this.wrapped = operation;
    this.selection = selection;
    this.metadata = metadata;
  }

  WrappedOperation.prototype.apply = function () {
    return this.wrapped.apply.apply(this.wrapped, arguments);
  };

  WrappedOperation.prototype.invert = function () {
    var selection = this.selection;
    return new WrappedOperation(
      this.wrapped.invert.apply(this.wrapped, arguments),
      selection && typeof selection === 'object' && typeof selection.invert === 'function' ?
        selection.invert.apply(selection, arguments) : selection
    );
  };

  // Copy all properties from source to target.
  function copy (source, target) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }

  function composeSelection (a, b) {
    if (a && typeof a === 'object') {
      if (typeof a.compose === 'function') { return a.compose(b); }
      var selection = {};
      copy(a, selection);
      copy(b, selection);
      return selection;
    }
    return b;
  }

  WrappedOperation.prototype.compose = function (other) {
    return new WrappedOperation(
      this.wrapped.compose(other.wrapped),
      composeSelection(this.selection, other.selection)
    );
  };

  function transformSelection (selection, operation) {
    if (selection && typeof selection === 'object') {
      if (typeof selection.transform === 'function') {
        return selection.transform(operation);
      }
    }
    return selection;
  }

  WrappedOperation.transform = function (a, b) {
    var transform = a.wrapped.constructor.transform;
    var pair = transform(a.wrapped, b.wrapped);
    return [
      new WrappedOperation(pair[0], transformSelection(a.selection, b.wrapped)),
      new WrappedOperation(pair[1], transformSelection(b.selection, a.wrapped))
    ];
  };

module.exports = WrappedOperation;