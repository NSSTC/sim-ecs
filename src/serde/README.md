# sim-ecs serDe

This is a serializer / deserializer for sim-ecs. It was specifically optimized for usage in this ECS.


## Serial Format

The serial format is typed as `Array<TEntity>`. Note that `TEntity`, as opposed to `IEntity`, 
is a `Record<string, unknown>` of all components on the entity in their _serialized_ form.

It's also important to note that resources are converted to a `TEntity` and will always be stored
on **index 0** of the serial format.
