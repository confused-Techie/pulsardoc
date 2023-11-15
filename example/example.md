# Clipboard

> Extended

Represents the clipboard used for copying and pasting in Pulsar.

 An instance of this class is always available as the `atom.clipboard` global.

## Examples

```js
 atom.clipboard.write('hello')

 console.log(atom.clipboard.read()) // 'hello'
```


### Instance Methods

<details>
    <summary>`md5()`:  Creates an `md5` hash of some text.</summary>
<br/>
 Creates an `md5` hash of some text.

### Parameters

* `text` (Required) - String

  A {String} to hash. Returns a hashed {String}.




</details>
<br/>
<details>
    <summary>`write()`: Write the given text to the clipboard.</summary>
<br/>
Write the given text to the clipboard.

 The metadata associated with the text is available by calling
 {::readWithMetadata}.

### Parameters

* `text` (Required) - String

  The {String} to store.




</details>
<br/>
<details>
    <summary>`read()`: Read the text from the clipboard.</summary>
<br/>
Read the text from the clipboard.


### Returns

Returns a {String}.


</details>
<br/>
<details>
    <summary>`writeFindText()`: Write the given text to the macOS find pasteboard</summary>
<br/>
Write the given text to the macOS find pasteboard


</details>
<br/>
<details>
    <summary>`readFindText()`: Read the text from the macOS find pasteboard.</summary>
<br/>
Read the text from the macOS find pasteboard.


### Returns

Returns a {String}.


</details>
<br/>
<details>
    <summary>`readWithMetadata()`: Read the text from the clipboard and return both the text and the
 associated metadata.</summary>
<br/>
Read the text from the clipboard and return both the text and the
 associated metadata.


### Returns

Returns an {Object} with the following keys:

* `text` The {String} clipboard text.
* `metadata` The metadata stored by an earlier call to {::write}


</details>


### Instance Properties

* `clipboard`

  A {Clipboard} instance.

