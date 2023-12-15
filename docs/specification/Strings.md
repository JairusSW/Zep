# Strings

## Details

**Encoding**

Strings are encoded in Universal Transformation Format 8 (UTF-8)

**Headers**

Strings have a header of two bytes encoded in Little-Endian order which represent the Byte Length of the given string.

```wat
(data (i32.const 0) "\0\25Hi there... Its me, Zep!")
```

This allows for up to 65535 characters in length by default, but if needed, the user may ovveride this limit.
