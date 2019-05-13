/**
 * This is a standard javascript object {} used as a map of
 * string -> object of the given type.
 *
 * example: var a = {name1:12, name2:343} would be defined as a JSMap&lt;number&gt;
 *
 */
export interface JSMap<T> { [key: string]: T; }
